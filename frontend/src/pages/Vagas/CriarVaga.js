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
      responsabilidades: '',
      requisitos_texto: '',
      beneficios: '',
      salario_min: '',
      salario_max: '',
      localizacao: '',
      tipo_contrato: '',
      escolaridade_minima: '',
      experiencia_minima: 0,
      numero_vagas: 1,
      data_limite: '',
      requisitos: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requisitos'
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
    'CLT',
    'PJ',
    'Temporário',
    'Estágio',
    'Freelancer',
    'Meio período'
  ];

  const niveisEscolaridade = [
    'Fundamental',
    'Médio',
    'Técnico',
    'Superior',
    'Pós-graduação',
    'Mestrado',
    'Doutorado'
  ];

  const tiposRequisito = [
    'Experiência',
    'Habilidade',
    'Certificação',
    'Idioma',
    'Software',
    'Outro'
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
      tipo_requisito: '',
      descricao: '',
      obrigatorio: false
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
                name="responsabilidades"
                control={control}
                rules={{ required: 'Responsabilidades são obrigatórias' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Responsabilidades"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.responsabilidades}
                    helperText={errors.responsabilidades?.message}
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
                name="localizacao"
                control={control}
                rules={{ required: 'Localização é obrigatória' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Localização"
                    fullWidth
                    error={!!errors.localizacao}
                    helperText={errors.localizacao?.message}
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
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
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
                rules={{ required: 'Escolaridade mínima é obrigatória' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.escolaridade_minima}>
                    <InputLabel>Escolaridade Mínima</InputLabel>
                    <Select {...field} label="Escolaridade Mínima">
                      {niveisEscolaridade.map((nivel) => (
                        <MenuItem key={nivel} value={nivel}>
                          {nivel}
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
                          name={`requisitos.${index}.tipo_requisito`}
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
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={`requisitos.${index}.descricao`}
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
                      <Grid item xs={12} md={2}>
                        <Controller
                          name={`requisitos.${index}.obrigatorio`}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={field.value} />}
                              label="Obrigatório"
                            />
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
