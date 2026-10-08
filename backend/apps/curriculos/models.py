from django.conf import settings
from django.db import models


class Curriculo(models.Model):
    """O próprio cadastro é o currículo. Nome, CPF e telefone vêm do usuário."""

    class Escolaridade(models.TextChoices):
        NENHUMA = "nenhuma", "Não estudei"
        FUNDAMENTAL = "fundamental", "Fundamental"
        MEDIO = "medio", "Médio"
        TECNICO = "tecnico", "Técnico"
        SUPERIOR = "superior", "Superior"

    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="curriculo")
    data_nascimento = models.DateField()
    bairro = models.CharField(max_length=80)
    escolaridade = models.CharField(max_length=12, choices=Escolaridade.choices)
    areas_interesse = models.JSONField("áreas de interesse", default=list, help_text="Até 3, texto livre.")
    tem_cnh = models.BooleanField("tem CNH", default=False)
    categoria_cnh = models.CharField("categoria da CNH", max_length=5, blank=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "currículo"

    def __str__(self):
        return f"Currículo de {self.usuario}"


class Experiencia(models.Model):
    curriculo = models.ForeignKey(Curriculo, on_delete=models.CASCADE, related_name="experiencias")
    o_que_fazia = models.CharField("o que fazia", max_length=120)
    onde = models.CharField(max_length=120)
    quanto_tempo = models.CharField("quanto tempo", max_length=40)

    class Meta:
        verbose_name = "experiência"

    def __str__(self):
        return f"{self.o_que_fazia} em {self.onde}"
