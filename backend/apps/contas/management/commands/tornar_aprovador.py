from django.contrib.auth.models import Permission
from django.core.management.base import BaseCommand, CommandError

from apps.contas.models import Usuario
from apps.contas.validators import so_digitos


class Command(BaseCommand):
    help = "Dá a um usuário da prefeitura a permissão de aprovar vagas. Uso: tornar_aprovador <CPF>"

    def add_arguments(self, parser):
        parser.add_argument("cpf")

    def handle(self, *args, cpf, **options):
        usuario = Usuario.objects.filter(documento=so_digitos(cpf)).first()
        if not usuario:
            raise CommandError("Nenhum usuário com esse CPF.")
        usuario.tipo = Usuario.Tipo.PREFEITURA
        usuario.save(update_fields=["tipo"])
        usuario.user_permissions.add(Permission.objects.get(codename="aprovar_vaga"))
        self.stdout.write(self.style.SUCCESS(f"{usuario.nome} agora pode aprovar vagas."))
