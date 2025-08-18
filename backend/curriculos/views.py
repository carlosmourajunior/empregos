from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import (
    Curriculo, Escolaridade, ExperienciaProfissional,
    Habilidade, Curso, Idioma, TipoVagaProcurada
)
from .serializers import (
    CurriculoSerializer, CurriculoCreateSerializer,
    EscolaridadeSerializer, ExperienciaProfissionalSerializer,
    HabilidadeSerializer, CursoSerializer, IdiomaSerializer,
    TipoVagaProcuradaSerializer
)

class CurriculoListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CurriculoCreateSerializer
        return CurriculoSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'admin':
            return Curriculo.objects.all()
        elif user.tipo_usuario == 'trabalhador':
            return Curriculo.objects.filter(trabalhador=user)
        elif user.tipo_usuario == 'empresa':
            # Empresas podem ver currículos de trabalhadores aprovados
            return Curriculo.objects.filter(
                trabalhador__aprovado=True,
                trabalhador__ativo=True
            )
        return Curriculo.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        
        # Admin pode criar currículo para qualquer trabalhador
        if user.tipo_usuario == 'admin':
            trabalhador_id = self.request.data.get('trabalhador_id')
            if trabalhador_id:
                from usuarios.models import CustomUser
                try:
                    trabalhador = CustomUser.objects.get(id=trabalhador_id, tipo_usuario='trabalhador')
                    # Verificar se já existe currículo para este trabalhador
                    if Curriculo.objects.filter(trabalhador=trabalhador).exists():
                        raise serializer.ValidationError("Já existe um currículo para este trabalhador.")
                    serializer.save(trabalhador=trabalhador)
                    return
                except CustomUser.DoesNotExist:
                    raise serializer.ValidationError("Trabalhador não encontrado.")
            else:
                raise serializer.ValidationError("ID do trabalhador é obrigatório para admins.")
        
        # Trabalhador só pode criar seu próprio currículo
        elif user.tipo_usuario == 'trabalhador':
            # Verificar se já existe currículo para este trabalhador
            if Curriculo.objects.filter(trabalhador=user).exists():
                raise serializer.ValidationError("Já existe um currículo para este usuário.")
            serializer.save(trabalhador=user)
        
        else:
            raise permissions.PermissionDenied("Apenas trabalhadores e admins podem criar currículos.")

class CurriculoDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CurriculoCreateSerializer
        return CurriculoSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'admin':
            return Curriculo.objects.all()
        elif user.tipo_usuario == 'trabalhador':
            return Curriculo.objects.filter(trabalhador=user)
        elif user.tipo_usuario == 'empresa':
            return Curriculo.objects.filter(
                trabalhador__aprovado=True,
                trabalhador__ativo=True
            )
        return Curriculo.objects.none()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def meu_curriculo(request):
    """Retorna o currículo do trabalhador logado ou permite admin acessar qualquer currículo"""
    if request.user.tipo_usuario == 'trabalhador':
        try:
            curriculo = Curriculo.objects.get(trabalhador=request.user)
            serializer = CurriculoSerializer(curriculo)
            return Response(serializer.data)
        except Curriculo.DoesNotExist:
            return Response({'message': 'Currículo não encontrado. Crie um novo currículo.'}, 
                           status=status.HTTP_404_NOT_FOUND)
    elif request.user.tipo_usuario == 'admin':
        # Admin pode acessar qualquer currículo, mas este endpoint é para "meu" currículo
        # Admin deveria usar o endpoint com ID específico
        return Response({'error': 'Admin deve acessar currículos usando o ID específico.'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'Apenas trabalhadores têm currículo próprio.'}, 
                       status=status.HTTP_403_FORBIDDEN)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def curriculo_por_usuario(request, user_id):
    """Retorna o currículo de um usuário específico (apenas para admin)"""
    if request.user.tipo_usuario != 'admin':
        return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from usuarios.models import CustomUser
        trabalhador = get_object_or_404(CustomUser, id=user_id, tipo_usuario='trabalhador')
        curriculo = Curriculo.objects.get(trabalhador=trabalhador)
        serializer = CurriculoSerializer(curriculo)
        return Response(serializer.data)
    except Curriculo.DoesNotExist:
        return Response({'message': 'Currículo não encontrado para este usuário.'}, 
                       status=status.HTTP_404_NOT_FOUND)

# Views para gerenciar componentes individuais do currículo

class EscolaridadeListCreateView(generics.ListCreateAPIView):
    serializer_class = EscolaridadeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        # Verificar permissões
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            return Escolaridade.objects.none()
        
        return curriculo.escolaridades.all()
    
    def perform_create(self, serializer):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            raise permissions.PermissionDenied()
        
        serializer.save(curriculo=curriculo)

class EscolaridadeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EscolaridadeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            return Escolaridade.objects.none()
        
        return curriculo.escolaridades.all()

class ExperienciaListCreateView(generics.ListCreateAPIView):
    serializer_class = ExperienciaProfissionalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            return ExperienciaProfissional.objects.none()
        
        return curriculo.experiencias.all()
    
    def perform_create(self, serializer):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            raise permissions.PermissionDenied()
        
        serializer.save(curriculo=curriculo)

class ExperienciaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperienciaProfissionalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            return ExperienciaProfissional.objects.none()
        
        return curriculo.experiencias.all()

class HabilidadeListCreateView(generics.ListCreateAPIView):
    serializer_class = HabilidadeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            return Habilidade.objects.none()
        
        return curriculo.habilidades.all()
    
    def perform_create(self, serializer):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            raise permissions.PermissionDenied()
        
        serializer.save(curriculo=curriculo)
        
        serializer.save(curriculo=curriculo)

class HabilidadeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HabilidadeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        curriculo_id = self.kwargs['curriculo_id']
        curriculo = get_object_or_404(Curriculo, id=curriculo_id)
        
        if (self.request.user != curriculo.trabalhador and 
            self.request.user.tipo_usuario != 'admin'):
            return Habilidade.objects.none()
        
        return curriculo.habilidades.all()
