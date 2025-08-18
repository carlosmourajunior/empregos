import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  MenuItem,
  IconButton,
  Alert,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const steps = [
  'Dados Básicos',
  'Escolaridade',
  'Experiências',
  'Habilidades',
  'Preferências'
];

const CurriculoForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: userId } = useParams(); // ID do usuário da URL
  const isAdmin = user?.tipo_usuario === 'admin';
  const isEditing = Boolean(userId); // Se tem ID na URL, está editando
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trabalhadores, setTrabalhadores] = useState([]);
  const [selectedTrabalhador, setSelectedTrabalhador] = useState(null);
  
  const [curriculo, setCurriculo] = useState({
    objetivo: '',
    resumo_profissional: '',
    pretensao_salarial: '',
    disponibilidade_viagem: false,
    disponibilidade_mudanca: false,
  });

  const [escolaridades, setEscolaridades] = useState([{
    nivel: '',
    instituicao: '',
    curso: '',
    ano_inicio: '',
    ano_conclusao: '',
    situacao: 'concluido'
  }]);

  const [experiencias, setExperiencias] = useState([{
    empresa: '',
    cargo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    emprego_atual: false,
    salario: ''
  }]);

  const [habilidades, setHabilidades] = useState([{
    nome: '',
    nivel: 'intermediario',
    descricao: ''
  }]);

  const [preferencias, setPreferencias] = useState({
    areas_interesse: '',
    cargos_interesse: '',
    tipo_contrato: 'clt',
    jornada_trabalho: 'integral',
    salario_minimo: '',
    aceita_viagem: false,
    aceita_mudanca: false
  });

  useEffect(() => {
    if (isAdmin) {
      loadTrabalhadores();
      if (userId) {
        // Admin editando currículo de um usuário específico
        loadCurriculoPorUsuario(userId);
      }
    } else if (isEditing) {
      // Trabalhador não pode editar currículo de outro
      navigate('/curriculo/editar');
    } else {
      // Trabalhador editando seu próprio currículo
      loadCurriculo();
    }
  }, [isAdmin, userId, isEditing]);

  const loadTrabalhadores = async () => {
    try {
      const response = await api.get('/api/usuarios/trabalhadores/');
      setTrabalhadores(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar trabalhadores:', error);
    }
  };

  const loadCurriculoPorUsuario = async (userId) => {
    try {
      const response = await api.get(`/api/curriculos/usuario/${userId}/`);
      const data = response.data;
      
      // Para admin editando, definir o trabalhador selecionado
      if (isAdmin && data.trabalhador) {
        setSelectedTrabalhador(data.trabalhador);
      }
      
      setCurriculoData(data);
    } catch (error) {
      console.error('Erro ao carregar currículo por usuário:', error);
      if (error.response?.status === 404) {
        setError('Este usuário ainda não possui currículo cadastrado.');
      } else {
        setError('Erro ao carregar dados do currículo');
      }
    }
  };

  const loadCurriculoPorId = async (id) => {
    try {
      const response = await api.get(`/api/curriculos/${id}/`);
      const data = response.data;
      
      // Para admin editando, definir o trabalhador selecionado
      if (isAdmin && data.trabalhador) {
        setSelectedTrabalhador(data.trabalhador);
      }
      
      setCurriculoData(data);
    } catch (error) {
      console.error('Erro ao carregar currículo por ID:', error);
      setError('Erro ao carregar dados do currículo');
    }
  };

  const loadCurriculo = async () => {
    try {
      const response = await api.get('/api/curriculos/meu/');
      const data = response.data;
      
      setCurriculoData(data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar currículo:', error);
        setError('Erro ao carregar dados do currículo');
      }
    }
  };

  const setCurriculoData = (data) => {
    setCurriculo({
      objetivo: data.objetivo || '',
      resumo_profissional: data.resumo_profissional || '',
      pretensao_salarial: data.pretensao_salarial || '',
      disponibilidade_viagem: data.disponibilidade_viagem || false,
      disponibilidade_mudanca: data.disponibilidade_mudanca || false,
    });

    if (data.escolaridades?.length > 0) {
      setEscolaridades(data.escolaridades);
    }
    
    if (data.experiencias_profissionais?.length > 0) {
      setExperiencias(data.experiencias_profissionais.map(exp => ({
        empresa: exp.empresa || '',
        cargo: exp.cargo || '',
        descricao: exp.descricao || '',
        data_inicio: exp.data_inicio || '',
        data_fim: exp.data_fim || '',
        emprego_atual: exp.emprego_atual || false,
        salario: exp.salario || ''
      })));
    }
    
    if (data.habilidades?.length > 0) {
      setHabilidades(data.habilidades);
    }
    
    if (data.tipos_vaga_procurada?.length > 0) {
      const tipos = data.tipos_vaga_procurada[0];
      setPreferencias({
        areas_interesse: tipos.areas_interesse || '',
        cargos_interesse: tipos.cargos_interesse || '',
        tipo_contrato: tipos.tipo_contrato || 'clt',
        jornada_trabalho: tipos.jornada_trabalho || 'integral',
        salario_minimo: tipos.salario_minimo || '',
        aceita_viagem: tipos.aceita_viagem || false,
        aceita_mudanca: tipos.aceita_mudanca || false
      });
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validação para admin criando novo currículo
      if (isAdmin && !curriculoId && !selectedTrabalhador) {
        setError('Selecione um trabalhador para criar o currículo');
        return;
      }
      
      // Validações básicas
      const experienciasValidas = experiencias.filter(exp => 
        exp.empresa && exp.cargo && exp.descricao && exp.data_inicio
      );
      
      if (experiencias.length > 0 && experienciasValidas.length === 0) {
        setError('Preencha todos os campos obrigatórios das experiências (empresa, cargo, descrição e data de início)');
        return;
      }
      
      // Mapear experiências para o formato do backend
      const experienciasFormatted = experienciasValidas.map(exp => ({
        empresa: exp.empresa,
        cargo: exp.cargo,
        descricao: exp.descricao,
        data_inicio: exp.data_inicio,
        data_fim: exp.data_fim || null,
        emprego_atual: exp.emprego_atual,
        salario: exp.salario ? parseFloat(exp.salario) : null
      }));

      const data = {
        objetivo: curriculo.objetivo,
        resumo_profissional: curriculo.resumo_profissional,
        pretensao_salarial: curriculo.pretensao_salarial ? parseFloat(curriculo.pretensao_salarial) : null,
        disponibilidade_viagem: curriculo.disponibilidade_viagem,
        disponibilidade_mudanca: curriculo.disponibilidade_mudanca,
        escolaridades: escolaridades.filter(esc => esc.nivel && esc.instituicao),
        experiencias_profissionais: experienciasFormatted,
        habilidades: habilidades.filter(hab => hab.nome),
        tipos_vaga_procurada: preferencias.areas_interesse || preferencias.cargos_interesse ? [preferencias] : []
      };

      // Se for admin criando novo currículo, adicionar o trabalhador selecionado
      if (isAdmin && !curriculoId && selectedTrabalhador) {
        data.trabalhador_id = selectedTrabalhador.id;
      }

      // Escolher método HTTP baseado em se está editando ou criando
      if (curriculoId) {
        // Editando currículo existente
        await api.put(`/api/curriculos/${curriculoId}/`, data);
      } else {
        // Criando novo currículo
        await api.post('/api/curriculos/', data);
      }
      
      // Redirecionar conforme o tipo de usuário
      if (isAdmin) {
        navigate('/candidatos', { replace: true });
      } else {
        navigate('/curriculo', { replace: true });
      }
      
    } catch (error) {
      setError('Erro ao salvar currículo. Verifique os dados e tente novamente.');
      console.error('Erro:', error);
      
      // Mostrar detalhes do erro se disponível
      if (error.response?.data) {
        console.error('Detalhes do erro:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = (setter, defaultItem) => {
    setter(prev => [...prev, { ...defaultItem }]);
  };

  const removeItem = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (setter, index, field, value) => {
    setter(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const renderDadosBasicos = () => (
    <Grid container spacing={3}>
      {isAdmin && !isEditing && (
        <Grid item xs={12}>
          <Autocomplete
            options={trabalhadores}
            getOptionLabel={(option) => {
              const firstName = option.usuario?.first_name || option.first_name || '';
              const lastName = option.usuario?.last_name || option.last_name || '';
              const email = option.usuario?.email || option.email || '';
              return `${firstName} ${lastName} (${email})`.trim();
            }}
            value={selectedTrabalhador}
            onChange={(event, newValue) => setSelectedTrabalhador(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecionar Trabalhador"
                required
                helperText="Selecione o trabalhador para criar o currículo"
              />
            )}
          />
        </Grid>
      )}
      
      {isAdmin && isEditing && selectedTrabalhador && (
        <Grid item xs={12}>
          <Alert severity="info">
            Editando currículo de: <strong>{selectedTrabalhador.first_name} {selectedTrabalhador.last_name}</strong> ({selectedTrabalhador.email})
          </Alert>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Objetivo Profissional"
          value={curriculo.objetivo}
          onChange={(e) => setCurriculo(prev => ({ ...prev, objetivo: e.target.value }))}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Resumo Profissional"
          value={curriculo.resumo_profissional}
          onChange={(e) => setCurriculo(prev => ({ ...prev, resumo_profissional: e.target.value }))}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Pretensão Salarial"
          type="number"
          value={curriculo.pretensao_salarial}
          onChange={(e) => setCurriculo(prev => ({ ...prev, pretensao_salarial: e.target.value }))}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={curriculo.disponibilidade_viagem}
              onChange={(e) => setCurriculo(prev => ({ ...prev, disponibilidade_viagem: e.target.checked }))}
            />
          }
          label="Disponibilidade para viagens"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={curriculo.disponibilidade_mudanca}
              onChange={(e) => setCurriculo(prev => ({ ...prev, disponibilidade_mudanca: e.target.checked }))}
            />
          }
          label="Disponibilidade para mudança"
        />
      </Grid>
    </Grid>
  );

  const renderEscolaridade = () => (
    <Box>
      {escolaridades.map((escolaridade, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Nível"
                value={escolaridade.nivel}
                onChange={(e) => updateItem(setEscolaridades, index, 'nivel', e.target.value)}
              >
                <MenuItem value="fundamental_completo">Ensino Fundamental</MenuItem>
                <MenuItem value="medio_completo">Ensino Médio</MenuItem>
                <MenuItem value="tecnico">Técnico</MenuItem>
                <MenuItem value="superior_completo">Superior</MenuItem>
                <MenuItem value="pos_graduacao">Pós-graduação</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Instituição"
                value={escolaridade.instituicao}
                onChange={(e) => updateItem(setEscolaridades, index, 'instituicao', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Curso"
                value={escolaridade.curso}
                onChange={(e) => updateItem(setEscolaridades, index, 'curso', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Ano Início"
                type="number"
                value={escolaridade.ano_inicio}
                onChange={(e) => updateItem(setEscolaridades, index, 'ano_inicio', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Ano Conclusão"
                type="number"
                value={escolaridade.ano_conclusao}
                onChange={(e) => updateItem(setEscolaridades, index, 'ano_conclusao', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => removeItem(setEscolaridades, index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => addItem(setEscolaridades, {
          nivel: '',
          instituicao: '',
          curso: '',
          ano_inicio: '',
          ano_conclusao: '',
          situacao: 'concluido'
        })}
      >
        Adicionar Escolaridade
      </Button>
    </Box>
  );

  const renderExperiencias = () => (
    <Box>
      {experiencias.map((experiencia, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Empresa"
                value={experiencia.empresa}
                onChange={(e) => updateItem(setExperiencias, index, 'empresa', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={experiencia.cargo}
                onChange={(e) => updateItem(setExperiencias, index, 'cargo', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descrição das Atividades"
                value={experiencia.descricao}
                onChange={(e) => updateItem(setExperiencias, index, 'descricao', e.target.value)}
                required
                helperText="Descreva suas principais atividades e responsabilidades"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={experiencia.data_inicio}
                onChange={(e) => updateItem(setExperiencias, index, 'data_inicio', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={experiencia.data_fim}
                disabled={experiencia.emprego_atual}
                onChange={(e) => updateItem(setExperiencias, index, 'data_fim', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Salário"
                type="number"
                value={experiencia.salario}
                onChange={(e) => updateItem(setExperiencias, index, 'salario', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={experiencia.emprego_atual}
                    onChange={(e) => updateItem(setExperiencias, index, 'emprego_atual', e.target.checked)}
                  />
                }
                label="Emprego atual"
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => removeItem(setExperiencias, index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => addItem(setExperiencias, {
          empresa: '',
          cargo: '',
          descricao: '',
          data_inicio: '',
          data_fim: '',
          emprego_atual: false,
          salario: ''
        })}
      >
        Adicionar Experiência
      </Button>
    </Box>
  );

  const renderHabilidades = () => (
    <Box>
      {habilidades.map((habilidade, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Habilidade"
                value={habilidade.nome}
                onChange={(e) => updateItem(setHabilidades, index, 'nome', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Nível"
                value={habilidade.nivel}
                onChange={(e) => updateItem(setHabilidades, index, 'nivel', e.target.value)}
              >
                <MenuItem value="basico">Básico</MenuItem>
                <MenuItem value="intermediario">Intermediário</MenuItem>
                <MenuItem value="avancado">Avançado</MenuItem>
                <MenuItem value="especialista">Especialista</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descrição"
                value={habilidade.descricao}
                onChange={(e) => updateItem(setHabilidades, index, 'descricao', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <IconButton onClick={() => removeItem(setHabilidades, index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={() => addItem(setHabilidades, {
          nome: '',
          nivel: 'intermediario',
          descricao: ''
        })}
      >
        Adicionar Habilidade
      </Button>
    </Box>
  );

  const renderPreferencias = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Áreas de Interesse"
          value={preferencias.areas_interesse}
          onChange={(e) => setPreferencias(prev => ({ ...prev, areas_interesse: e.target.value }))}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Cargos de Interesse"
          value={preferencias.cargos_interesse}
          onChange={(e) => setPreferencias(prev => ({ ...prev, cargos_interesse: e.target.value }))}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Tipo de Contrato"
          value={preferencias.tipo_contrato}
          onChange={(e) => setPreferencias(prev => ({ ...prev, tipo_contrato: e.target.value }))}
        >
          <MenuItem value="clt">CLT</MenuItem>
          <MenuItem value="pj">Pessoa Jurídica</MenuItem>
          <MenuItem value="freelancer">Freelancer</MenuItem>
          <MenuItem value="estagio">Estágio</MenuItem>
          <MenuItem value="temporario">Temporário</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          select
          label="Jornada de Trabalho"
          value={preferencias.jornada_trabalho}
          onChange={(e) => setPreferencias(prev => ({ ...prev, jornada_trabalho: e.target.value }))}
        >
          <MenuItem value="integral">Integral</MenuItem>
          <MenuItem value="meio_periodo">Meio Período</MenuItem>
          <MenuItem value="flexivel">Flexível</MenuItem>
          <MenuItem value="home_office">Home Office</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Salário Mínimo Desejado"
          type="number"
          value={preferencias.salario_minimo}
          onChange={(e) => setPreferencias(prev => ({ ...prev, salario_minimo: e.target.value }))}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          control={
            <Checkbox
              checked={preferencias.aceita_viagem}
              onChange={(e) => setPreferencias(prev => ({ ...prev, aceita_viagem: e.target.checked }))}
            />
          }
          label="Aceita viajar a trabalho"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={preferencias.aceita_mudanca}
              onChange={(e) => setPreferencias(prev => ({ ...prev, aceita_mudanca: e.target.checked }))}
            />
          }
          label="Aceita mudança de cidade"
        />
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0: return renderDadosBasicos();
      case 1: return renderEscolaridade();
      case 2: return renderExperiencias();
      case 3: return renderHabilidades();
      case 4: return renderPreferencias();
      default: return 'Etapa desconhecida';
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        {isAdmin ? 'Cadastrar Currículo de Candidato' : 'Meu Currículo'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Voltar
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Currículo'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Próximo
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CurriculoForm;
