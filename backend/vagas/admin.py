from django.contrib import admin
from .models import Vaga, RequisitoVaga, CandidaturaVaga, AvaliacaoCandidato

class RequisitoVagaInline(admin.TabularInline):
    model = RequisitoVaga
    extra = 1

@admin.register(Vaga)
class VagaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'empresa', 'area', 'nivel_experiencia', 'status', 'data_criacao')
    list_filter = ('status', 'area', 'nivel_experiencia', 'tipo_contrato', 'data_criacao')
    search_fields = ('titulo', 'empresa__perfil_empresa__nome_empresa', 'descricao')
    inlines = [RequisitoVagaInline]
    date_hierarchy = 'data_criacao'

@admin.register(CandidaturaVaga)
class CandidaturaVagaAdmin(admin.ModelAdmin):
    list_display = ('trabalhador', 'vaga', 'status', 'score_compatibilidade', 'data_candidatura')
    list_filter = ('status', 'data_candidatura')
    search_fields = ('trabalhador__first_name', 'trabalhador__last_name', 'vaga__titulo')
    date_hierarchy = 'data_candidatura'

@admin.register(AvaliacaoCandidato)
class AvaliacaoCandidatoAdmin(admin.ModelAdmin):
    list_display = ('candidatura', 'nota_geral', 'avaliador', 'data_avaliacao')
    list_filter = ('nota_geral', 'data_avaliacao')
    search_fields = ('candidatura__trabalhador__first_name', 'candidatura__vaga__titulo')
