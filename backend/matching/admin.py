from django.contrib import admin
from .models import MatchingResult, HistoricoMatching

@admin.register(MatchingResult)
class MatchingResultAdmin(admin.ModelAdmin):
    list_display = ('trabalhador', 'vaga', 'score_total', 'data_calculo')
    list_filter = ('data_calculo', 'score_total')
    search_fields = ('trabalhador__first_name', 'trabalhador__last_name', 'vaga__titulo')
    ordering = ['-score_total']

@admin.register(HistoricoMatching)
class HistoricoMatchingAdmin(admin.ModelAdmin):
    list_display = ('vaga', 'total_candidatos', 'candidatos_compatíveis', 'score_medio', 'data_execucao')
    list_filter = ('data_execucao',)
    search_fields = ('vaga__titulo',)
    date_hierarchy = 'data_execucao'
