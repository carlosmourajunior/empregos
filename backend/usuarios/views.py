from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.db import transaction
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
        
        # Se não foi fornecido username, usar o email
        if not data.get('username'):
            data['username'] = data.get('email', '')
        
        # Se não foi fornecido cpf_cnpj, gerar um temporário único
        if not data.get('cpf_cnpj'):
            import uuid
            data['cpf_cnpj'] = f"TEMP_{uuid.uuid4().hex[:8]}"
        
        data['tipo_usuario'] = 'trabalhador'  # Forçar como trabalhador
        data['aprovado'] = True  # Admin cria candidatos já aprovados
        data['ativo'] = True  # Admin cria candidatos já ativos
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Sempre criar perfil de trabalhador com dados básicos
        from datetime import date
        PerfilTrabalhador.objects.create(
            usuario=user,
            cpf=data.get('cpf', ''),
            endereco=data.get('endereco', ''),
            data_nascimento=data.get('data_nascimento') or date(1990, 1, 1)  # Data padrão
        )
        
        return Response({
            'message': 'Candidato criado com sucesso.',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)

class CriarCandidatoCompletoView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Verificar se o usuário é admin
        if request.user.tipo_usuario != 'admin':
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        curriculo_data = data.pop('curriculo', {})
        
        try:
            with transaction.atomic():
                # Preparar dados do usuário
                if not data.get('username'):
                    data['username'] = data.get('email', '')
                
                if not data.get('cpf_cnpj'):
                    import uuid
                    data['cpf_cnpj'] = f"TEMP_{uuid.uuid4().hex[:8]}"
                
                data['tipo_usuario'] = 'trabalhador'
                data['aprovado'] = True
                data['ativo'] = True
                
                # Criar usuário
                user_serializer = CustomUserSerializer(data=data)
                user_serializer.is_valid(raise_exception=True)
                user = user_serializer.save()
                
                # Criar perfil de trabalhador
                from datetime import date
                perfil = PerfilTrabalhador.objects.create(
                    usuario=user,
                    cpf=data.get('cpf', ''),
                    endereco=data.get('endereco', ''),
                    data_nascimento=data.get('data_nascimento') or date(1990, 1, 1)
                )
                
                # Criar currículo se dados foram fornecidos
                if curriculo_data:
                    from curriculos.models import (
                        Curriculo, Escolaridade, ExperienciaProfissional, 
                        Habilidade, TipoVagaProcurada
                    )
                    
                    # Criar currículo principal
                    curriculo = Curriculo.objects.create(
                        trabalhador=user,
                        objetivo=curriculo_data.get('objetivo', ''),
                        resumo_profissional=curriculo_data.get('resumo_profissional', ''),
                        pretensao_salarial=curriculo_data.get('pretensao_salarial'),
                        disponibilidade_viagem=curriculo_data.get('disponibilidade_viagem', False),
                        disponibilidade_mudanca=curriculo_data.get('disponibilidade_mudanca', False)
                    )
                    
                    # Criar escolaridades
                    for esc_data in curriculo_data.get('escolaridades', []):
                        if (esc_data.get('instituicao') and esc_data.get('curso') and 
                            esc_data.get('nivel') and esc_data.get('ano_inicio')):
                            Escolaridade.objects.create(
                                curriculo=curriculo,
                                nivel=esc_data.get('nivel'),
                                instituicao=esc_data.get('instituicao'),
                                curso=esc_data.get('curso'),
                                ano_inicio=int(esc_data.get('ano_inicio')),
                                ano_conclusao=int(esc_data.get('ano_conclusao')) if esc_data.get('ano_conclusao') else None,
                                situacao=esc_data.get('situacao', 'concluido')
                            )
                    
                    # Criar experiências
                    for exp_data in curriculo_data.get('experiencias', []):
                        if (exp_data.get('empresa') and exp_data.get('cargo') and 
                            exp_data.get('descricao') and exp_data.get('data_inicio')):
                            ExperienciaProfissional.objects.create(
                                curriculo=curriculo,
                                empresa=exp_data.get('empresa'),
                                cargo=exp_data.get('cargo'),
                                descricao=exp_data.get('descricao'),
                                data_inicio=exp_data.get('data_inicio'),
                                data_fim=exp_data.get('data_fim') if exp_data.get('data_fim') else None,
                                emprego_atual=exp_data.get('emprego_atual', False),
                                salario=float(exp_data.get('salario')) if exp_data.get('salario') else None
                            )
                    
                    # Criar habilidades
                    for hab_data in curriculo_data.get('habilidades', []):
                        if hab_data.get('nome'):
                            Habilidade.objects.create(
                                curriculo=curriculo,
                                nome=hab_data.get('nome'),
                                nivel=hab_data.get('nivel', 'intermediario'),
                                descricao=hab_data.get('descricao', '')
                            )
                    
                    # Criar tipo de vaga procurada
                    tipo_vaga_data = curriculo_data.get('tipo_vaga_procurada', {})
                    if tipo_vaga_data:
                        TipoVagaProcurada.objects.create(
                            curriculo=curriculo,
                            areas_interesse=tipo_vaga_data.get('areas_interesse', ''),
                            cargos_interesse=tipo_vaga_data.get('cargos_interesse', ''),
                            tipo_contrato=tipo_vaga_data.get('tipo_contrato', 'clt'),
                            jornada_trabalho=tipo_vaga_data.get('jornada_trabalho', 'integral'),
                            salario_minimo=float(tipo_vaga_data.get('salario_minimo')) if tipo_vaga_data.get('salario_minimo') else None,
                            aceita_viagem=tipo_vaga_data.get('aceita_viagem', False),
                            aceita_mudanca=tipo_vaga_data.get('aceita_mudanca', False)
                        )
                
                return Response({
                    'message': 'Candidato e currículo criados com sucesso.',
                    'user_id': user.id,
                    'curriculo_criado': bool(curriculo_data)
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({
                'error': f'Erro ao criar candidato: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

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

class EditarCandidatoView(generics.UpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        # Verificar se o usuário é admin
        if request.user.tipo_usuario != 'admin':
            return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        
        if user.tipo_usuario != 'trabalhador':
            return Response({'error': 'Usuário não é um candidato/trabalhador.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Atualizar dados do usuário
        user_data = request.data.copy()
        perfil_trabalhador_data = user_data.pop('perfil_trabalhador', {})
        
        # Não atualizar senha pela edição (apenas se fornecida)
        password = user_data.pop('password', None)
        if password:
            user.set_password(password)
        
        # Atualizar campos do usuário
        for key, value in user_data.items():
            if hasattr(user, key) and key not in ['id', 'tipo_usuario', 'date_joined']:
                setattr(user, key, value)
        
        user.save()
        
        # Atualizar perfil de trabalhador
        perfil_trabalhador, created = PerfilTrabalhador.objects.get_or_create(usuario=user)
        
        # Validar CPF único (excluindo o próprio)
        cpf = perfil_trabalhador_data.get('cpf', '').replace('.', '').replace('-', '')
        if cpf and PerfilTrabalhador.objects.filter(cpf=cpf).exclude(usuario=user).exists():
            return Response({'cpf': ['Este CPF já está cadastrado.']}, status=status.HTTP_400_BAD_REQUEST)
        
        if perfil_trabalhador_data:
            perfil_trabalhador.cpf = cpf
            perfil_trabalhador.endereco = perfil_trabalhador_data.get('endereco', perfil_trabalhador.endereco)
            perfil_trabalhador.data_nascimento = perfil_trabalhador_data.get('data_nascimento', perfil_trabalhador.data_nascimento)
            perfil_trabalhador.tem_habilitacao = perfil_trabalhador_data.get('tem_habilitacao', perfil_trabalhador.tem_habilitacao)
            perfil_trabalhador.categoria_habilitacao = perfil_trabalhador_data.get('categoria_habilitacao', perfil_trabalhador.categoria_habilitacao)
            perfil_trabalhador.linkedin = perfil_trabalhador_data.get('linkedin', perfil_trabalhador.linkedin)
            perfil_trabalhador.save()
        
        return Response({
            'message': 'Candidato atualizado com sucesso.',
            'user_id': user.id
        })

class PerfilTrabalhadorDetailView(generics.RetrieveAPIView):
    serializer_class = PerfilTrabalhadorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs['user_id']
        try:
            return PerfilTrabalhador.objects.get(usuario_id=user_id)
        except PerfilTrabalhador.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({'detail': 'Perfil de trabalhador não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

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
