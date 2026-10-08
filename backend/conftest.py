import pytest
from django.core.cache import cache


@pytest.fixture(autouse=True)
def limpar_cache():
    """O limite de tentativas usa o cache; cada teste começa do zero."""
    cache.clear()
