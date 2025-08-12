from django.db import models

# Models gerais do sistema podem ser adicionados aqui se necessário
class Configuracao(models.Model):
    """Configurações gerais do sistema"""
    chave = models.CharField(max_length=100, unique=True)
    valor = models.TextField()
    descricao = models.TextField(blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.chave
