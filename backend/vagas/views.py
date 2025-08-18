from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Vaga, CandidaturaVaga, AvaliacaoCandidato
from .serializers import (
    VagaSerializer, VagaCreateSerializer, CandidaturaVagaSerializer,
    AvaliacaoCandidatoSerializer
)
from matching.engine import MatchingEngine

class VagaListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VagaCreateSerializer
        return VagaSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Vaga.objects.all()
        
        if user.tipo_usuario == 'empresa':
            # Empresas só veem suas próprias vagas
            queryset = queryset.filter(empresa=user)
        elif user.tipo_usuario == 'trabalhador':
            # Trabalhadores veem apenas vagas ativas de empresas aprovadas
            queryset = queryset.filter(
                status='ativa',
                empresa__aprovado=True,
                empresa__ativo=True
            )
        
        # Filtros opcionais
        area = self.request.query_params.get('area')
        if area:
            queryset = queryset.filter(area__icontains=area)
        
        tipo_contrato = self.request.query_params.get('tipo_contrato')
        if tipo_contrato:
            queryset = queryset.filter(tipo_contrato=tipo_contrato)
        
        return queryset.order_by('-data_criacao')
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if user.tipo_usuario == 'empresa':
            # Empresa criando vaga para si mesma
            vaga = serializer.save(empresa=user)
        elif user.tipo_usuario == 'admin':
            # Admin deve especificar qual empresa
            empresa_id = self.request.data.get('empresa')
            if not empresa_id:
                raise PermissionDenied("Admin deve especificar uma empresa para a vaga.")
            
            # Verificar se a empresa existe e está ativa
            from usuarios.models import CustomUser
            try:
                empresa = CustomUser.objects.get(
                    id=empresa_id, 
                    tipo_usuario='empresa', 
                    aprovado=True,
                    ativo=True
                )
                vaga = serializer.save(empresa=empresa)
            except CustomUser.DoesNotExist:
                raise PermissionDenied("Empresa não encontrada ou não está ativa.")
        else:
            raise PermissionDenied("Apenas empresas e administradores podem criar vagas.")
        
        # Executar matching automático
        matching_engine = MatchingEngine()
        matching_engine.calcular_matching_vaga(vaga)

class VagaDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return VagaCreateSerializer
        return VagaSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Vaga.objects.all()
        
        if user.tipo_usuario == 'empresa':
            queryset = queryset.filter(empresa=user)
        elif user.tipo_usuario == 'trabalhador':
            queryset = queryset.filter(
                status='ativa',
                empresa__aprovado=True,
                empresa__ativo=True
            )
        
        return queryset

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def candidatar_vaga(request, vaga_id):
    """Permite que um trabalhador se candidate a uma vaga"""
    if request.user.tipo_usuario != 'trabalhador':
        return Response({'error': 'Apenas trabalhadores podem se candidatar.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    vaga = get_object_or_404(Vaga, id=vaga_id, status='ativa')
    
    # Verificar se já existe candidatura
    if CandidaturaVaga.objects.filter(vaga=vaga, trabalhador=request.user).exists():
        return Response({'error': 'Você já se candidatou a esta vaga.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Criar candidatura
    candidatura = CandidaturaVaga.objects.create(
        vaga=vaga,
        trabalhador=request.user
    )
    
    # Calcular score de compatibilidade
    if hasattr(request.user, 'curriculo'):
        matching_engine = MatchingEngine()
        score_data = matching_engine._calcular_score_curriculo_vaga(request.user.curriculo, vaga)
        candidatura.score_compatibilidade = score_data['score_total']
        candidatura.save()
    
    return Response({
        'message': 'Candidatura realizada com sucesso!',
        'candidatura_id': candidatura.id
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def minhas_candidaturas(request):
    """Lista candidaturas do trabalhador logado"""
    if request.user.tipo_usuario != 'trabalhador':
        return Response({'error': 'Apenas trabalhadores têm candidaturas.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    candidaturas = CandidaturaVaga.objects.filter(
        trabalhador=request.user
    ).order_by('-data_candidatura')
    
    serializer = CandidaturaVagaSerializer(candidaturas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def candidatos_vaga(request, vaga_id):
    """Lista candidatos de uma vaga (apenas para empresa dona da vaga)"""
    vaga = get_object_or_404(Vaga, id=vaga_id)
    
    if request.user != vaga.empresa and request.user.tipo_usuario != 'admin':
        return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
    
    candidaturas = CandidaturaVaga.objects.filter(vaga=vaga).order_by('-score_compatibilidade')
    serializer = CandidaturaVagaSerializer(candidaturas, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def atualizar_status_candidatura(request, candidatura_id):
    """Atualiza status de uma candidatura"""
    candidatura = get_object_or_404(CandidaturaVaga, id=candidatura_id)
    
    if request.user != candidatura.vaga.empresa and request.user.tipo_usuario != 'admin':
        return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
    
    novo_status = request.data.get('status')
    observacoes = request.data.get('observacoes', '')
    
    if novo_status not in [choice[0] for choice in CandidaturaVaga.STATUS_CHOICES]:
        return Response({'error': 'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)
    
    candidatura.status = novo_status
    candidatura.observacoes = observacoes
    candidatura.save()
    
    return Response({'message': 'Status atualizado com sucesso.'})

class VagasEmpresaView(generics.ListAPIView):
    """Lista vagas de uma empresa específica"""
    serializer_class = VagaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        empresa_id = self.kwargs['empresa_id']
        return Vaga.objects.filter(
            empresa_id=empresa_id,
            status='ativa'
        ).order_by('-data_criacao')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_candidatos_vaga(request, vaga_id):
    """Retorna os melhores candidatos para uma vaga usando o sistema de matching"""
    vaga = get_object_or_404(Vaga, id=vaga_id)
    
    if request.user != vaga.empresa and request.user.tipo_usuario != 'admin':
        return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
    
    matching_engine = MatchingEngine()
    top_matches = matching_engine.get_top_candidatos(vaga, limit=20)
    
    resultado = []
    for match in top_matches:
        candidatura = CandidaturaVaga.objects.filter(
            vaga=vaga, 
            trabalhador=match.trabalhador
        ).first()
        
        resultado.append({
            'trabalhador': {
                'id': match.trabalhador.id,
                'nome': match.trabalhador.get_full_name(),
                'email': match.trabalhador.email,
            },
            'score_compatibilidade': match.score_total,
            'detalhes_score': {
                'experiencia': match.score_experiencia,
                'habilidades': match.score_habilidades,
                'escolaridade': match.score_escolaridade,
                'localizacao': match.score_localizacao,
                'salario': match.score_salario,
            },
            'candidatou': candidatura is not None,
            'status_candidatura': candidatura.status if candidatura else None,
            'data_candidatura': candidatura.data_candidatura if candidatura else None,
        })
    
    return Response(resultado)
