from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import MatchingResult, HistoricoMatching
from .serializers import MatchingResultSerializer, HistoricoMatchingSerializer
from .engine import MatchingEngine
from vagas.models import Vaga

class VagasRecomendadasView(generics.ListAPIView):
    """Lista vagas recomendadas para o trabalhador logado"""
    serializer_class = MatchingResultSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.tipo_usuario != 'trabalhador':
            return MatchingResult.objects.none()
        
        matching_engine = MatchingEngine()
        return matching_engine.get_vagas_recomendadas(self.request.user, limit=20)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def executar_matching_vaga(request, vaga_id):
    """Executa o matching para uma vaga específica"""
    if request.user.tipo_usuario not in ['admin', 'empresa']:
        return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
    
    vaga = get_object_or_404(Vaga, id=vaga_id)
    
    # Verificar se empresa pode executar matching para esta vaga
    if request.user.tipo_usuario == 'empresa' and request.user != vaga.empresa:
        return Response({'error': 'Você só pode executar matching para suas próprias vagas.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    matching_engine = MatchingEngine()
    resultados = matching_engine.calcular_matching_vaga(vaga)
    
    # Criar histórico
    HistoricoMatching.objects.create(
        vaga=vaga,
        total_candidatos=len(resultados),
        candidatos_compatíveis=len([r for r in resultados if r.score_total >= 0.5]),
        score_medio=sum([r.score_total for r in resultados]) / len(resultados) if resultados else 0,
        parametros_utilizados=matching_engine.pesos
    )
    
    return Response({
        'message': 'Matching executado com sucesso!',
        'total_candidatos': len(resultados),
        'candidatos_compatíveis': len([r for r in resultados if r.score_total >= 0.5])
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estatisticas_matching(request):
    """Retorna estatísticas gerais do matching"""
    if request.user.tipo_usuario != 'admin':
        return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
    
    total_matches = MatchingResult.objects.count()
    matches_alta_compatibilidade = MatchingResult.objects.filter(score_total__gte=0.7).count()
    matches_media_compatibilidade = MatchingResult.objects.filter(
        score_total__gte=0.5, score_total__lt=0.7
    ).count()
    
    # Score médio geral
    scores = MatchingResult.objects.values_list('score_total', flat=True)
    score_medio = sum(scores) / len(scores) if scores else 0
    
    return Response({
        'total_matches': total_matches,
        'alta_compatibilidade': matches_alta_compatibilidade,
        'media_compatibilidade': matches_media_compatibilidade,
        'baixa_compatibilidade': total_matches - matches_alta_compatibilidade - matches_media_compatibilidade,
        'score_medio_geral': round(score_medio, 2)
    })

class HistoricoMatchingView(generics.ListAPIView):
    """Lista histórico de execuções de matching"""
    serializer_class = HistoricoMatchingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.tipo_usuario == 'admin':
            return HistoricoMatching.objects.all().order_by('-data_execucao')
        elif user.tipo_usuario == 'empresa':
            return HistoricoMatching.objects.filter(vaga__empresa=user).order_by('-data_execucao')
        
        return HistoricoMatching.objects.none()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detalhes_matching_trabalhador(request, trabalhador_id):
    """Retorna detalhes do matching para um trabalhador específico"""
    if request.user.tipo_usuario not in ['admin', 'empresa']:
        return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
    
    matches = MatchingResult.objects.filter(trabalhador_id=trabalhador_id)
    
    if request.user.tipo_usuario == 'empresa':
        # Empresa só vê matches das suas vagas
        matches = matches.filter(vaga__empresa=request.user)
    
    serializer = MatchingResultSerializer(matches.order_by('-score_total'), many=True)
    return Response(serializer.data)
