#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_emprego.settings')
django.setup()

from django.contrib.auth import get_user_model
from usuarios.models import PerfilEmpresa, PerfilTrabalhador

User = get_user_model()

def create_admin_user():
    """Cria usuário administrador padrão"""
    if not User.objects.filter(email='admin@prefeitura.gov.br').exists():
        admin = User.objects.create_user(
            username='admin',
            email='admin@prefeitura.gov.br',
            password='admin123',
            first_name='Administrador',
            last_name='Sistema',
            tipo_usuario='admin',
            aprovado=True,
            is_staff=True,
            is_superuser=True
        )
        print("✓ Usuário admin criado: admin@prefeitura.gov.br / admin123")
    else:
        print("✓ Usuário admin já existe")

def create_sample_data():
    """Cria dados de exemplo para demonstração"""
    
    # Empresa de exemplo
    if not User.objects.filter(email='empresa@exemplo.com').exists():
        empresa_user = User.objects.create_user(
            username='empresa_exemplo',
            email='empresa@exemplo.com',
            password='empresa123',
            first_name='Empresa',
            last_name='Exemplo',
            tipo_usuario='empresa',
            aprovado=True,
            cpf_cnpj='12.345.678/0001-90'
        )
        
        PerfilEmpresa.objects.create(
            usuario=empresa_user,
            nome_empresa='Empresa Exemplo Ltda',
            cnpj='12.345.678/0001-90',
            endereco='Rua das Empresas, 123 - Centro',
            descricao='Empresa de exemplo para demonstração do sistema',
            setor='Tecnologia',
            tamanho_empresa='media'
        )
        print("✓ Empresa de exemplo criada: empresa@exemplo.com / empresa123")
    
    # Trabalhador de exemplo
    if not User.objects.filter(email='trabalhador@exemplo.com').exists():
        trabalhador_user = User.objects.create_user(
            username='trabalhador_exemplo',
            email='trabalhador@exemplo.com',
            password='trabalhador123',
            first_name='João',
            last_name='Silva',
            tipo_usuario='trabalhador',
            aprovado=True,
            cpf_cnpj='123.456.789-00'
        )
        
        PerfilTrabalhador.objects.create(
            usuario=trabalhador_user,
            cpf='123.456.789-00',
            data_nascimento='1990-01-01',
            endereco='Rua dos Trabalhadores, 456 - Bairro Novo',
            tem_habilitacao=True,
            categoria_habilitacao='B'
        )
        print("✓ Trabalhador de exemplo criado: trabalhador@exemplo.com / trabalhador123")

if __name__ == "__main__":
    print("===== Inicializando dados básicos =====")
    create_admin_user()
    create_sample_data()
    print("===== Inicialização concluída =====")
