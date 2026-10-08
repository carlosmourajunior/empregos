import pytest
from django.core.cache import cache
from rest_framework.test import APIClient

from apps.contas.models import Usuario


@pytest.fixture(autouse=True)
def limpar_cache():
    """O limite de tentativas usa o cache; cada teste começa do zero."""
    cache.clear()


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def candidato(db):
    return Usuario.objects.create_user("52998224725", "Maria", "5511988887777", "segredo123", telefone_verificado=True)


@pytest.fixture
def empresa(db):
    return Usuario.objects.create_user(
        "11222333000181", "Padaria Pão Bom", "5511977776666", "segredo123", tipo="empresa", telefone_verificado=True
    )
