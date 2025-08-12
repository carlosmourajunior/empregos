from django.contrib import admin
from .models import Configuracao

@admin.register(Configuracao)
class ConfiguracaoAdmin(admin.ModelAdmin):
    list_display = ('chave', 'valor', 'data_atualizacao')
    search_fields = ('chave', 'descricao')
    list_filter = ('data_criacao',)
