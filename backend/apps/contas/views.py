from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Usuario
from .serializers import (
    CadastroSerializer,
    DocumentoSerializer,
    LoginSerializer,
    NovaSenhaSerializer,
    UsuarioSerializer,
    VerificarCodigoSerializer,
)
from .whatsapp import ReenvioMuitoCedo, conferir_codigo, enviar_codigo

MSG_CODIGO_ENVIADO = "Se o cadastro existir, enviamos um código para o seu WhatsApp."


class PublicoView(APIView):
    permission_classes = [AllowAny]


@method_decorator(ensure_csrf_cookie, name="get")
class CsrfView(PublicoView):
    """O frontend chama esta rota uma vez para receber o cookie csrftoken."""

    def get(self, request):
        return Response({"ok": True})


class CadastroView(PublicoView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = CadastroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        enviar_codigo(usuario)
        return Response({"mensagem": "Enviamos um código para o seu WhatsApp."}, status=status.HTTP_201_CREATED)


class EnviarCodigoView(PublicoView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "codigo"

    def post(self, request):
        serializer = DocumentoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = Usuario.objects.filter(documento=serializer.validated_data["documento"], is_active=True).first()
        if usuario:
            try:
                enviar_codigo(usuario)
            except ReenvioMuitoCedo:
                return Response(
                    {"detail": "Espere um minuto antes de pedir outro código."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
        return Response({"mensagem": MSG_CODIGO_ENVIADO})


class VerificarCodigoView(PublicoView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = VerificarCodigoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dados = serializer.validated_data
        usuario = Usuario.objects.filter(documento=dados["documento"], is_active=True).first()
        if not usuario or not conferir_codigo(usuario, dados["codigo"]):
            return Response({"detail": "Código errado ou vencido."}, status=status.HTTP_400_BAD_REQUEST)
        if not usuario.telefone_verificado:
            usuario.telefone_verificado = True
            usuario.save(update_fields=["telefone_verificado"])
        login(request, usuario)
        return Response(UsuarioSerializer(usuario).data)


class NovaSenhaView(PublicoView):
    """Esqueci a senha: o código do WhatsApp (pedido em enviar-codigo/) libera trocar a senha."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = NovaSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dados = serializer.validated_data
        usuario = Usuario.objects.filter(documento=dados["documento"], is_active=True).first()
        if not usuario or not conferir_codigo(usuario, dados["codigo"]):
            return Response({"detail": "Código errado ou vencido."}, status=status.HTTP_400_BAD_REQUEST)
        usuario.set_password(dados["senha"])
        usuario.telefone_verificado = True
        usuario.save(update_fields=["password", "telefone_verificado"])
        login(request, usuario)
        return Response(UsuarioSerializer(usuario).data)


class LoginView(PublicoView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dados = serializer.validated_data
        usuario = authenticate(request, documento=dados["documento"], password=dados["senha"])
        if usuario is None:
            return Response({"detail": "Documento ou senha errados."}, status=status.HTTP_400_BAD_REQUEST)
        if not usuario.telefone_verificado:
            try:
                enviar_codigo(usuario)
            except ReenvioMuitoCedo:
                pass
            return Response(
                {"detail": "Confirme seu telefone com o código do WhatsApp.", "codigo": "telefone_nao_verificado"},
                status=status.HTTP_403_FORBIDDEN,
            )
        login(request, usuario)
        return Response(UsuarioSerializer(usuario).data)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EuView(APIView):
    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)

    def delete(self, request):
        """Apagar minha conta: remove os dados pessoais de verdade (LGPD)."""
        usuario = request.user
        logout(request)
        usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
