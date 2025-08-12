from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import CustomUser, PerfilEmpresa, PerfilTrabalhador
from .serializers import (
    CustomUserSerializer, PerfilEmpresaSerializer, PerfilTrabalhadorSerializer,
    LoginSerializer, RegistroEmpresaSerializer, RegistroTrabalhadorSerializer
)

class RegistroEmpresaView(generics.CreateAPIView):
    serializer_class = RegistroEmpresaSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Empresa registrada com sucesso. Aguarde aprovação do administrador.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)

class RegistroTrabalhadorView(generics.CreateAPIView):
    serializer_class = RegistroTrabalhadorSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Trabalhador registrado com sucesso. Aguarde aprovação do administrador.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Adicionar informações do perfil
        perfil_data = {}
        if user.tipo_usuario == 'empresa' and hasattr(user, 'perfil_empresa'):
            perfil_data = PerfilEmpresaSerializer(user.perfil_empresa).data
        elif user.tipo_usuario == 'trabalhador' and hasattr(user, 'perfil_trabalhador'):
            perfil_data = PerfilTrabalhadorSerializer(user.perfil_trabalhador).data
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': CustomUserSerializer(user).data,
            'perfil': perfil_data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout realizado com sucesso.'})
    except Exception as e:
        return Response({'error': 'Token inválido.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_view(request):
    user = request.user
    user_data = CustomUserSerializer(user).data
    
    perfil_data = {}
    if user.tipo_usuario == 'empresa' and hasattr(user, 'perfil_empresa'):
        perfil_data = PerfilEmpresaSerializer(user.perfil_empresa).data
    elif user.tipo_usuario == 'trabalhador' and hasattr(user, 'perfil_trabalhador'):
        perfil_data = PerfilTrabalhadorSerializer(user.perfil_trabalhador).data
    
    return Response({
        'user': user_data,
        'perfil': perfil_data
    })

class ListaUsuariosView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.tipo_usuario == 'admin':
            queryset = CustomUser.objects.all().order_by('-date_joined')
            
            # Filtrar por tipo de usuário se especificado
            tipo_usuario = self.request.query_params.get('tipo_usuario', None)
            if tipo_usuario:
                queryset = queryset.filter(tipo_usuario=tipo_usuario)
            
            return queryset
        return CustomUser.objects.none()

class AprovarUsuarioView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        if request.user.tipo_usuario != 'admin':
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        acao = request.data.get('acao')
        
        if acao == 'aprovar':
            user.aprovado = True
            message = 'Usuário aprovado com sucesso.'
        elif acao == 'desaprovar':
            user.aprovado = False
            message = 'Usuário desaprovado com sucesso.'
        elif acao == 'ativar':
            user.ativo = True
            message = 'Usuário ativado com sucesso.'
        elif acao == 'desativar':
            user.ativo = False
            message = 'Usuário desativado com sucesso.'
        else:
            return Response({'error': 'Ação inválida.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.save()
        return Response({'message': message})

class EmpresasView(generics.ListAPIView):
    serializer_class = PerfilEmpresaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PerfilEmpresa.objects.filter(usuario__aprovado=True, usuario__ativo=True)

class TrabalhadoresView(generics.ListAPIView):
    serializer_class = PerfilTrabalhadorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PerfilTrabalhador.objects.filter(usuario__aprovado=True, usuario__ativo=True)

class CriarCandidatoView(generics.CreateAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Verificar se o usuário é admin
        if request.user.tipo_usuario != 'admin':
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Preparar dados do candidato
        data = request.data.copy()
        data['password'] = make_password(data.get('password'))
        data['tipo_usuario'] = 'trabalhador'  # Forçar como trabalhador
        data['aprovado'] = True  # Admin cria candidatos já aprovados
        data['is_active'] = True  # Admin cria candidatos já ativos
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Sempre criar perfil de trabalhador
        PerfilTrabalhador.objects.create(
            usuario=user,
            telefone=user.telefone or ''
        )
        
        return Response({
            'message': 'Candidato criado com sucesso.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)

class CriarEmpresaView(generics.CreateAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Verificar se o usuário é admin
        if request.user.tipo_usuario != 'admin':
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Preparar dados da empresa
        data = request.data.copy()
        perfil_empresa_data = data.pop('perfil_empresa', {})
        
        data['password'] = make_password(data.get('password'))
        data['tipo_usuario'] = 'empresa'  # Forçar como empresa
        data['is_active'] = True  # Admin cria empresas já ativas
        
        # Validar CNPJ único
        cnpj = perfil_empresa_data.get('cnpj', '').replace('.', '').replace('/', '').replace('-', '')
        if cnpj and PerfilEmpresa.objects.filter(cnpj=cnpj).exists():
            return Response({'cnpj': ['Este CNPJ já está cadastrado.']}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Criar perfil de empresa
        PerfilEmpresa.objects.create(
            usuario=user,
            cnpj=cnpj,
            nome_empresa=perfil_empresa_data.get('nome_empresa', ''),
            descricao=perfil_empresa_data.get('descricao', ''),
            endereco=perfil_empresa_data.get('endereco', ''),
            cidade=perfil_empresa_data.get('cidade', ''),
            estado=perfil_empresa_data.get('estado', ''),
            cep=perfil_empresa_data.get('cep', '').replace('-', ''),
            site=perfil_empresa_data.get('site', '')
        )
        
        return Response({
            'message': 'Empresa criada com sucesso.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)

class EditarEmpresaView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        # Verificar se o usuário é admin
        if request.user.tipo_usuario != 'admin':
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        
        if user.tipo_usuario != 'empresa':
            return Response({'error': 'Usuário não é uma empresa.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Atualizar dados do usuário
        user_data = request.data.copy()
        perfil_empresa_data = user_data.pop('perfil_empresa', {})
        
        # Não atualizar senha pela edição
        user_data.pop('password', None)
        
        for key, value in user_data.items():
            if hasattr(user, key) and key not in ['id', 'tipo_usuario', 'date_joined']:
                setattr(user, key, value)
        
        user.save()
        
        # Atualizar perfil de empresa
        if perfil_empresa_data:
            perfil_empresa, created = PerfilEmpresa.objects.get_or_create(usuario=user)
            
            # Validar CNPJ único (excluindo o próprio)
            cnpj = perfil_empresa_data.get('cnpj', '').replace('.', '').replace('/', '').replace('-', '')
            if cnpj and PerfilEmpresa.objects.filter(cnpj=cnpj).exclude(usuario=user).exists():
                return Response({'cnpj': ['Este CNPJ já está cadastrado.']}, status=status.HTTP_400_BAD_REQUEST)
            
            perfil_empresa.cnpj = cnpj
            perfil_empresa.nome_empresa = perfil_empresa_data.get('nome_empresa', perfil_empresa.nome_empresa)
            perfil_empresa.descricao = perfil_empresa_data.get('descricao', perfil_empresa.descricao)
            perfil_empresa.endereco = perfil_empresa_data.get('endereco', perfil_empresa.endereco)
            perfil_empresa.cidade = perfil_empresa_data.get('cidade', perfil_empresa.cidade)
            perfil_empresa.estado = perfil_empresa_data.get('estado', perfil_empresa.estado)
            perfil_empresa.cep = perfil_empresa_data.get('cep', '').replace('-', '')
            perfil_empresa.site = perfil_empresa_data.get('site', perfil_empresa.site)
            perfil_empresa.save()
        
        return Response({
            'message': 'Empresa atualizada com sucesso.',
            'user_id': user.id
        })

class PerfilEmpresaDetailView(generics.RetrieveAPIView):
    serializer_class = PerfilEmpresaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs['user_id']
        try:
            return PerfilEmpresa.objects.get(usuario_id=user_id)
        except PerfilEmpresa.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({'detail': 'Perfil de empresa não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
