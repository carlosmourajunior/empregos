from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

from .validators import validar_documento


class UsuarioManager(BaseUserManager):
    def create_user(self, documento, nome, telefone, password=None, **extra):
        documento = validar_documento(documento)
        usuario = self.model(documento=documento, nome=nome, telefone=telefone, **extra)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, documento, nome, telefone, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True, tipo=Usuario.Tipo.PREFEITURA, telefone_verificado=True)
        return self.create_user(documento, nome, telefone, password, **extra)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """Login por CPF (candidato e prefeitura) ou CNPJ (empresa), sempre só com dígitos."""

    class Tipo(models.TextChoices):
        CANDIDATO = "candidato", "Candidato"
        EMPRESA = "empresa", "Empresa"
        PREFEITURA = "prefeitura", "Prefeitura"

    documento = models.CharField("CPF ou CNPJ", max_length=14, unique=True)
    nome = models.CharField(max_length=150)
    telefone = models.CharField("telefone (WhatsApp)", max_length=13)
    tipo = models.CharField(max_length=10, choices=Tipo.choices, default=Tipo.CANDIDATO)
    telefone_verificado = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "documento"
    REQUIRED_FIELDS = ["nome", "telefone"]

    class Meta:
        verbose_name = "usuário"

    def __str__(self):
        return self.nome

    @property
    def documento_mascarado(self):
        """CPF nunca aparece inteiro para empresas (LGPD)."""
        if len(self.documento) == 11:
            return f"***.{self.documento[3:6]}.***-**"
        return self.documento


class CodigoWhatsApp(models.Model):
    """Código de 6 dígitos enviado pelo WhatsApp. Guardamos só o hash."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="codigos")
    codigo_hash = models.CharField(max_length=128)
    criado_em = models.DateTimeField(auto_now_add=True)
    tentativas = models.PositiveSmallIntegerField(default=0)
    usado = models.BooleanField(default=False)

    class Meta:
        ordering = ["-criado_em"]

    def __str__(self):
        return f"Código de {self.usuario} em {self.criado_em:%d/%m %H:%M}"

    def definir_codigo(self, codigo):
        self.codigo_hash = make_password(codigo)

    @property
    def expirado(self):
        validade = timedelta(minutes=settings.CODIGO_VALIDADE_MINUTOS)
        return timezone.now() > self.criado_em + validade

    def conferir(self, codigo):
        if self.usado or self.expirado or self.tentativas >= settings.CODIGO_MAX_TENTATIVAS:
            return False
        self.tentativas += 1
        ok = check_password(codigo, self.codigo_hash)
        if ok:
            self.usado = True
        self.save(update_fields=["tentativas", "usado"])
        return ok
