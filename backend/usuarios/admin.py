from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, PerfilEmpresa, PerfilTrabalhador

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'tipo_usuario', 'aprovado', 'ativo', 'date_joined')
    list_filter = ('tipo_usuario', 'aprovado', 'ativo', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'cpf_cnpj')
    ordering = ('-date_joined',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {
            'fields': ('tipo_usuario', 'telefone', 'cpf_cnpj', 'aprovado', 'ativo')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informações Adicionais', {
            'fields': ('email', 'tipo_usuario', 'telefone', 'cpf_cnpj', 'first_name', 'last_name')
        }),
    )
    
    actions = ['aprovar_usuarios', 'desaprovar_usuarios', 'ativar_usuarios', 'desativar_usuarios']
    
    def aprovar_usuarios(self, request, queryset):
        queryset.update(aprovado=True)
        self.message_user(request, f'{queryset.count()} usuários aprovados com sucesso.')
    aprovar_usuarios.short_description = "Aprovar usuários selecionados"
    
    def desaprovar_usuarios(self, request, queryset):
        queryset.update(aprovado=False)
        self.message_user(request, f'{queryset.count()} usuários desaprovados com sucesso.')
    desaprovar_usuarios.short_description = "Desaprovar usuários selecionados"
    
    def ativar_usuarios(self, request, queryset):
        queryset.update(ativo=True)
        self.message_user(request, f'{queryset.count()} usuários ativados com sucesso.')
    ativar_usuarios.short_description = "Ativar usuários selecionados"
    
    def desativar_usuarios(self, request, queryset):
        queryset.update(ativo=False)
        self.message_user(request, f'{queryset.count()} usuários desativados com sucesso.')
    desativar_usuarios.short_description = "Desativar usuários selecionados"

@admin.register(PerfilEmpresa)
class PerfilEmpresaAdmin(admin.ModelAdmin):
    list_display = ('nome_empresa', 'cnpj', 'setor', 'tamanho_empresa', 'usuario')
    list_filter = ('setor', 'tamanho_empresa')
    search_fields = ('nome_empresa', 'cnpj', 'usuario__email')

@admin.register(PerfilTrabalhador)
class PerfilTrabalhadorAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'cpf', 'data_nascimento', 'tem_habilitacao', 'categoria_habilitacao')
    list_filter = ('tem_habilitacao', 'categoria_habilitacao')
    search_fields = ('usuario__first_name', 'usuario__last_name', 'cpf')
