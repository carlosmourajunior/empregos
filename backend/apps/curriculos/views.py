from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.contas.permissions import EhCandidato

from .models import Curriculo
from .serializers import CurriculoSerializer


class MeuCurriculoView(APIView):
    permission_classes = [EhCandidato]

    def get(self, request):
        curriculo = Curriculo.objects.filter(usuario=request.user).first()
        if not curriculo:
            return Response({"detail": "Você ainda não preencheu o currículo."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CurriculoSerializer(curriculo).data)

    def put(self, request):
        curriculo = Curriculo.objects.filter(usuario=request.user).first()
        serializer = CurriculoSerializer(curriculo, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(usuario=request.user)
        return Response(serializer.data)
