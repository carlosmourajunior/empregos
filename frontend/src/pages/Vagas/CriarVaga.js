import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Autocomplete
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CriarVaga = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const { user } = useAuth();
  
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      titulo: '',
      empresa: null, // Para seleção de empresa pelo admin
      descricao: '',
      requisitos: '',
      beneficios: '',
      salario_min: '',
      salario_max: '',
      local_trabalho: '',
      tipo_contrato: '',
      jornada_trabalho: '',
      area: '',
      nivel_experiencia: '',
      aceita_remoto: false,
      requer_viagem: false,
      escolaridade_minima: '',
      experiencia_minima: 0,
      numero_vagas: 1,
      data_limite: '',
      requisitos_detalhados: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requisitos_detalhados'
  });

  useEffect(() => {
    // Se for admin, carregar lista de empresas
    if (user?.tipo_usuario === 'admin') {
      carregarEmpresas();
    }
  }, [user]);

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/api/usuarios/?tipo_usuario=empresa');
      setEmpresas(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const tiposContrato = [
    { value: 'clt', label: 'CLT' },
    { value: 'pj', label: 'Pessoa Jurídica' },
    { value: 'temporario', label: 'Temporário' },
    { value: 'estagio', label: 'Estágio' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'terceirizado', label: 'Terceirizado' }
  ];

  const jornadaTrabalho = [
    { value: 'integral', label: 'Tempo Integral' },
    { value: 'meio_periodo', label: 'Meio Período' },
    { value: 'flexivel', label: 'Flexível' },
    { value: 'escala', label: 'Escala' }
  ];

  const niveisExperiencia = [
    { value: 'estagiario', label: 'Estagiário' },
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' }
  ];

  const niveisEscolaridade = [
    { value: 'fundamental', label: 'Ensino Fundamental' },
    { value: 'medio', label: 'Ensino Médio' },
    { value: 'tecnico', label: 'Ensino Técnico' },
    { value: 'superior', label: 'Ensino Superior' },
    { value: 'pos_graduacao', label: 'Pós-graduação' },
    { value: 'mestrado', label: 'Mestrado' },
    { value: 'doutorado', label: 'Doutorado' }
  ];

  const tiposRequisito = [
    'escolaridade',
    'experiencia', 
    'habilidade',
    'idioma',
    'certificacao',
    'habilitacao'
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Preparar dados para envio
      const vagaData = { ...data };
      
      // Se for admin, usar empresa selecionada, senão usar empresa do usuário logado
      if (user?.tipo_usuario === 'admin') {
        if (!data.empresa) {
          alert('Selecione uma empresa para a vaga.');
          setLoading(false);
          return;
        }
        vagaData.empresa = data.empresa.id;
      } else if (user?.tipo_usuario === 'empresa') {
        vagaData.empresa = user.id;
      }
      
      // Remover campo empresa do objeto se não for necessário
      if (vagaData.empresa && typeof vagaData.empresa === 'object') {
        delete vagaData.empresa;
      }
      
      await api.post('/api/vagas/', vagaData);
      alert('Vaga criada com sucesso!');
      navigate('/gerenciar-vagas');
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      alert('Erro ao criar vaga. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const adicionarRequisito = () => {
    append({
      tipo: '',
      descricao: '',
      nivel_importancia: 'obrigatorio'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Criar Nova Vaga
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Informações básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <Controller
                name="titulo"
                control={control}
                rules={{ required: 'Título é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Título da Vaga"
                    fullWidth
                    error={!!errors.titulo}
                    helperText={errors.titulo?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="numero_vagas"
                control={control}
                rules={{ required: 'Número de vagas é obrigatório', min: 1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número de Vagas"
                    type="number"
                    fullWidth
                    error={!!errors.numero_vagas}
                    helperText={errors.numero_vagas?.message}
                  />
                )}
              />
            </Grid>

            {/* Campo de seleção de empresa - apenas para admin */}
            {user?.tipo_usuario === 'admin' && (
              <Grid item xs={12} md={8}>
                <Controller
                  name="empresa"
                  control={control}
                  rules={{ required: 'Empresa é obrigatória' }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      options={empresas}
                      getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.email})`}
                      onChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Selecionar Empresa"
                          error={!!errors.empresa}
                          helperText={errors.empresa?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Controller
                name="descricao"
                control={control}
                rules={{ required: 'Descrição é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição da Vaga"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.descricao}
                    helperText={errors.descricao?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="requisitos"
                control={control}
                rules={{ required: 'Requisitos são obrigatórios' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Requisitos"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.requisitos}
                    helperText={errors.requisitos?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="beneficios"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Benefícios"
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Localização e contrato */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Localização e Contrato
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="local_trabalho"
                control={control}
                rules={{ required: 'Local de trabalho é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Local de Trabalho"
                    fullWidth
                    error={!!errors.local_trabalho}
                    helperText={errors.local_trabalho?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="area"
                control={control}
                rules={{ required: 'Área é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Área"
                    fullWidth
                    error={!!errors.area}
                    helperText={errors.area?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="tipo_contrato"
                control={control}
                rules={{ required: 'Tipo de contrato é obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tipo_contrato}>
                    <InputLabel>Tipo de Contrato</InputLabel>
                    <Select {...field} label="Tipo de Contrato">
                      {tiposContrato.map((tipo) => (
                        <MenuItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="jornada_trabalho"
                control={control}
                rules={{ required: 'Jornada de trabalho é obrigatória' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.jornada_trabalho}>
                    <InputLabel>Jornada de Trabalho</InputLabel>
                    <Select {...field} label="Jornada de Trabalho">
                      {jornadaTrabalho.map((jornada) => (
                        <MenuItem key={jornada.value} value={jornada.value}>
                          {jornada.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="data_limite"
                control={control}
                rules={{ required: 'Data limite é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data Limite para Candidaturas"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.data_limite}
                    helperText={errors.data_limite?.message}
                  />
                )}
              />
            </Grid>

            {/* Salário */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Faixa Salarial
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="salario_min"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Salário Mínimo (R$)"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { step: "0.01" } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="salario_max"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Salário Máximo (R$)"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { step: "0.01" } }}
                  />
                )}
              />
            </Grid>

            {/* Requisitos mínimos */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Requisitos Mínimos
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="escolaridade_minima"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Escolaridade Mínima</InputLabel>
                    <Select {...field} label="Escolaridade Mínima">
                      <MenuItem value="">Não especificado</MenuItem>
                      {niveisEscolaridade.map((nivel) => (
                        <MenuItem key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="nivel_experiencia"
                control={control}
                rules={{ required: 'Nível de experiência é obrigatório' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.nivel_experiencia}>
                    <InputLabel>Nível de Experiência</InputLabel>
                    <Select {...field} label="Nível de Experiência">
                      {niveisExperiencia.map((nivel) => (
                        <MenuItem key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="experiencia_minima"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Experiência Mínima (anos)"
                    type="number"
                    fullWidth
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="aceita_remoto"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Aceita trabalho remoto"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="requer_viagem"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Requer viagens"
                  />
                )}
              />
            </Grid>

            {/* Requisitos específicos */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="h6">
                  Requisitos Específicos
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={adicionarRequisito}
                  variant="outlined"
                >
                  Adicionar Requisito
                </Button>
              </Box>
            </Grid>

            {fields.map((field, index) => (
              <Grid item xs={12} key={field.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Controller
                          name={`requisitos_detalhados.${index}.tipo`}
                          control={control}
                          rules={{ required: 'Tipo é obrigatório' }}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Tipo</InputLabel>
                              <Select {...field} label="Tipo">
                                {tiposRequisito.map((tipo) => (
                                  <MenuItem key={tipo} value={tipo}>
                                    {tipo}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Controller
                          name={`requisitos_detalhados.${index}.descricao`}
                          control={control}
                          rules={{ required: 'Descrição é obrigatória' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Descrição"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Controller
                          name={`requisitos_detalhados.${index}.nivel_importancia`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel>Importância</InputLabel>
                              <Select {...field} label="Importância">
                                <MenuItem value="obrigatorio">Obrigatório</MenuItem>
                                <MenuItem value="desejavel">Desejável</MenuItem>
                                <MenuItem value="diferencial">Diferencial</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={1}>
                        <IconButton
                          onClick={() => remove(index)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Criando...' : 'Criar Vaga'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/vagas')}
                  size="large"
                >
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CriarVaga;
