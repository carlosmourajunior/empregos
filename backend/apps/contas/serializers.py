from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Usuario
from .validators import normalizar_telefone, so_digitos, validar_documento


def _campo(validador, valor):
    try:
        return validador(valor)
    except DjangoValidationError as erro:
        raise serializers.ValidationError(erro.messages) from erro


class CadastroSerializer(serializers.ModelSerializer):
    # Declarados à mão para aceitar pontos, traços e parênteses; a limpeza é feita nos validate_*.
    documento = serializers.CharField()
    telefone = serializers.CharField()
    senha = serializers.CharField(write_only=True)
    tipo = serializers.ChoiceField(choices=[Usuario.Tipo.CANDIDATO, Usuario.Tipo.EMPRESA])

    class Meta:
        model = Usuario
        fields = ["documento", "nome", "telefone", "tipo", "senha"]

    def validate_documento(self, valor):
        documento = _campo(validar_documento, valor)
        if Usuario.objects.filter(documento=documento).exists():
            raise serializers.ValidationError("Já existe uma conta com este documento.")
        return documento

    def validate_telefone(self, valor):
        return _campo(normalizar_telefone, valor)

    def validate_senha(self, valor):
        _campo(validate_password, valor)
        return valor

    def validate(self, dados):
        tamanho = 11 if dados["tipo"] == Usuario.Tipo.CANDIDATO else 14
        if len(dados["documento"]) != tamanho:
            esperado = "CPF" if tamanho == 11 else "CNPJ"
            raise serializers.ValidationError({"documento": f"Use o {esperado}."})
        return dados

    def create(self, dados):
        senha = dados.pop("senha")
        return Usuario.objects.create_user(password=senha, **dados)


class LoginSerializer(serializers.Serializer):
    documento = serializers.CharField()
    senha = serializers.CharField()

    def validate_documento(self, valor):
        return so_digitos(valor)


class DocumentoSerializer(serializers.Serializer):
    documento = serializers.CharField()

    def validate_documento(self, valor):
        return so_digitos(valor)


class VerificarCodigoSerializer(DocumentoSerializer):
    codigo = serializers.RegexField(r"^\d{6}$", error_messages={"invalid": "O código tem 6 números."})


class UsuarioSerializer(serializers.ModelSerializer):
    permissoes = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ["id", "nome", "documento", "telefone", "tipo", "telefone_verificado", "permissoes"]

    def get_permissoes(self, usuario):
        return {"aprovar_vagas": usuario.has_perm("vagas.aprovar_vaga")}
