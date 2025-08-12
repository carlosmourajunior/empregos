from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    TIPO_USUARIO_CHOICES = [
        ('admin', 'Administrador'),
        ('empresa', 'Empresa'),
        ('trabalhador', 'Trabalhador'),
    ]
    
    tipo_usuario = models.CharField(
        max_length=12,
        choices=TIPO_USUARIO_CHOICES,
        default='trabalhador'
    )
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=15, blank=True)
    cpf_cnpj = models.CharField(max_length=18, unique=True, blank=True)
    aprovado = models.BooleanField(default=False)
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_tipo_usuario_display()})"
    
    def save(self, *args, **kwargs):
        # Admin sempre aprovado
        if self.tipo_usuario == 'admin':
            self.aprovado = True
        super().save(*args, **kwargs)

class PerfilEmpresa(models.Model):
    usuario = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='perfil_empresa')
    nome_empresa = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=18, unique=True)
    endereco = models.TextField()
    site = models.URLField(blank=True)
    descricao = models.TextField()
    setor = models.CharField(max_length=100)
    tamanho_empresa = models.CharField(max_length=50, choices=[
        ('micro', 'Microempresa'),
        ('pequena', 'Pequena'),
        ('media', 'Média'),
        ('grande', 'Grande'),
    ])
    
    def __str__(self):
        return self.nome_empresa

class PerfilTrabalhador(models.Model):
    usuario = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='perfil_trabalhador')
    cpf = models.CharField(max_length=14, unique=True)
    data_nascimento = models.DateField()
    endereco = models.TextField()
    tem_habilitacao = models.BooleanField(default=False)
    categoria_habilitacao = models.CharField(max_length=10, blank=True, choices=[
        ('A', 'Categoria A'),
        ('B', 'Categoria B'),
        ('C', 'Categoria C'),
        ('D', 'Categoria D'),
        ('E', 'Categoria E'),
    ])
    linkedin = models.URLField(blank=True)
    foto = models.ImageField(upload_to='fotos_perfil/', blank=True)
    
    def __str__(self):
        return self.usuario.get_full_name()
