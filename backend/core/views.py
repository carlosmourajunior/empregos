from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from usuarios.models import CustomUser
from vagas.models import Vaga, CandidaturaVaga
from curriculos.models import Curriculo

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Retorna estatísticas para o dashboard do usuário"""
    user = request.user
    
    if user.tipo_usuario == 'admin':
        return Response({
            'total_usuarios': CustomUser.objects.count(),
            'usuarios_pendentes': CustomUser.objects.filter(aprovado=False).count(),
            'total_empresas': CustomUser.objects.filter(tipo_usuario='empresa').count(),
            'total_trabalhadores': CustomUser.objects.filter(tipo_usuario='trabalhador').count(),
            'total_vagas': Vaga.objects.count(),
            'vagas_ativas': Vaga.objects.filter(status='ativa').count(),
            'total_candidaturas': CandidaturaVaga.objects.count(),
            'curriculos_cadastrados': Curriculo.objects.count(),
        })
    
    elif user.tipo_usuario == 'empresa':
        minhas_vagas = Vaga.objects.filter(empresa=user)
        return Response({
            'minhas_vagas': minhas_vagas.count(),
            'vagas_ativas': minhas_vagas.filter(status='ativa').count(),
            'total_candidaturas': CandidaturaVaga.objects.filter(vaga__empresa=user).count(),
            'candidaturas_pendentes': CandidaturaVaga.objects.filter(
                vaga__empresa=user,
                status='candidatado'
            ).count(),
        })
    
    elif user.tipo_usuario == 'trabalhador':
        minhas_candidaturas = CandidaturaVaga.objects.filter(trabalhador=user)
        return Response({
            'minhas_candidaturas': minhas_candidaturas.count(),
            'candidaturas_em_andamento': minhas_candidaturas.exclude(
                status__in=['aprovado', 'reprovado', 'desistiu']
            ).count(),
            'candidaturas_aprovadas': minhas_candidaturas.filter(status='aprovado').count(),
            'vagas_disponiveis': Vaga.objects.filter(status='ativa').count(),
            'tem_curriculo': hasattr(user, 'curriculo'),
        })
    
    return Response({})

@api_view(['GET'])
def health_check(request):
    """Endpoint para verificar saúde da API"""
    return Response({'status': 'ok', 'message': 'API funcionando corretamente'})
