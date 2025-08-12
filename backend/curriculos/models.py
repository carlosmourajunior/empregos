from django.db import models
from usuarios.models import CustomUser

class Curriculo(models.Model):
    trabalhador = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='curriculo',
        limit_choices_to={'tipo_usuario': 'trabalhador'}
    )
    objetivo = models.TextField()
    resumo_profissional = models.TextField()
    pretensao_salarial = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    disponibilidade_viagem = models.BooleanField(default=False)
    disponibilidade_mudanca = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Currículo de {self.trabalhador.get_full_name()}"

class Escolaridade(models.Model):
    NIVEL_CHOICES = [
        ('fundamental_incompleto', 'Ensino Fundamental Incompleto'),
        ('fundamental_completo', 'Ensino Fundamental Completo'),
        ('medio_incompleto', 'Ensino Médio Incompleto'),
        ('medio_completo', 'Ensino Médio Completo'),
        ('tecnico', 'Técnico'),
        ('superior_incompleto', 'Superior Incompleto'),
        ('superior_completo', 'Superior Completo'),
        ('pos_graduacao', 'Pós-graduação'),
        ('mestrado', 'Mestrado'),
        ('doutorado', 'Doutorado'),
    ]
    
    curriculo = models.ForeignKey(Curriculo, on_delete=models.CASCADE, related_name='escolaridades')
    nivel = models.CharField(max_length=25, choices=NIVEL_CHOICES)
    instituicao = models.CharField(max_length=200)
    curso = models.CharField(max_length=200)
    ano_inicio = models.IntegerField()
    ano_conclusao = models.IntegerField(null=True, blank=True)
    situacao = models.CharField(max_length=20, choices=[
        ('cursando', 'Cursando'),
        ('concluido', 'Concluído'),
        ('trancado', 'Trancado'),
        ('abandonado', 'Abandonado'),
    ])
    
    def __str__(self):
        return f"{self.get_nivel_display()} - {self.curso}"

class ExperienciaProfissional(models.Model):
    curriculo = models.ForeignKey(Curriculo, on_delete=models.CASCADE, related_name='experiencias')
    empresa = models.CharField(max_length=200)
    cargo = models.CharField(max_length=200)
    descricao = models.TextField()
    data_inicio = models.DateField()
    data_fim = models.DateField(null=True, blank=True)
    emprego_atual = models.BooleanField(default=False)
    salario = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    class Meta:
        ordering = ['-data_inicio']
    
    def __str__(self):
        return f"{self.cargo} na {self.empresa}"

class Habilidade(models.Model):
    NIVEL_CHOICES = [
        ('basico', 'Básico'),
        ('intermediario', 'Intermediário'),
        ('avancado', 'Avançado'),
        ('especialista', 'Especialista'),
    ]
    
    curriculo = models.ForeignKey(Curriculo, on_delete=models.CASCADE, related_name='habilidades')
    nome = models.CharField(max_length=100)
    nivel = models.CharField(max_length=15, choices=NIVEL_CHOICES)
    descricao = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.nome} ({self.get_nivel_display()})"

class Curso(models.Model):
    curriculo = models.ForeignKey(Curriculo, on_delete=models.CASCADE, related_name='cursos')
    nome = models.CharField(max_length=200)
    instituicao = models.CharField(max_length=200)
    carga_horaria = models.IntegerField()
    data_conclusao = models.DateField()
    certificado = models.FileField(upload_to='certificados/', blank=True)
    
    def __str__(self):
        return self.nome

class Idioma(models.Model):
    NIVEL_CHOICES = [
        ('basico', 'Básico'),
        ('intermediario', 'Intermediário'),
        ('avancado', 'Avançado'),
        ('fluente', 'Fluente'),
        ('nativo', 'Nativo'),
    ]
    
    curriculo = models.ForeignKey(Curriculo, on_delete=models.CASCADE, related_name='idiomas')
    idioma = models.CharField(max_length=50)
    nivel_leitura = models.CharField(max_length=15, choices=NIVEL_CHOICES)
    nivel_escrita = models.CharField(max_length=15, choices=NIVEL_CHOICES)
    nivel_conversacao = models.CharField(max_length=15, choices=NIVEL_CHOICES)
    
    def __str__(self):
        return self.idioma

class TipoVagaProcurada(models.Model):
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
    
    curriculo = models.OneToOneField(Curriculo, on_delete=models.CASCADE, related_name='tipo_vaga_procurada')
    areas_interesse = models.TextField(help_text="Áreas de interesse separadas por vírgula")
    cargos_interesse = models.TextField(help_text="Cargos de interesse separados por vírgula")
    tipo_contrato = models.CharField(max_length=15, choices=TIPO_CONTRATO_CHOICES)
    jornada_trabalho = models.CharField(max_length=15, choices=JORNADA_CHOICES)
    salario_minimo = models.DecimalField(max_digits=10, decimal_places=2)
    aceita_viagem = models.BooleanField(default=False)
    aceita_mudanca = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Preferências de {self.curriculo.trabalhador.get_full_name()}"
