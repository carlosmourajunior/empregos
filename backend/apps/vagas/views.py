from collections import Counter

from django.db.models import Q
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.contas.permissions import EhCandidato, EhEmpresa
from apps.curriculos.models import Curriculo

from .models import Interesse, Vaga
from .serializers import InteressadoSerializer, VagaEmpresaSerializer, VagaPublicaSerializer


def _ids_com_interesse(request):
    usuario = request.user
    if usuario.is_authenticated and usuario.tipo == "candidato":
        return set(Interesse.objects.filter(candidato=usuario).values_list("vaga_id", flat=True))
    return None


class VagasView(generics.ListAPIView):
    """Vagas aprovadas, abertas a qualquer pessoa. Filtros: ?busca= ?area= ?bairro="""

    permission_classes = [AllowAny]
    serializer_class = VagaPublicaSerializer

    def get_queryset(self):
        vagas = Vaga.publicas().select_related("empresa")
        params = self.request.query_params
        if busca := params.get("busca", "").strip():
            vagas = vagas.filter(Q(cargo__icontains=busca) | Q(descricao__icontains=busca) | Q(area__icontains=busca))
        if area := params.get("area", "").strip():
            vagas = vagas.filter(area__iexact=area)
        if bairro := params.get("bairro", "").strip():
            vagas = vagas.filter(bairro__iexact=bairro)
        return vagas

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "ids_com_interesse": _ids_com_interesse(self.request)}


class VagaView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = VagaPublicaSerializer
    queryset = Vaga.publicas().select_related("empresa")

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "ids_com_interesse": _ids_com_interesse(self.request)}


class InteresseView(APIView):
    """POST = "Tenho interesse"; DELETE = desistir."""

    permission_classes = [EhCandidato]

    def post(self, request, pk):
        vaga = get_object_or_404(Vaga.publicas(), pk=pk)
        if not Curriculo.objects.filter(usuario=request.user).exists():
            return Response(
                {"detail": "Preencha seu currículo antes.", "codigo": "sem_curriculo"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        Interesse.objects.get_or_create(vaga=vaga, candidato=request.user)
        return Response({"tenho_interesse": True}, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        Interesse.objects.filter(vaga_id=pk, candidato=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeusInteressesView(generics.ListAPIView):
    permission_classes = [EhCandidato]
    serializer_class = VagaPublicaSerializer
    pagination_class = None

    def get_queryset(self):
        return Vaga.objects.filter(interesses__candidato=self.request.user).select_related("empresa")

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "ids_com_interesse": _ids_com_interesse(self.request)}


class MinhasVagasView(generics.ListCreateAPIView):
    permission_classes = [EhEmpresa]
    serializer_class = VagaEmpresaSerializer
    pagination_class = None

    def get_queryset(self):
        return Vaga.objects.filter(empresa=self.request.user).prefetch_related("interesses")

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user)


class MinhaVagaView(generics.RetrieveUpdateAPIView):
    permission_classes = [EhEmpresa]
    serializer_class = VagaEmpresaSerializer

    def get_queryset(self):
        return Vaga.objects.filter(empresa=self.request.user).exclude(status=Vaga.Status.ENCERRADA)


@api_view(["POST"])
@permission_classes([EhEmpresa])
def encerrar_vaga(request, pk):
    vaga = get_object_or_404(Vaga, pk=pk, empresa=request.user)
    vaga.status = Vaga.Status.ENCERRADA
    vaga.save(update_fields=["status"])
    return Response(VagaEmpresaSerializer(vaga).data)


class InteressadosView(generics.ListAPIView):
    permission_classes = [EhEmpresa]
    serializer_class = InteressadoSerializer
    pagination_class = None

    def get_queryset(self):
        vaga = get_object_or_404(Vaga, pk=self.kwargs["pk"], empresa=self.request.user)
        return vaga.interesses.select_related("candidato__curriculo").prefetch_related(
            "candidato__curriculo__experiencias"
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def sugestoes(request):
    """Áreas ou bairros já digitados, para sugerir enquanto a pessoa escreve. ?campo=area|bairro&q="""
    campo = request.query_params.get("campo")
    termo = request.query_params.get("q", "").strip()
    if campo not in ("area", "bairro"):
        return Response({"detail": "campo deve ser area ou bairro."}, status=status.HTTP_400_BAD_REQUEST)

    # Conta cada grafia para sugerir a mais usada ("Cozinha" e "cozinha" viram uma só).
    valores = Counter(Vaga.objects.values_list(campo, flat=True))
    if campo == "bairro":
        valores.update(Curriculo.objects.values_list("bairro", flat=True))
    else:
        for areas in Curriculo.objects.values_list("areas_interesse", flat=True):
            valores.update(areas)

    melhores = {}
    for valor, vezes in valores.items():
        if not valor or termo.lower() not in valor.lower():
            continue
        chave = (vezes, valor[:1].isupper())
        atual = melhores.get(valor.lower())
        if atual is None or chave > atual[0]:
            melhores[valor.lower()] = (chave, valor)
    return Response(sorted((valor for _, valor in melhores.values()), key=str.lower)[:10])
