from rest_framework import serializers
from .models import (
    Curriculo, Escolaridade, ExperienciaProfissional, 
    Habilidade, Curso, Idioma, TipoVagaProcurada
)

class EscolaridadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escolaridade
        fields = '__all__'
        read_only_fields = ('curriculo',)

class ExperienciaProfissionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienciaProfissional
        fields = '__all__'
        read_only_fields = ('curriculo',)

class HabilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidade
        fields = '__all__'
        read_only_fields = ('curriculo',)

class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = '__all__'
        read_only_fields = ('curriculo',)

class IdiomaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idioma
        fields = '__all__'
        read_only_fields = ('curriculo',)

class TipoVagaProcuradaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoVagaProcurada
        fields = '__all__'
        read_only_fields = ('curriculo',)

class CurriculoSerializer(serializers.ModelSerializer):
    escolaridades = EscolaridadeSerializer(many=True, read_only=True)
    experiencias_profissionais = ExperienciaProfissionalSerializer(source='experiencias', many=True, read_only=True)
    habilidades = HabilidadeSerializer(many=True, read_only=True)
    cursos = CursoSerializer(many=True, read_only=True)
    idiomas = IdiomaSerializer(many=True, read_only=True)
    tipo_vaga_procurada = TipoVagaProcuradaSerializer(read_only=True)
    trabalhador_nome = serializers.CharField(source='trabalhador.get_full_name', read_only=True)
    
    # Incluir dados do trabalhador
    trabalhador = serializers.SerializerMethodField()
    
    def get_trabalhador(self, obj):
        return {
            'id': obj.trabalhador.id,
            'first_name': obj.trabalhador.first_name,
            'last_name': obj.trabalhador.last_name,
            'email': obj.trabalhador.email,
            'telefone': obj.trabalhador.telefone,
            'date_joined': obj.trabalhador.date_joined
        }
    
    class Meta:
        model = Curriculo
        fields = [
            'id', 'nome_completo', 'email', 'telefone', 'endereco', 'cidade', 
            'cep', 'data_nascimento', 'genero', 'nacionalidade', 'estado_civil',
            'objetivo_profissional', 'resumo_qualificacoes', 'tipo_vaga_procurada',
            'trabalhador', 'trabalhador_nome', 'escolaridades', 
            'experiencias_profissionais', 'habilidades', 'cursos', 'idiomas'
        ]
        read_only_fields = ('trabalhador',)

class CurriculoCreateSerializer(serializers.ModelSerializer):
    # Nested serializers para criação completa
    escolaridades = EscolaridadeSerializer(many=True, required=False)
    experiencias_profissionais = ExperienciaProfissionalSerializer(many=True, required=False)
    habilidades = HabilidadeSerializer(many=True, required=False)
    cursos = CursoSerializer(many=True, required=False)
    idiomas = IdiomaSerializer(many=True, required=False)
    tipo_vaga_procurada = TipoVagaProcuradaSerializer(required=False)
    
    class Meta:
        model = Curriculo
        fields = '__all__'
        read_only_fields = ('trabalhador',)
    
    def create(self, validated_data):
        # Extrair dados dos relacionamentos
        escolaridades_data = validated_data.pop('escolaridades', [])
        experiencias_data = validated_data.pop('experiencias_profissionais', [])
        habilidades_data = validated_data.pop('habilidades', [])
        cursos_data = validated_data.pop('cursos', [])
        idiomas_data = validated_data.pop('idiomas', [])
        tipo_vaga_data = validated_data.pop('tipo_vaga_procurada', None)
        
        # Criar currículo
        curriculo = Curriculo.objects.create(**validated_data)
        
        # Criar relacionamentos
        for escolaridade_data in escolaridades_data:
            Escolaridade.objects.create(curriculo=curriculo, **escolaridade_data)
        
        for experiencia_data in experiencias_data:
            ExperienciaProfissional.objects.create(curriculo=curriculo, **experiencia_data)
        
        for habilidade_data in habilidades_data:
            Habilidade.objects.create(curriculo=curriculo, **habilidade_data)
        
        for curso_data in cursos_data:
            Curso.objects.create(curriculo=curriculo, **curso_data)
        
        for idioma_data in idiomas_data:
            Idioma.objects.create(curriculo=curriculo, **idioma_data)
        
        if tipo_vaga_data:
            TipoVagaProcurada.objects.create(curriculo=curriculo, **tipo_vaga_data)
        
        return curriculo
    
    def update(self, instance, validated_data):
        # Extrair dados dos relacionamentos
        escolaridades_data = validated_data.pop('escolaridades', None)
        experiencias_data = validated_data.pop('experiencias_profissionais', None)
        habilidades_data = validated_data.pop('habilidades', None)
        cursos_data = validated_data.pop('cursos', None)
        idiomas_data = validated_data.pop('idiomas', None)
        tipo_vaga_data = validated_data.pop('tipo_vaga_procurada', None)
        
        # Atualizar currículo
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Atualizar relacionamentos se fornecidos
        if escolaridades_data is not None:
            instance.escolaridades.all().delete()
            for escolaridade_data in escolaridades_data:
                Escolaridade.objects.create(curriculo=instance, **escolaridade_data)
        
        if experiencias_data is not None:
            instance.experiencias.all().delete()
            for experiencia_data in experiencias_data:
                ExperienciaProfissional.objects.create(curriculo=instance, **experiencia_data)
        
        if habilidades_data is not None:
            instance.habilidades.all().delete()
            for habilidade_data in habilidades_data:
                Habilidade.objects.create(curriculo=instance, **habilidade_data)
        
        if cursos_data is not None:
            instance.cursos.all().delete()
            for curso_data in cursos_data:
                Curso.objects.create(curriculo=instance, **curso_data)
        
        if idiomas_data is not None:
            instance.idiomas.all().delete()
            for idioma_data in idiomas_data:
                Idioma.objects.create(curriculo=instance, **idioma_data)
        
        if tipo_vaga_data is not None:
            # Deletar tipo de vaga existente
            TipoVagaProcurada.objects.filter(curriculo=instance).delete()
            TipoVagaProcurada.objects.create(curriculo=instance, **tipo_vaga_data)
        
        return instance
