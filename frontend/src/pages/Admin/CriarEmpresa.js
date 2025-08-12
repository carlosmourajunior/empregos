import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CriarEmpresa = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!id;

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      telefone: '',
      cnpj: '',
      nome_empresa: '',
      descricao: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      site: '',
      aprovado: false,
      password: '',
      confirm_password: ''
    }
  });

  const password = watch('password');

  useEffect(() => {
    if (isEditing) {
      carregarEmpresa();
    }
  }, [id, isEditing]);

  const carregarEmpresa = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/usuarios/${id}/`);
      const empresa = response.data;
      
      // Carregar dados do perfil da empresa se existir
      let perfilEmpresa = {};
      try {
        const perfilResponse = await api.get(`/api/usuarios/${id}/perfil-empresa/`);
        perfilEmpresa = perfilResponse.data;
      } catch (error) {
        console.log('Perfil de empresa não encontrado');
      }

      // Preencher formulário
      setValue('first_name', empresa.first_name || '');
      setValue('last_name', empresa.last_name || '');
      setValue('email', empresa.email || '');
      setValue('telefone', empresa.telefone || '');
      setValue('cnpj', perfilEmpresa.cnpj || '');
      setValue('nome_empresa', perfilEmpresa.nome_empresa || '');
      setValue('descricao', perfilEmpresa.descricao || '');
      setValue('endereco', perfilEmpresa.endereco || '');
      setValue('cidade', perfilEmpresa.cidade || '');
      setValue('estado', perfilEmpresa.estado || '');
      setValue('cep', perfilEmpresa.cep || '');
      setValue('site', perfilEmpresa.site || '');
      setValue('aprovado', empresa.aprovado || false);
    } catch (error) {
      console.error('Erro ao carregar empresa:', error);
      setError('Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  const validarCNPJ = (cnpj) => {
    // Remove caracteres não numéricos
    const numeros = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (numeros.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numeros)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(numeros[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(numeros[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }
    let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    
    return digito1 === parseInt(numeros[12]) && digito2 === parseInt(numeros[13]);
  };

  const formatarCNPJ = (value) => {
    const numeros = value.replace(/\D/g, '');
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      if (!isEditing && data.password !== data.confirm_password) {
        setError('As senhas não coincidem');
        setLoading(false);
        return;
      }

      // Validar CNPJ
      if (!validarCNPJ(data.cnpj)) {
        setError('CNPJ inválido');
        setLoading(false);
        return;
      }

      const empresaData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        telefone: data.telefone,
        tipo_usuario: 'empresa',
        aprovado: user?.tipo_usuario === 'admin' ? data.aprovado : false,
        perfil_empresa: {
          cnpj: data.cnpj.replace(/\D/g, ''), // Salvar apenas números
          nome_empresa: data.nome_empresa,
          descricao: data.descricao,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep.replace(/\D/g, ''),
          site: data.site
        }
      };

      if (!isEditing && data.password) {
        empresaData.password = data.password;
      }

      let response;
      if (isEditing) {
        response = await api.put(`/api/usuarios/${id}/empresa/`, empresaData);
      } else {
        response = await api.post('/api/usuarios/empresa/criar/', empresaData);
      }

      alert(isEditing ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!');
      navigate('/gerenciar-empresas');
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      if (error.response?.data?.email) {
        setError('Este email já está em uso');
      } else if (error.response?.data?.cnpj) {
        setError('Este CNPJ já está cadastrado');
      } else {
        setError('Erro ao salvar empresa. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Editar Empresa' : 'Criar Nova Empresa'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Dados básicos */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Dados do Responsável
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
                    label="Nome do Responsável"
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
                    label="Sobrenome do Responsável"
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
                rules={{ required: 'Telefone é obrigatório' }}
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

            {/* Dados da empresa */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Dados da Empresa
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cnpj"
                control={control}
                rules={{ 
                  required: 'CNPJ é obrigatório',
                  validate: value => validarCNPJ(value) || 'CNPJ inválido'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CNPJ"
                    fullWidth
                    error={!!errors.cnpj}
                    helperText={errors.cnpj?.message}
                    onChange={(e) => {
                      const formatted = formatarCNPJ(e.target.value);
                      field.onChange(formatted);
                    }}
                    inputProps={{ maxLength: 18 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="nome_empresa"
                control={control}
                rules={{ required: 'Nome da empresa é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome da Empresa"
                    fullWidth
                    error={!!errors.nome_empresa}
                    helperText={errors.nome_empresa?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição da Empresa"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.descricao}
                    helperText={errors.descricao?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="endereco"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Endereço"
                    fullWidth
                    error={!!errors.endereco}
                    helperText={errors.endereco?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="cidade"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cidade"
                    fullWidth
                    error={!!errors.cidade}
                    helperText={errors.cidade?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.estado}>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      {...field}
                      label="Estado"
                    >
                      {estados.map((estado) => (
                        <MenuItem key={estado} value={estado}>
                          {estado}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cep"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CEP"
                    fullWidth
                    error={!!errors.cep}
                    helperText={errors.cep?.message}
                    onChange={(e) => {
                      const formatted = e.target.value.replace(/\D/g, '').replace(/^(\d{5})(\d{3}).*/, '$1-$2');
                      field.onChange(formatted);
                    }}
                    inputProps={{ maxLength: 9 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="site"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Site"
                    fullWidth
                    error={!!errors.site}
                    helperText={errors.site?.message}
                  />
                )}
              />
            </Grid>

            {/* Senha - apenas para criação */}
            {!isEditing && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Senha de Acesso
                  </Typography>
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
              </>
            )}

            {/* Aprovação - apenas para admin */}
            {user?.tipo_usuario === 'admin' && (
              <Grid item xs={12}>
                <Controller
                  name="aprovado"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                        />
                      }
                      label="Aprovar empresa imediatamente"
                    />
                  )}
                />
              </Grid>
            )}

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/gerenciar-empresas')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Empresa')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CriarEmpresa;
