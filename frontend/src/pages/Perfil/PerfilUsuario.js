import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Person, Edit, Save, Cancel } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import api from '../../services/api';

const PerfilUsuario = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userRole = localStorage.getItem('userRole');

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const userResponse = await api.get('/api/auth/user/');
      setUser(userResponse.data);

      // Carregar perfil específico baseado no tipo de usuário
      if (userRole === 'empresa') {
        const profileResponse = await api.get('/api/usuarios/perfil-empresa/');
        setProfile(profileResponse.data);
      } else if (userRole === 'trabalhador') {
        const profileResponse = await api.get('/api/usuarios/perfil-trabalhador/');
        setProfile(profileResponse.data);
      }

      // Reset form with current data
      reset({
        first_name: userResponse.data.first_name,
        last_name: userResponse.data.last_name,
        email: userResponse.data.email,
        ...profile
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Atualizar dados do usuário
      await api.patch('/auth/user/', {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email
      });

      // Atualizar perfil específico
      if (userRole === 'empresa') {
        await api.patch('/usuarios/perfil-empresa/', {
          nome_empresa: data.nome_empresa,
          cnpj: data.cnpj,
          descricao_empresa: data.descricao_empresa,
          endereco_empresa: data.endereco_empresa,
          telefone_empresa: data.telefone_empresa,
          site_empresa: data.site_empresa,
          setor_atuacao: data.setor_atuacao,
          numero_funcionarios: data.numero_funcionarios
        });
      } else if (userRole === 'trabalhador') {
        await api.patch('/usuarios/perfil-trabalhador/', {
          telefone: data.telefone,
          endereco: data.endereco,
          data_nascimento: data.data_nascimento,
          genero: data.genero,
          estado_civil: data.estado_civil,
          disponibilidade_viagem: data.disponibilidade_viagem,
          disponibilidade_mudanca: data.disponibilidade_mudanca,
          linkedin: data.linkedin,
          github: data.github
        });
      }

      await carregarPerfil();
      setEditMode(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    reset({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      ...profile
    });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Carregando perfil...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                {userRole === 'admin' ? 'Administrador' :
                 userRole === 'empresa' ? profile?.nome_empresa :
                 'Trabalhador'}
              </Typography>
            </Box>
          </Box>

          {!editMode ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Editar Perfil
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit(onSubmit)}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={cancelEdit}
              >
                Cancelar
              </Button>
            </Box>
          )}
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Dados Básicos */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Dados Básicos
                  </Typography>

                  <Grid container spacing={2}>
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
                            disabled={!editMode}
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
                            disabled={!editMode}
                            error={!!errors.last_name}
                            helperText={errors.last_name?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                            disabled={!editMode}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Dados específicos por tipo de usuário */}
            {userRole === 'empresa' && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dados da Empresa
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Controller
                          name="nome_empresa"
                          control={control}
                          rules={{ required: 'Nome da empresa é obrigatório' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Nome da Empresa"
                              fullWidth
                              disabled={!editMode}
                              error={!!errors.nome_empresa}
                              helperText={errors.nome_empresa?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Controller
                          name="cnpj"
                          control={control}
                          rules={{ required: 'CNPJ é obrigatório' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="CNPJ"
                              fullWidth
                              disabled={!editMode}
                              error={!!errors.cnpj}
                              helperText={errors.cnpj?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="descricao_empresa"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Descrição da Empresa"
                              multiline
                              rows={3}
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="setor_atuacao"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Setor de Atuação"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="numero_funcionarios"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Número de Funcionários"
                              type="number"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="telefone_empresa"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Telefone"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="site_empresa"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Site"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="endereco_empresa"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Endereço"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {userRole === 'trabalhador' && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dados Pessoais
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="telefone"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Telefone"
                              fullWidth
                              disabled={!editMode}
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
                              disabled={!editMode}
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="genero"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth disabled={!editMode}>
                              <InputLabel>Gênero</InputLabel>
                              <Select {...field} label="Gênero">
                                <MenuItem value="M">Masculino</MenuItem>
                                <MenuItem value="F">Feminino</MenuItem>
                                <MenuItem value="O">Outro</MenuItem>
                                <MenuItem value="">Prefiro não informar</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="estado_civil"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth disabled={!editMode}>
                              <InputLabel>Estado Civil</InputLabel>
                              <Select {...field} label="Estado Civil">
                                <MenuItem value="Solteiro">Solteiro(a)</MenuItem>
                                <MenuItem value="Casado">Casado(a)</MenuItem>
                                <MenuItem value="Divorciado">Divorciado(a)</MenuItem>
                                <MenuItem value="Viúvo">Viúvo(a)</MenuItem>
                                <MenuItem value="União Estável">União Estável</MenuItem>
                              </Select>
                            </FormControl>
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
                              label="Endereço"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="linkedin"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="LinkedIn"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="github"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="GitHub"
                              fullWidth
                              disabled={!editMode}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="disponibilidade_viagem"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Switch
                                  {...field}
                                  checked={field.value || false}
                                  disabled={!editMode}
                                />
                              }
                              label="Disponibilidade para viagem"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="disponibilidade_mudanca"
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Switch
                                  {...field}
                                  checked={field.value || false}
                                  disabled={!editMode}
                                />
                              }
                              label="Disponibilidade para mudança"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Status da conta */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status da Conta
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Data de Cadastro
                      </Typography>
                      <Typography variant="body1">
                        {new Date(user?.date_joined).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="textSecondary">
                        Status da Conta
                      </Typography>
                      <Typography variant="body1" color={user?.is_active ? 'success.main' : 'error.main'}>
                        {user?.is_active ? 'Ativa' : 'Inativa'}
                      </Typography>
                    </Grid>
                    {userRole === 'empresa' && profile?.aprovado !== undefined && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" color="textSecondary">
                          Status de Aprovação
                        </Typography>
                        <Typography variant="body1" color={
                          profile.aprovado === true ? 'success.main' :
                          profile.aprovado === false ? 'error.main' : 'warning.main'
                        }>
                          {profile.aprovado === true ? 'Aprovada' :
                           profile.aprovado === false ? 'Rejeitada' : 'Pendente'}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PerfilUsuario;
