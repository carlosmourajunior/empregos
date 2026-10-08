from unittest.mock import patch

import pytest
from django.contrib.auth.models import Permission

from apps.contas.models import Usuario
from apps.contas.validators import cnpj_valido, cpf_valido

CPF = "52998224725"
CNPJ = "11222333000181"


@pytest.fixture
def codigos_enviados():
    enviados = []
    with patch("apps.contas.whatsapp.enviar_mensagem", side_effect=lambda numero, texto: enviados.append(texto)):
        yield enviados


def ultimo_codigo(enviados):
    return enviados[-1].split("código é ")[1][:6]


def cadastrar(api, **extra):
    dados = {"documento": "529.982.247-25", "nome": "Maria", "telefone": "(11) 98888-7777", "tipo": "candidato"}
    dados.update(senha="segredo123", **extra)
    return api.post("/api/auth/cadastro/", dados, format="json")


def test_validadores_de_documento():
    assert cpf_valido(CPF)
    assert not cpf_valido("11111111111")
    assert cnpj_valido(CNPJ)
    assert not cnpj_valido("11222333000180")


@pytest.mark.django_db
def test_cadastro_envia_codigo_e_verificacao_faz_login(api, codigos_enviados):
    resposta = cadastrar(api)
    assert resposta.status_code == 201
    usuario = Usuario.objects.get()
    assert usuario.documento == CPF
    assert usuario.telefone == "5511988887777"
    assert not usuario.telefone_verificado

    resposta = api.post(
        "/api/auth/verificar-codigo/", {"documento": CPF, "codigo": ultimo_codigo(codigos_enviados)}, format="json"
    )
    assert resposta.status_code == 200
    assert resposta.data["telefone_verificado"] is True
    assert api.get("/api/auth/eu/").data["nome"] == "Maria"


@pytest.mark.django_db
def test_codigo_errado_nao_entra(api, codigos_enviados):
    cadastrar(api)
    resposta = api.post("/api/auth/verificar-codigo/", {"documento": CPF, "codigo": "000000"}, format="json")
    assert resposta.status_code == 400
    assert api.get("/api/auth/eu/").status_code == 403


@pytest.mark.django_db
def test_login_exige_telefone_verificado(api, codigos_enviados):
    cadastrar(api)
    resposta = api.post("/api/auth/login/", {"documento": CPF, "senha": "segredo123"}, format="json")
    assert resposta.status_code == 403
    assert resposta.data["codigo"] == "telefone_nao_verificado"


@pytest.mark.django_db
def test_login_com_cpf_e_senha(api):
    Usuario.objects.create_user(CPF, "Maria", "5511988887777", "segredo123", telefone_verificado=True)
    resposta = api.post("/api/auth/login/", {"documento": "529.982.247-25", "senha": "segredo123"}, format="json")
    assert resposta.status_code == 200
    assert resposta.data["permissoes"] == {"aprovar_vagas": False}


@pytest.mark.django_db
def test_empresa_usa_cnpj(api, codigos_enviados):
    assert cadastrar(api, documento=CNPJ, tipo="empresa").status_code == 201
    assert cadastrar(api, documento=CPF, tipo="empresa").status_code == 400


@pytest.mark.django_db
def test_documento_duplicado(api, codigos_enviados):
    cadastrar(api)
    assert cadastrar(api).status_code == 400


@pytest.mark.django_db
def test_permissao_de_aprovador(api):
    usuario = Usuario.objects.create_user(CPF, "Ana", "5511988887777", "segredo123", telefone_verificado=True)
    usuario.user_permissions.add(Permission.objects.get(codename="aprovar_vaga"))
    api.force_authenticate(usuario)
    assert api.get("/api/auth/eu/").data["permissoes"] == {"aprovar_vagas": True}


@pytest.mark.django_db
def test_apagar_conta(api):
    usuario = Usuario.objects.create_user(CPF, "Maria", "5511988887777", "segredo123", telefone_verificado=True)
    api.force_authenticate(usuario)
    assert api.delete("/api/auth/eu/").status_code == 204
    assert not Usuario.objects.exists()


@pytest.mark.django_db
def test_comando_tornar_aprovador():
    from django.core.management import call_command

    usuario = Usuario.objects.create_user(CPF, "Ana", "5511988887777", "segredo123")
    call_command("tornar_aprovador", "529.982.247-25")
    usuario = Usuario.objects.get(pk=usuario.pk)
    assert usuario.tipo == Usuario.Tipo.PREFEITURA
    assert usuario.has_perm("vagas.aprovar_vaga")
