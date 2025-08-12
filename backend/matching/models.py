from django.db import models
from usuarios.models import CustomUser
from vagas.models import Vaga
from curriculos.models import Curriculo

class MatchingResult(models.Model):
    vaga = models.ForeignKey(Vaga, on_delete=models.CASCADE, related_name='matches')
    trabalhador = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='matches')
    score_total = models.FloatField()
    score_experiencia = models.FloatField()
    score_habilidades = models.FloatField()
    score_escolaridade = models.FloatField()
    score_localizacao = models.FloatField()
    score_salario = models.FloatField()
    detalhes_matching = models.JSONField(default=dict)
    data_calculo = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('vaga', 'trabalhador')
        ordering = ['-score_total']
    
    def __str__(self):
        return f"Match: {self.trabalhador.get_full_name()} x {self.vaga.titulo} ({self.score_total:.2f})"

class HistoricoMatching(models.Model):
    vaga = models.ForeignKey(Vaga, on_delete=models.CASCADE)
    total_candidatos = models.IntegerField()
    candidatos_compatíveis = models.IntegerField()
    score_medio = models.FloatField()
    data_execucao = models.DateTimeField(auto_now_add=True)
    parametros_utilizados = models.JSONField(default=dict)
    
    def __str__(self):
        return f"Histórico: {self.vaga.titulo} - {self.data_execucao}"
