from rest_framework import serializers

from apps.contas.models import Usuario
from apps.contas.validators import so_digitos
from apps.vagas.models import Vaga


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
            "contrato_nome",
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
