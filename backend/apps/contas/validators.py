import re

from django.core.exceptions import ValidationError


def so_digitos(valor):
    return re.sub(r"\D", "", valor or "")


def _digito(numeros, pesos):
    resto = sum(int(n) * p for n, p in zip(numeros, pesos, strict=False)) % 11
    return "0" if resto < 2 else str(11 - resto)


def cpf_valido(cpf):
    cpf = so_digitos(cpf)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    d1 = _digito(cpf[:9], range(10, 1, -1))
    d2 = _digito(cpf[:10], range(11, 1, -1))
    return cpf[-2:] == d1 + d2


def cnpj_valido(cnpj):
    cnpj = so_digitos(cnpj)
    if len(cnpj) != 14 or cnpj == cnpj[0] * 14:
        return False
    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    d1 = _digito(cnpj[:12], pesos1)
    d2 = _digito(cnpj[:13], [6] + pesos1)
    return cnpj[-2:] == d1 + d2


def validar_documento(documento):
    documento = so_digitos(documento)
    if len(documento) == 11 and cpf_valido(documento):
        return documento
    if len(documento) == 14 and cnpj_valido(documento):
        return documento
    raise ValidationError("CPF ou CNPJ inválido.")


def normalizar_telefone(telefone):
    """Devolve o telefone no formato da Evolution API: 55 + DDD + número."""
    numero = so_digitos(telefone)
    if numero.startswith("55") and len(numero) in (12, 13):
        numero = numero[2:]
    if len(numero) not in (10, 11):
        raise ValidationError("Telefone inválido. Use DDD + número.")
    return "55" + numero
