from django.core.exceptions import ValidationError as ErroDjango
from django.db import transaction
from rest_framework import serializers

from apps.contas.models import Usuario
from apps.contas.validators import normalizar_telefone, so_digitos
from apps.curriculos.models import Curriculo
from apps.curriculos.serializers import CurriculoSerializer
from apps.vagas.models import Vaga
from apps.vagas.serializers import VagaEmpresaSerializer


class VagaPainelSerializer(serializers.ModelSerializer):
    empresa_id = serializers.IntegerField(source="empresa.id", read_only=True)
    empresa = serializers.CharField(source="empresa.nome", read_only=True)
    empresa_cnpj = serializers.CharField(source="empresa.documento", read_only=True)
    empresa_telefone = serializers.CharField(source="empresa.telefone", read_only=True)
    empresa_bloqueada = serializers.SerializerMethodField()
    contrato_nome = serializers.CharField(source="get_contrato_display", read_only=True)
    horario_nome = serializers.CharField(source="get_horario_display", read_only=True)
    status_nome = serializers.CharField(source="get_status_display", read_only=True)
    avaliada_por = serializers.CharField(source="avaliada_por.nome", default=None, read_only=True)
    interessados = serializers.IntegerField(read_only=True)

    class Meta:
        model = Vaga
        fields = [
            "id",
            "cargo",
            "area",
            "descricao",
            "salario",
            "contrato",
            "contrato_nome",
            "horario",
            "horario_nome",
            "bairro",
            "quantidade",
            "status",
            "status_nome",
            "motivo_recusa",
            "avaliada_por",
            "avaliada_em",
            "criada_em",
            "interessados",
            "empresa_id",
            "empresa",
            "empresa_cnpj",
            "empresa_telefone",
            "empresa_bloqueada",
        ]

    def get_empresa_bloqueada(self, vaga):
        return not vaga.empresa.is_active


class AvaliarSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField(), min_length=1, max_length=200)
    decisao = serializers.ChoiceField(choices=["aprovar", "recusar"])
    motivo = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")

    def validate(self, dados):
        dados["motivo"] = " ".join(dados["motivo"].split())
        if dados["decisao"] == "recusar" and not dados["motivo"]:
            raise serializers.ValidationError({"motivo": "Diga o motivo, a empresa vai ver."})
        return dados


class EmpresaPainelSerializer(serializers.ModelSerializer):
    bloqueada = serializers.SerializerMethodField()
    vagas_abertas = serializers.IntegerField(read_only=True)
    vagas_total = serializers.IntegerField(read_only=True)

    class Meta:
        model = Usuario
        fields = ["id", "nome", "documento", "telefone", "criado_em", "bloqueada", "vagas_abertas", "vagas_total"]

    def get_bloqueada(self, empresa):
        return not empresa.is_active


class MembroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "nome", "documento", "telefone"]


class NovoMembroSerializer(serializers.Serializer):
    documento = serializers.CharField()

    def validate_documento(self, valor):
        documento = so_digitos(valor)
        usuario = Usuario.objects.filter(documento=documento, is_active=True).first()
        if len(documento) != 11 or not usuario:
            raise serializers.ValidationError("Não achamos ninguém com esse CPF. A pessoa precisa criar a conta antes.")
        return usuario


class VagaEdicaoSerializer(VagaEmpresaSerializer):
    """A prefeitura corrige o anúncio sem mudar a situação dele (aprovada continua aprovada)."""

    def update(self, vaga, dados):
        return super(VagaEmpresaSerializer, self).update(vaga, dados)


class ContaEdicaoSerializer(serializers.ModelSerializer):
    """Nome e WhatsApp de uma empresa ou candidato, corrigidos pela prefeitura."""

    telefone = serializers.CharField(max_length=30)

    class Meta:
        model = Usuario
        fields = ["nome", "telefone"]

    def validate_nome(self, valor):
        valor = " ".join(valor.split())
        if len(valor) < 2:
            raise serializers.ValidationError("Escreva o nome.")
        return valor

    def validate_telefone(self, valor):
        try:
            return normalizar_telefone(valor)
        except ErroDjango as erro:
            raise serializers.ValidationError(erro.messages[0]) from erro

    def update(self, conta, dados):
        # Número novo precisa ser confirmado de novo: no próximo login chega um código nele.
        if "telefone" in dados and dados["telefone"] != conta.telefone:
            conta.telefone_verificado = False
        return super().update(conta, dados)


class CandidatoPainelSerializer(serializers.ModelSerializer):
    curriculo = serializers.SerializerMethodField()
    interesses = serializers.IntegerField(source="total_interesses", read_only=True)

    class Meta:
        model = Usuario
        fields = ["id", "nome", "documento", "telefone", "criado_em", "interesses", "curriculo"]

    def get_curriculo(self, candidato):
        curriculo = getattr(candidato, "curriculo", None)
        return CurriculoSerializer(curriculo).data if curriculo else None


class CandidatoEdicaoSerializer(ContaEdicaoSerializer):
    """Conta e currículo de uma vez. Sem `curriculo`, só a conta muda."""

    curriculo = CurriculoSerializer(required=False)

    class Meta(ContaEdicaoSerializer.Meta):
        fields = ["nome", "telefone", "curriculo"]

    @transaction.atomic
    def update(self, candidato, dados):
        dados_curriculo = dados.pop("curriculo", None)
        candidato = super().update(candidato, dados)
        if dados_curriculo is not None:
            existente = Curriculo.objects.filter(usuario=candidato).first()
            curriculo = CurriculoSerializer(existente, data=self.initial_data["curriculo"])
            curriculo.is_valid(raise_exception=True)
            curriculo.save(usuario=candidato)
        return candidato
