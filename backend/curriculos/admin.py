from django.contrib import admin
from .models import (
    Curriculo, Escolaridade, ExperienciaProfissional,
    Habilidade, Curso, Idioma, TipoVagaProcurada
)

class EscolaridadeInline(admin.TabularInline):
    model = Escolaridade
    extra = 1

class ExperienciaInline(admin.TabularInline):
    model = ExperienciaProfissional
    extra = 1

class HabilidadeInline(admin.TabularInline):
    model = Habilidade
    extra = 1

class CursoInline(admin.TabularInline):
    model = Curso
    extra = 1

class IdiomaInline(admin.TabularInline):
    model = Idioma
    extra = 1

@admin.register(Curriculo)
class CurriculoAdmin(admin.ModelAdmin):
    list_display = ('trabalhador', 'data_criacao', 'data_atualizacao')
    list_filter = ('data_criacao', 'data_atualizacao')
    search_fields = ('trabalhador__first_name', 'trabalhador__last_name', 'objetivo')
    inlines = [EscolaridadeInline, ExperienciaInline, HabilidadeInline, CursoInline, IdiomaInline]

@admin.register(TipoVagaProcurada)
class TipoVagaProcuradaAdmin(admin.ModelAdmin):
    list_display = ('curriculo', 'tipo_contrato', 'jornada_trabalho', 'salario_minimo')
    list_filter = ('tipo_contrato', 'jornada_trabalho')
