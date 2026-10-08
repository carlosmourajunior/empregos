from django.conf import settings
from django.db import models


class Vaga(models.Model):
    class Contrato(models.TextChoices):
        CLT = "clt", "CLT"
        TEMPORARIO = "temporario", "Temporário"
        DIARISTA = "diarista", "Diarista"
        ESTAGIO = "estagio", "Estágio"

    class Horario(models.TextChoices):
        MANHA = "manha", "Manhã"
        TARDE = "tarde", "Tarde"
        NOITE = "noite", "Noite"
        INTEGRAL = "integral", "Integral"
        ESCALA = "escala", "Escala"

    class Status(models.TextChoices):
        PENDENTE = "pendente", "Aguardando aprovação"
        APROVADA = "aprovada", "Aprovada"
        RECUSADA = "recusada", "Recusada"
        ENCERRADA = "encerrada", "Encerrada"

    empresa = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vagas")
    cargo = models.CharField(max_length=80)
    area = models.CharField("área", max_length=60)
    descricao = models.CharField("o que vai fazer", max_length=300)
    salario = models.DecimalField(
        max_digits=9, decimal_places=2, null=True, blank=True, help_text="Vazio = a combinar."
    )
    contrato = models.CharField(max_length=10, choices=Contrato.choices)
    horario = models.CharField("horário", max_length=10, choices=Horario.choices)
    bairro = models.CharField(max_length=80)
    quantidade = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDENTE)
    avaliada_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    avaliada_em = models.DateTimeField(null=True, blank=True)
    criada_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-criada_em"]
        permissions = [("aprovar_vaga", "Pode aprovar ou recusar vagas")]

    def __str__(self):
        return self.cargo


class Interesse(models.Model):
    """Candidato clicou em "Tenho interesse". Só aí a empresa vê o contato dele."""

    vaga = models.ForeignKey(Vaga, on_delete=models.CASCADE, related_name="interesses")
    candidato = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="interesses")
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["vaga", "candidato"], name="interesse_unico")]

    def __str__(self):
        return f"{self.candidato} → {self.vaga}"
