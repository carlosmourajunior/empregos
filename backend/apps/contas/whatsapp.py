"""Envio de mensagens pela Evolution API."""

import logging
import secrets

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException

from .models import CodigoWhatsApp

logger = logging.getLogger(__name__)


class ReenvioMuitoCedo(Exception):
    pass


class WhatsAppIndisponivel(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Não conseguimos enviar o código pelo WhatsApp agora. Tente de novo em alguns minutos."
    default_code = "whatsapp_indisponivel"


def enviar_mensagem(numero, texto):
    if not settings.EVOLUTION_URL:
        logger.info("Evolution API não configurada. Mensagem para %s: %s", numero, texto)
        return
    url = f"{settings.EVOLUTION_URL.rstrip('/')}/message/sendText/{settings.EVOLUTION_INSTANCE}"
    try:
        resposta = requests.post(
            url,
            json={"number": numero, "text": texto},
            headers={"apikey": settings.EVOLUTION_API_KEY},
            timeout=10,
        )
        resposta.raise_for_status()
    except requests.RequestException as erro:
        detalhe = getattr(erro.response, "text", "")[:300]
        logger.error("Falha ao enviar WhatsApp pela Evolution API (%s): %s %s", url, erro, detalhe)
        raise WhatsAppIndisponivel() from erro


def enviar_codigo(usuario):
    ultimo = usuario.codigos.first()
    if ultimo:
        segundos = (timezone.now() - ultimo.criado_em).total_seconds()
        if segundos < settings.CODIGO_INTERVALO_REENVIO_SEGUNDOS:
            raise ReenvioMuitoCedo()

    codigo = f"{secrets.randbelow(10**6):06d}"
    # Se o envio falhar, o código não fica salvo e a pessoa pode pedir outro na hora.
    with transaction.atomic():
        registro = CodigoWhatsApp(usuario=usuario)
        registro.definir_codigo(codigo)
        registro.save()
        enviar_mensagem(
            usuario.telefone,
            f"MeuEmprego: seu código é {codigo}. Ele vale por {settings.CODIGO_VALIDADE_MINUTOS} minutos.",
        )
    return registro


def conferir_codigo(usuario, codigo):
    ultimo = usuario.codigos.first()
    return bool(ultimo and ultimo.conferir(codigo))
