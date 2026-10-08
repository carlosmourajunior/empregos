from datetime import date

from django.db import transaction
from rest_framework import serializers

from .models import Curriculo, Experiencia

MAX_AREAS = 3
MAX_EXPERIENCIAS = 3


def limpar_areas(areas):
    """Tira espaços e repetidos (sem diferenciar maiúsculas) e limita a quantidade."""
    vistas, limpas = set(), []
    for area in areas:
        area = " ".join(str(area).split())[:60]
        if area and area.lower() not in vistas:
            vistas.add(area.lower())
            limpas.append(area)
    if len(limpas) > MAX_AREAS:
        raise serializers.ValidationError(f"Escolha no máximo {MAX_AREAS} áreas.")
    return limpas


class ExperienciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiencia
        fields = ["o_que_fazia", "onde", "quanto_tempo"]


class CurriculoSerializer(serializers.ModelSerializer):
    experiencias = ExperienciaSerializer(many=True, required=False)
    areas_interesse = serializers.ListField(child=serializers.CharField(), allow_empty=False)

    class Meta:
        model = Curriculo
        fields = [
            "data_nascimento",
            "bairro",
            "escolaridade",
            "areas_interesse",
            "tem_cnh",
            "categoria_cnh",
            "experiencias",
            "atualizado_em",
        ]
        read_only_fields = ["atualizado_em"]

    def validate_areas_interesse(self, areas):
        return limpar_areas(areas)

    def validate_bairro(self, bairro):
        return " ".join(bairro.split())

    def validate_data_nascimento(self, nascimento):
        hoje = date.today()
        idade = hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))
        if not 14 <= idade <= 100:
            raise serializers.ValidationError("Confira a data de nascimento.")
        return nascimento

    def validate_experiencias(self, experiencias):
        if len(experiencias) > MAX_EXPERIENCIAS:
            raise serializers.ValidationError(f"Coloque no máximo {MAX_EXPERIENCIAS} experiências.")
        return experiencias

    def validate(self, dados):
        if not dados.get("tem_cnh"):
            dados["categoria_cnh"] = ""
        return dados

    @transaction.atomic
    def save(self, **kwargs):
        experiencias = self.validated_data.pop("experiencias", None)
        curriculo = super().save(**kwargs)
        if experiencias is not None:
            curriculo.experiencias.all().delete()
            Experiencia.objects.bulk_create(Experiencia(curriculo=curriculo, **e) for e in experiencias)
        return curriculo
