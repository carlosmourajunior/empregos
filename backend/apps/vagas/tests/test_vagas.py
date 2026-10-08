import pytest

from apps.vagas.models import Vaga

VAGA = {
    "cargo": "Auxiliar de padeiro",
    "area": "Cozinha",
    "descricao": "Ajudar na produção de pães.",
    "salario": "1800.00",
    "contrato": "clt",
    "horario": "manha",
    "bairro": "Centro",
    "quantidade": 2,
}


def criar_vaga(api, empresa, **extra):
    api.force_authenticate(empresa)
    resposta = api.post("/api/minhas-vagas/", {**VAGA, **extra}, format="json")
    assert resposta.status_code == 201, resposta.data
    api.force_authenticate(None)
    return Vaga.objects.get(pk=resposta.data["id"])


def aprovar(vaga):
    vaga.status = Vaga.Status.APROVADA
    vaga.save()


@pytest.mark.django_db
def test_vaga_nova_fica_pendente_e_so_aparece_aprovada(api, empresa):
    vaga = criar_vaga(api, empresa)
    assert vaga.status == Vaga.Status.PENDENTE
    assert api.get("/api/vagas/").data["count"] == 0

    aprovar(vaga)
    dados = api.get("/api/vagas/").data
    assert dados["count"] == 1
    assert dados["results"][0]["empresa"] == "Padaria Pão Bom"
    assert "telefone" not in dados["results"][0]


@pytest.mark.django_db
def test_filtros_da_lista(api, empresa):
    aprovar(criar_vaga(api, empresa))
    aprovar(criar_vaga(api, empresa, cargo="Pedreiro", area="Construção", bairro="Vila Nova"))
    assert api.get("/api/vagas/?area=cozinha").data["count"] == 1
    assert api.get("/api/vagas/?bairro=vila nova").data["count"] == 1
    assert api.get("/api/vagas/?busca=pedr").data["results"][0]["cargo"] == "Pedreiro"


@pytest.mark.django_db
def test_editar_vaga_volta_para_aprovacao(api, empresa):
    vaga = criar_vaga(api, empresa)
    aprovar(vaga)
    api.force_authenticate(empresa)
    resposta = api.patch(f"/api/minhas-vagas/{vaga.id}/", {"quantidade": 3}, format="json")
    assert resposta.data["status"] == "pendente"


@pytest.mark.django_db
def test_interesse_exige_curriculo_e_empresa_ve_contato(api, empresa, candidato):
    vaga = criar_vaga(api, empresa)
    aprovar(vaga)

    api.force_authenticate(candidato)
    resposta = api.post(f"/api/vagas/{vaga.id}/interesse/")
    assert resposta.status_code == 400
    assert resposta.data["codigo"] == "sem_curriculo"

    api.put(
        "/api/curriculo/",
        {"data_nascimento": "1990-05-10", "bairro": "Centro", "escolaridade": "medio", "areas_interesse": ["Cozinha"]},
        format="json",
    )
    assert api.post(f"/api/vagas/{vaga.id}/interesse/").status_code == 201
    assert api.post(f"/api/vagas/{vaga.id}/interesse/").status_code == 201  # repetir não duplica
    assert api.get(f"/api/vagas/{vaga.id}/").data["tenho_interesse"] is True
    assert len(api.get("/api/meus-interesses/").data) == 1

    api.force_authenticate(empresa)
    interessados = api.get(f"/api/minhas-vagas/{vaga.id}/interessados/").data
    assert len(interessados) == 1
    assert interessados[0]["telefone"] == "5511988887777"
    assert interessados[0]["cpf"] == "***.982.***-**"
    assert api.get("/api/minhas-vagas/").data[0]["interessados"] == 1


@pytest.mark.django_db
def test_empresa_so_mexe_nas_proprias_vagas(api, empresa):
    from apps.contas.models import Usuario

    vaga = criar_vaga(api, empresa)
    outra = Usuario.objects.create_user("11444777000161", "Outra", "5511900000000", "segredo123", tipo="empresa")
    api.force_authenticate(outra)
    assert api.get(f"/api/minhas-vagas/{vaga.id}/").status_code == 404
    assert api.get(f"/api/minhas-vagas/{vaga.id}/interessados/").status_code == 404
    assert api.post(f"/api/minhas-vagas/{vaga.id}/encerrar/").status_code == 404


@pytest.mark.django_db
def test_encerrar_vaga_tira_da_lista(api, empresa):
    vaga = criar_vaga(api, empresa)
    aprovar(vaga)
    api.force_authenticate(empresa)
    assert api.post(f"/api/minhas-vagas/{vaga.id}/encerrar/").data["status"] == "encerrada"
    api.force_authenticate(None)
    assert api.get("/api/vagas/").data["count"] == 0


@pytest.mark.django_db
def test_sugestoes(api, empresa, candidato):
    criar_vaga(api, empresa)
    criar_vaga(api, empresa, area="cozinha", bairro="Jardim América")
    resposta = api.get("/api/sugestoes/?campo=area&q=coz")
    assert resposta.data == ["Cozinha"]
    assert api.get("/api/sugestoes/?campo=bairro&q=jar").data == ["Jardim América"]
    assert api.get("/api/sugestoes/?campo=senha").status_code == 400
