#!/usr/bin/env python
import os
import sys
import django

# Adicionar o diretório do projeto ao path
sys.path.append('/app')

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from usuarios.models import CustomUser

try:
    admin = CustomUser.objects.create_user(
        username='admin',
        email='admin@prefeitura.gov.br',
        first_name='Admin',
        last_name='Sistema',
        password='admin123',
        tipo_usuario='admin',
        is_staff=True,
        is_superuser=True
    )
    print('Superusuário criado com sucesso!')
    print('Email: admin@prefeitura.gov.br')
    print('Senha: admin123')
except Exception as e:
    print(f'Erro ao criar superusuário: {e}')
