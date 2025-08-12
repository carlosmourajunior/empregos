from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser, PerfilEmpresa, PerfilTrabalhador

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'telefone', 'cpf_cnpj', 'tipo_usuario', 'aprovado', 'ativo',
                 'password')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PerfilEmpresaSerializer(serializers.ModelSerializer):
    usuario = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = PerfilEmpresa
        fields = '__all__'

class PerfilTrabalhadorSerializer(serializers.ModelSerializer):
    usuario = CustomUserSerializer(read_only=True)
    
    class Meta:
        model = PerfilTrabalhador
        fields = '__all__'

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('Conta desativada.')
                if not user.aprovado and user.tipo_usuario != 'admin':
                    raise serializers.ValidationError('Conta não aprovada pelo administrador.')
                data['user'] = user
            else:
                raise serializers.ValidationError('Credenciais inválidas.')
        else:
            raise serializers.ValidationError('Email e senha são obrigatórios.')
        
        return data

class RegistroEmpresaSerializer(serializers.Serializer):
    # Dados do usuário
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    telefone = serializers.CharField()
    
    # Dados da empresa
    nome_empresa = serializers.CharField()
    cnpj = serializers.CharField()
    endereco = serializers.CharField()
    site = serializers.URLField(required=False)
    descricao = serializers.CharField()
    setor = serializers.CharField()
    tamanho_empresa = serializers.ChoiceField(choices=PerfilEmpresa._meta.get_field('tamanho_empresa').choices)
    
    def create(self, validated_data):
        # Extrair dados do perfil da empresa
        perfil_data = {
            'nome_empresa': validated_data.pop('nome_empresa'),
            'cnpj': validated_data.pop('cnpj'),
            'endereco': validated_data.pop('endereco'),
            'site': validated_data.pop('site', ''),
            'descricao': validated_data.pop('descricao'),
            'setor': validated_data.pop('setor'),
            'tamanho_empresa': validated_data.pop('tamanho_empresa'),
        }
        
        # Criar usuário
        validated_data['tipo_usuario'] = 'empresa'
        validated_data['cpf_cnpj'] = perfil_data['cnpj']
        user = CustomUser.objects.create_user(**validated_data)
        
        # Criar perfil da empresa
        perfil_data['usuario'] = user
        PerfilEmpresa.objects.create(**perfil_data)
        
        return user

class RegistroTrabalhadorSerializer(serializers.Serializer):
    # Dados do usuário
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    telefone = serializers.CharField()
    
    # Dados do trabalhador
    cpf = serializers.CharField()
    data_nascimento = serializers.DateField()
    endereco = serializers.CharField()
    tem_habilitacao = serializers.BooleanField(default=False)
    categoria_habilitacao = serializers.ChoiceField(
        choices=PerfilTrabalhador._meta.get_field('categoria_habilitacao').choices,
        required=False
    )
    linkedin = serializers.URLField(required=False)
    
    def create(self, validated_data):
        # Extrair dados do perfil do trabalhador
        perfil_data = {
            'cpf': validated_data.pop('cpf'),
            'data_nascimento': validated_data.pop('data_nascimento'),
            'endereco': validated_data.pop('endereco'),
            'tem_habilitacao': validated_data.pop('tem_habilitacao', False),
            'categoria_habilitacao': validated_data.pop('categoria_habilitacao', ''),
            'linkedin': validated_data.pop('linkedin', ''),
        }
        
        # Criar usuário
        validated_data['tipo_usuario'] = 'trabalhador'
        validated_data['cpf_cnpj'] = perfil_data['cpf']
        user = CustomUser.objects.create_user(**validated_data)
        
        # Criar perfil do trabalhador
        perfil_data['usuario'] = user
        PerfilTrabalhador.objects.create(**perfil_data)
        
        return user
