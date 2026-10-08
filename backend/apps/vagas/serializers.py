from datetime import date

from rest_framework import serializers

from apps.curriculos.serializers import ExperienciaSerializer

from .models import Interesse, Vaga


def _texto(valor):
    return " ".join(valor.split())


class VagaPublicaSerializer(serializers.ModelSerializer):
    """O que qualquer pessoa vê de uma vaga aprovada. Nada de contato da empresa."""

    empresa = serializers.CharField(source="empresa.nome", read_only=True)
    contrato_nome = serializers.CharField(source="get_contrato_display", read_only=True)
    horario_nome = serializers.CharField(source="get_horario_display", read_only=True)
    tenho_interesse = serializers.SerializerMethodField()

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
            "empresa",
            "criada_em",
            "tenho_interesse",
        ]

    def get_tenho_interesse(self, vaga):
        ids = self.context.get("ids_com_interesse")
        return ids is not None and vaga.id in ids


class VagaEmpresaSerializer(serializers.ModelSerializer):
    """Vaga vista e editada pela empresa dona dela."""

    status_nome = serializers.CharField(source="get_status_display", read_only=True)
    interessados = serializers.IntegerField(source="interesses.count", read_only=True)

    class Meta:
        model = Vaga
        fields = [
            "id",
            "cargo",
            "area",
            "descricao",
            "salario",
            "contrato",
            "horario",
            "bairro",
            "quantidade",
            "status",
            "status_nome",
            "interessados",
            "motivo_recusa",
            "criada_em",
        ]
        read_only_fields = ["status", "motivo_recusa", "criada_em"]

    def validate_cargo(self, valor):
        return _texto(valor)

    def validate_area(self, valor):
        return _texto(valor)

    def validate_bairro(self, valor):
        return _texto(valor)

    def validate_quantidade(self, valor):
        if valor < 1:
            raise serializers.ValidationError("Pelo menos 1 vaga.")
        return valor

    def validate_salario(self, valor):
        if valor is not None and valor <= 0:
            raise serializers.ValidationError("Deixe em branco se for a combinar.")
        return valor

    def update(self, vaga, dados):
        # Vaga editada volta para aprovação, para ninguém trocar o anúncio depois de aprovado.
        dados["status"] = Vaga.Status.PENDENTE
        dados["avaliada_por"] = None
        dados["avaliada_em"] = None
        dados["motivo_recusa"] = ""
        return super().update(vaga, dados)


class InteressadoSerializer(serializers.ModelSerializer):
    """Candidato que demonstrou interesse, visto pela empresa (CPF mascarado, LGPD)."""

    nome = serializers.CharField(source="candidato.nome")
    telefone = serializers.CharField(source="candidato.telefone")
    cpf = serializers.CharField(source="candidato.documento_mascarado")
    idade = serializers.SerializerMethodField()
    bairro = serializers.CharField(source="candidato.curriculo.bairro", default="")
    escolaridade = serializers.CharField(source="candidato.curriculo.get_escolaridade_display", default="")
    areas_interesse = serializers.ListField(source="candidato.curriculo.areas_interesse", default=list)
    tem_cnh = serializers.BooleanField(source="candidato.curriculo.tem_cnh", default=False)
    categoria_cnh = serializers.CharField(source="candidato.curriculo.categoria_cnh", default="")
    experiencias = ExperienciaSerializer(source="candidato.curriculo.experiencias", many=True, default=list)

    class Meta:
        model = Interesse
        fields = [
            "id",
            "criado_em",
            "nome",
            "telefone",
            "cpf",
            "idade",
            "bairro",
            "escolaridade",
            "areas_interesse",
            "tem_cnh",
            "categoria_cnh",
            "experiencias",
        ]

    def get_idade(self, interesse):
        curriculo = getattr(interesse.candidato, "curriculo", None)
        if not curriculo:
            return None
        hoje, nasc = date.today(), curriculo.data_nascimento
        return hoje.year - nasc.year - ((hoje.month, hoje.day) < (nasc.month, nasc.day))
