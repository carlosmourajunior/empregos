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
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import api from '../../services/api';

const CriarUsuario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      telefone: '',
      password: '',
      confirm_password: ''
    }
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
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        telefone: data.telefone,
        tipo_usuario: 'trabalhador', // Sempre trabalhador/candidato
        password: data.password
      };

      await api.post('/api/usuarios/criar/', candidatoData);
      alert('Candidato criado com sucesso!');
      navigate('/gerenciar-candidatos');
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      if (error.response?.data?.email) {
        setError('Este email já está em uso');
      } else {
        setError('Erro ao criar candidato. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Criar Novo Candidato
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Dados pessoais */}
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
              {/* Campo oculto, sempre será trabalhador */}
              <input type="hidden" value="trabalhador" />
              <Typography variant="body2" color="text.secondary">
                Tipo de usuário: <strong>Candidato/Trabalhador</strong>
              </Typography>
            </Grid>

            {/* Senha */}
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

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/gerenciar-candidatos')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Candidato'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CriarUsuario;
