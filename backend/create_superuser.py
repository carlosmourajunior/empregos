from django.contrib.auth import get_user_model

User = get_user_model()

# Criar superusuário se não existir
if not User.objects.filter(username='admin').exists():
    user = User.objects.create_superuser(
        username='admin',
        email='admin@prefeitura.gov.br', 
        password='admin123'
    )
    print("Superusuário criado com sucesso!")
    print("Username: admin")
    print("Password: admin123")
    print("Email: admin@prefeitura.gov.br")
else:
    # Se já existe, apenas atualizar a senha
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.save()
    print("Senha do superusuário atualizada!")
    print("Username: admin")
    print("Password: admin123")
    print("Email:", user.email)
