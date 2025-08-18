import React, { useState } from 'react';
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
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import api from '../../services/api';

const steps = [
  'Dados Pessoais',
  'Dados Profissionais',
  'Escolaridade',
  'Experiências',
  'Habilidades'
];

const CriarCandidatoCompleto = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      // Dados pessoais
      first_name: '',
      last_name: '',
      email: '',
      telefone: '',
      cpf: '',
      endereco: '',
      data_nascimento: '',
      password: '',
      confirm_password: '',
      
      // Dados do currículo
      objetivo: '',
      resumo_profissional: '',
      pretensao_salarial: '',
      disponibilidade_viagem: false,
      disponibilidade_mudanca: false,
      
      // Escolaridades
      escolaridades: [{
        nivel: '',
        instituicao: '',
        curso: '',
        ano_inicio: '',
        ano_conclusao: '',
        situacao: 'concluido'
      }],
      
      // Experiências
      experiencias: [{
        empresa: '',
        cargo: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        emprego_atual: false,
        salario: ''
      }],
      
      // Habilidades
      habilidades: [{
        nome: '',
        nivel: 'intermediario',
        descricao: ''
      }],
      
      // Preferências de vaga
      areas_interesse: '',
      cargos_interesse: '',
      tipo_contrato: 'clt',
      jornada_trabalho: 'integral',
      salario_minimo: '',
      aceita_viagem: false,
      aceita_mudanca: false
    }
  });

  const { fields: escolaridadeFields, append: appendEscolaridade, remove: removeEscolaridade } = useFieldArray({
    control,
    name: 'escolaridades'
  });

  const { fields: experienciaFields, append: appendExperiencia, remove: removeExperiencia } = useFieldArray({
    control,
    name: 'experiencias'
  });

  const { fields: habilidadeFields, append: appendHabilidade, remove: removeHabilidade } = useFieldArray({
    control,
    name: 'habilidades'
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      if (data.password !== data.confirm_password) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }

      const candidatoData = {
        // Dados do usuário
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.email,
        telefone: data.telefone,
        cpf_cnpj: data.cpf || '',
        cpf: data.cpf || '',
        endereco: data.endereco || '',
        data_nascimento: data.data_nascimento || '',
        password: data.password,
        
        // Dados do currículo
        curriculo: {
          objetivo: data.objetivo,
          resumo_profissional: data.resumo_profissional,
          pretensao_salarial: data.pretensao_salarial ? parseFloat(data.pretensao_salarial) : null,
          disponibilidade_viagem: data.disponibilidade_viagem,
          disponibilidade_mudanca: data.disponibilidade_mudanca,
          
          // Escolaridades
          escolaridades: data.escolaridades.filter(esc => esc.instituicao && esc.curso),
          
          // Experiências
          experiencias: data.experiencias.filter(exp => exp.empresa && exp.cargo && exp.descricao),
          
          // Habilidades
          habilidades: data.habilidades.filter(hab => hab.nome),
          
          // Preferências de vaga
          tipo_vaga_procurada: {
            areas_interesse: data.areas_interesse,
            cargos_interesse: data.cargos_interesse,
            tipo_contrato: data.tipo_contrato,
            jornada_trabalho: data.jornada_trabalho,
            salario_minimo: data.salario_minimo ? parseFloat(data.salario_minimo) : null,
            aceita_viagem: data.aceita_viagem,
            aceita_mudanca: data.aceita_mudanca
          }
        }
      };

      await api.post('/api/usuarios/candidato/criar-completo/', candidatoData);
      alert('Candidato e currículo criados com sucesso!');
      navigate('/gerenciar-candidatos');
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      if (error.response?.data?.email) {
        setError('Este email já está em uso');
      } else if (error.response?.data) {
        const errorMessages = Object.values(error.response.data).flat().join(', ');
        setError(`Erro ao criar candidato: ${errorMessages}`);
      } else {
        setError('Erro ao criar candidato. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderDadosPessoais();
      case 1:
        return renderDadosProfissionais();
      case 2:
        return renderEscolaridade();
      case 3:
        return renderExperiencias();
      case 4:
        return renderHabilidades();
      default:
        return 'Unknown step';
    }
  };

  const renderDadosPessoais = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Dados Pessoais
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="first_name"
          control={control}
          rules={{ required: 'Nome é obrigatório' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nome"
              fullWidth
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="last_name"
          control={control}
          rules={{ required: 'Sobrenome é obrigatório' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Sobrenome"
              fullWidth
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="email"
          control={control}
          rules={{ 
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="telefone"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Telefone"
              fullWidth
              error={!!errors.telefone}
              helperText={errors.telefone?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="CPF (Opcional)"
              fullWidth
              error={!!errors.cpf}
              helperText={errors.cpf?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="data_nascimento"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data de Nascimento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.data_nascimento}
              helperText={errors.data_nascimento?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="endereco"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Endereço (Opcional)"
              fullWidth
              multiline
              rows={2}
              error={!!errors.endereco}
              helperText={errors.endereco?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="password"
          control={control}
          rules={{ 
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Senha"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="confirm_password"
          control={control}
          rules={{ 
            required: 'Confirmação de senha é obrigatória',
            validate: value => value === password || 'As senhas não coincidem'
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirmar Senha"
              type="password"
              fullWidth
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );

  const renderDadosProfissionais = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Dados Profissionais
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="objetivo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Objetivo Profissional"
              fullWidth
              multiline
              rows={3}
              placeholder="Ex: Busco uma oportunidade na área de tecnologia..."
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="resumo_profissional"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Resumo Profissional"
              fullWidth
              multiline
              rows={4}
              placeholder="Descreva sua experiência e qualificações..."
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="pretensao_salarial"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Pretensão Salarial (R$)"
              type="number"
              fullWidth
              placeholder="Ex: 3000"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Controller
            name="disponibilidade_viagem"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Disponibilidade para viagem"
              />
            )}
          />
          <Controller
            name="disponibilidade_mudanca"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Disponibilidade para mudança"
              />
            )}
          />
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Preferências de Vaga
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="areas_interesse"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Áreas de Interesse"
              fullWidth
              placeholder="Ex: Tecnologia, Marketing, Vendas"
              helperText="Separe as áreas por vírgula"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="cargos_interesse"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Cargos de Interesse"
              fullWidth
              placeholder="Ex: Desenvolvedor, Analista, Gerente"
              helperText="Separe os cargos por vírgula"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Controller
          name="tipo_contrato"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Tipo de Contrato</InputLabel>
              <Select {...field}>
                <MenuItem value="clt">CLT</MenuItem>
                <MenuItem value="pj">Pessoa Jurídica</MenuItem>
                <MenuItem value="temporario">Temporário</MenuItem>
                <MenuItem value="estagio">Estágio</MenuItem>
                <MenuItem value="freelancer">Freelancer</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Controller
          name="jornada_trabalho"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Jornada de Trabalho</InputLabel>
              <Select {...field}>
                <MenuItem value="integral">Tempo Integral</MenuItem>
                <MenuItem value="meio_periodo">Meio Período</MenuItem>
                <MenuItem value="flexivel">Flexível</MenuItem>
                <MenuItem value="escala">Escala</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Controller
          name="salario_minimo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Salário Mínimo Desejado (R$)"
              type="number"
              fullWidth
              placeholder="Ex: 2500"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Controller
            name="aceita_viagem"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Aceita viajar a trabalho"
              />
            )}
          />
          <Controller
            name="aceita_mudanca"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Aceita mudança de cidade"
              />
            )}
          />
        </Box>
      </Grid>
    </Grid>
  );

  const renderEscolaridade = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Escolaridade</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => appendEscolaridade({
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
      </Grid>

      {escolaridadeFields.map((field, index) => (
        <Grid item xs={12} key={field.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Escolaridade {index + 1}</Typography>
                {escolaridadeFields.length > 1 && (
                  <IconButton onClick={() => removeEscolaridade(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`escolaridades.${index}.nivel`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Nível</InputLabel>
                        <Select {...field}>
                          <MenuItem value="fundamental_completo">Ensino Fundamental Completo</MenuItem>
                          <MenuItem value="medio_completo">Ensino Médio Completo</MenuItem>
                          <MenuItem value="tecnico">Técnico</MenuItem>
                          <MenuItem value="superior_incompleto">Superior Incompleto</MenuItem>
                          <MenuItem value="superior_completo">Superior Completo</MenuItem>
                          <MenuItem value="pos_graduacao">Pós-graduação</MenuItem>
                          <MenuItem value="mestrado">Mestrado</MenuItem>
                          <MenuItem value="doutorado">Doutorado</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`escolaridades.${index}.situacao`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Situação</InputLabel>
                        <Select {...field}>
                          <MenuItem value="concluido">Concluído</MenuItem>
                          <MenuItem value="cursando">Cursando</MenuItem>
                          <MenuItem value="trancado">Trancado</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`escolaridades.${index}.instituicao`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Instituição"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`escolaridades.${index}.curso`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Curso"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`escolaridades.${index}.ano_inicio`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ano de Início"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`escolaridades.${index}.ano_conclusao`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ano de Conclusão"
                        type="number"
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderExperiencias = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Experiências Profissionais</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => appendExperiencia({
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
      </Grid>

      {experienciaFields.map((field, index) => (
        <Grid item xs={12} key={field.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Experiência {index + 1}</Typography>
                {experienciaFields.length > 1 && (
                  <IconButton onClick={() => removeExperiencia(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`experiencias.${index}.empresa`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Empresa"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name={`experiencias.${index}.cargo`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cargo"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`experiencias.${index}.descricao`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Descrição das Atividades"
                        fullWidth
                        multiline
                        rows={3}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name={`experiencias.${index}.data_inicio`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de Início"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Controller
                    name={`experiencias.${index}.data_fim`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de Fim"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        disabled={watch(`experiencias.${index}.emprego_atual`)}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Controller
                      name={`experiencias.${index}.emprego_atual`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Checkbox {...field} checked={field.value} />}
                          label="Emprego atual"
                        />
                      )}
                    />
                    <Controller
                      name={`experiencias.${index}.salario`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Salário (R$)"
                          type="number"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderHabilidades = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Habilidades</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => appendHabilidade({
              nome: '',
              nivel: 'intermediario',
              descricao: ''
            })}
          >
            Adicionar Habilidade
          </Button>
        </Box>
      </Grid>

      {habilidadeFields.map((field, index) => (
        <Grid item xs={12} md={6} key={field.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Habilidade {index + 1}</Typography>
                {habilidadeFields.length > 1 && (
                  <IconButton onClick={() => removeHabilidade(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name={`habilidades.${index}.nome`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nome da Habilidade"
                        fullWidth
                        placeholder="Ex: JavaScript, Liderança, Excel"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`habilidades.${index}.nivel`}
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Nível</InputLabel>
                        <Select {...field}>
                          <MenuItem value="basico">Básico</MenuItem>
                          <MenuItem value="intermediario">Intermediário</MenuItem>
                          <MenuItem value="avancado">Avançado</MenuItem>
                          <MenuItem value="especialista">Especialista</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name={`habilidades.${index}.descricao`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Descrição (Opcional)"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Descreva sua experiência com esta habilidade..."
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Criar Novo Candidato com Currículo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Voltar
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/gerenciar-candidatos')}
                disabled={loading}
              >
                Cancelar
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Candidato'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Próximo
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CriarCandidatoCompleto;
