#!/usr/bin/env python
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Buscar o usuário admin
try:
    admin_user = User.objects.get(username='admin')
    # Definir uma senha conhecida
    admin_user.set_password('admin123')
    admin_user.save()
    print("Senha do admin definida como: admin123")
    print("Username: admin")
    print("Email:", admin_user.email)
except User.DoesNotExist:
    print("Usuário admin não encontrado")
