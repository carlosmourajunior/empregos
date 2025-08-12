from rest_framework import serializers
from .models import Vaga, RequisitoVaga, CandidaturaVaga, AvaliacaoCandidato
from usuarios.serializers import CustomUserSerializer

class RequisitoVagaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequisitoVaga
        fields = '__all__'
        read_only_fields = ('vaga',)

class VagaSerializer(serializers.ModelSerializer):
    requisitos_detalhados = RequisitoVagaSerializer(many=True, read_only=True)
    empresa_nome = serializers.CharField(source='empresa.perfil_empresa.nome_empresa', read_only=True)
    total_candidaturas = serializers.SerializerMethodField()
    
    class Meta:
        model = Vaga
        fields = '__all__'
        read_only_fields = ('empresa',)
    
    def get_total_candidaturas(self, obj):
        return obj.candidaturas.count()

class VagaCreateSerializer(serializers.ModelSerializer):
    requisitos_detalhados = RequisitoVagaSerializer(many=True, required=False)
    
    class Meta:
        model = Vaga
        fields = '__all__'
        read_only_fields = ('empresa',)
    
    def create(self, validated_data):
        requisitos_data = validated_data.pop('requisitos_detalhados', [])
        vaga = Vaga.objects.create(**validated_data)
        
        for requisito_data in requisitos_data:
            RequisitoVaga.objects.create(vaga=vaga, **requisito_data)
        
        return vaga
    
    def update(self, instance, validated_data):
        requisitos_data = validated_data.pop('requisitos_detalhados', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if requisitos_data is not None:
            instance.requisitos_detalhados.all().delete()
            for requisito_data in requisitos_data:
                RequisitoVaga.objects.create(vaga=instance, **requisito_data)
        
        return instance

class CandidaturaVagaSerializer(serializers.ModelSerializer):
    trabalhador_nome = serializers.CharField(source='trabalhador.get_full_name', read_only=True)
    vaga_titulo = serializers.CharField(source='vaga.titulo', read_only=True)
    
    class Meta:
        model = CandidaturaVaga
        fields = '__all__'
        read_only_fields = ('trabalhador', 'data_candidatura', 'score_compatibilidade')

class AvaliacaoCandidatoSerializer(serializers.ModelSerializer):
    candidatura_info = CandidaturaVagaSerializer(source='candidatura', read_only=True)
    
    class Meta:
        model = AvaliacaoCandidato
        fields = '__all__'
        read_only_fields = ('avaliador',)
