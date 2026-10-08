from rest_framework.permissions import BasePermission


class PodeAprovar(BasePermission):
    """Área da prefeitura: basta ter a permissão de aprovador, sem cargo fixo."""

    message = "Você não tem permissão de aprovador."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_perm("vagas.aprovar_vaga")
