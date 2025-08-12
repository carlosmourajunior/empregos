from django.db import models
from usuarios.models import CustomUser

class Vaga(models.Model):
    TIPO_CONTRATO_CHOICES = [
        ('clt', 'CLT'),
        ('pj', 'Pessoa Jurídica'),
        ('temporario', 'Temporário'),
        ('estagio', 'Estágio'),
        ('freelancer', 'Freelancer'),
        ('terceirizado', 'Terceirizado'),
    ]
    
    JORNADA_CHOICES = [
        ('integral', 'Tempo Integral'),
        ('meio_periodo', 'Meio Período'),
        ('flexivel', 'Flexível'),
        ('escala', 'Escala'),
    ]
    
    STATUS_CHOICES = [
        ('ativa', 'Ativa'),
        ('pausada', 'Pausada'),
        ('encerrada', 'Encerrada'),
        ('preenchida', 'Preenchida'),
    ]
    
    empresa = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='vagas',
        limit_choices_to={'tipo_usuario': 'empresa'}
    )
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    requisitos = models.TextField()
    beneficios = models.TextField(blank=True)
    salario_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salario_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tipo_contrato = models.CharField(max_length=15, choices=TIPO_CONTRATO_CHOICES)
    jornada_trabalho = models.CharField(max_length=15, choices=JORNADA_CHOICES)
    local_trabalho = models.CharField(max_length=200)
    aceita_remoto = models.BooleanField(default=False)
    requer_viagem = models.BooleanField(default=False)
    area = models.CharField(max_length=100)
    nivel_experiencia = models.CharField(max_length=50, choices=[
        ('estagiario', 'Estagiário'),
        ('junior', 'Júnior'),
        ('pleno', 'Pleno'),
        ('senior', 'Sênior'),
        ('especialista', 'Especialista'),
    ])
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='ativa')
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    data_encerramento = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"{self.titulo} - {self.empresa.perfil_empresa.nome_empresa}"

class RequisitoVaga(models.Model):
    TIPO_REQUISITO_CHOICES = [
        ('escolaridade', 'Escolaridade'),
        ('experiencia', 'Experiência'),
        ('habilidade', 'Habilidade'),
        ('idioma', 'Idioma'),
        ('certificacao', 'Certificação'),
        ('habilitacao', 'Habilitação'),
    ]
    
    NIVEL_IMPORTANCIA_CHOICES = [
        ('obrigatorio', 'Obrigatório'),
        ('desejavel', 'Desejável'),
        ('diferencial', 'Diferencial'),
    ]
    
    vaga = models.ForeignKey(Vaga, on_delete=models.CASCADE, related_name='requisitos_detalhados')
    tipo = models.CharField(max_length=15, choices=TIPO_REQUISITO_CHOICES)
    descricao = models.CharField(max_length=200)
    nivel_importancia = models.CharField(max_length=15, choices=NIVEL_IMPORTANCIA_CHOICES)
    peso = models.IntegerField(default=1, help_text="Peso para o sistema de matching (1-10)")
    
    def __str__(self):
        return f"{self.get_tipo_display()}: {self.descricao}"

class CandidaturaVaga(models.Model):
    STATUS_CHOICES = [
        ('candidatado', 'Candidatado'),
        ('em_analise', 'Em Análise'),
        ('pre_selecionado', 'Pré-selecionado'),
        ('entrevista', 'Entrevista'),
        ('aprovado', 'Aprovado'),
        ('reprovado', 'Reprovado'),
        ('desistiu', 'Desistiu'),
    ]
    
    vaga = models.ForeignKey(Vaga, on_delete=models.CASCADE, related_name='candidaturas')
    trabalhador = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='candidaturas',
        limit_choices_to={'tipo_usuario': 'trabalhador'}
    )
    data_candidatura = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='candidatado')
    score_compatibilidade = models.FloatField(null=True, blank=True)
    observacoes = models.TextField(blank=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('vaga', 'trabalhador')
        ordering = ['-score_compatibilidade', '-data_candidatura']
    
    def __str__(self):
        return f"{self.trabalhador.get_full_name()} - {self.vaga.titulo}"

class AvaliacaoCandidato(models.Model):
    candidatura = models.OneToOneField(CandidaturaVaga, on_delete=models.CASCADE, related_name='avaliacao')
    avaliador = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    nota_geral = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 a 5
    nota_experiencia = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    nota_habilidades = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    nota_perfil = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comentarios = models.TextField(blank=True)
    data_avaliacao = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Avaliação: {self.candidatura} - Nota: {self.nota_geral}"
