from rest_framework import serializers
from .models import MatchingResult, HistoricoMatching
from usuarios.serializers import CustomUserSerializer
from vagas.serializers import VagaSerializer

class MatchingResultSerializer(serializers.ModelSerializer):
    trabalhador = CustomUserSerializer(read_only=True)
    vaga = VagaSerializer(read_only=True)
    
    class Meta:
        model = MatchingResult
        fields = '__all__'

class HistoricoMatchingSerializer(serializers.ModelSerializer):
    vaga = VagaSerializer(read_only=True)
    
    class Meta:
        model = HistoricoMatching
        fields = '__all__'
