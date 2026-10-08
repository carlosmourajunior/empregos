import pytest

CURRICULO = {
    "data_nascimento": "1990-05-10",
    "bairro": "  Centro ",
    "escolaridade": "medio",
    "areas_interesse": ["Cozinha", "cozinha", "Limpeza"],
    "tem_cnh": False,
    "categoria_cnh": "B",
    "experiencias": [{"o_que_fazia": "Ajudante de cozinha", "onde": "Restaurante Sabor", "quanto_tempo": "2 anos"}],
}


@pytest.mark.django_db
def test_candidato_preenche_e_atualiza_curriculo(api, candidato):
    api.force_authenticate(candidato)
    assert api.get("/api/curriculo/").status_code == 404

    resposta = api.put("/api/curriculo/", CURRICULO, format="json")
    assert resposta.status_code == 200
    assert resposta.data["bairro"] == "Centro"
    assert resposta.data["areas_interesse"] == ["Cozinha", "Limpeza"]
    assert resposta.data["categoria_cnh"] == ""
    assert len(resposta.data["experiencias"]) == 1

    novo = {**CURRICULO, "experiencias": []}
    assert api.put("/api/curriculo/", novo, format="json").data["experiencias"] == []


@pytest.mark.django_db
def test_limites_do_curriculo(api, candidato):
    api.force_authenticate(candidato)
    muitas_areas = {**CURRICULO, "areas_interesse": ["A", "B", "C", "D"]}
    assert api.put("/api/curriculo/", muitas_areas, format="json").status_code == 400
    crianca = {**CURRICULO, "data_nascimento": "2020-01-01"}
    assert api.put("/api/curriculo/", crianca, format="json").status_code == 400


@pytest.mark.django_db
def test_empresa_nao_tem_curriculo(api, empresa):
    api.force_authenticate(empresa)
    assert api.get("/api/curriculo/").status_code == 403
