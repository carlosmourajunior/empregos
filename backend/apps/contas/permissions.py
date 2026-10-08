from rest_framework.permissions import BasePermission

from .models import Usuario


class EhCandidato(BasePermission):
    message = "Só para quem procura emprego."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == Usuario.Tipo.CANDIDATO


class EhEmpresa(BasePermission):
    message = "Só para empresas."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == Usuario.Tipo.EMPRESA
