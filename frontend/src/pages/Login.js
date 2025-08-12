import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tab,
  Tabs,
  Grid,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    tipo: 'trabalhador',
    // Dados básicos
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    telefone: '',
    // Dados específicos do trabalhador
    cpf: '',
    data_nascimento: '',
    endereco: '',
    tem_habilitacao: false,
    categoria_habilitacao: '',
    // Dados específicos da empresa
    nome_empresa: '',
    cnpj: '',
    site: '',
    descricao: '',
    setor: '',
    tamanho_empresa: 'pequena',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(registerData, registerData.tipo);
    
    if (result.success) {
      setTab(0); // Voltar para aba de login
      alert('Cadastro realizado! Aguarde aprovação do administrador.');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sistema Emprego Rápido
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Conectando trabalhadores e empresas
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
          <Tab label="Entrar" />
          <Tab label="Cadastrar" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tab de Login */}
        {tab === 0 && (
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange(setFormData)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange(setFormData)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
        )}

        {/* Tab de Cadastro */}
        {tab === 1 && (
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              select
              label="Tipo de Usuário"
              name="tipo"
              value={registerData.tipo}
              onChange={handleChange(setRegisterData)}
              margin="normal"
              required
            >
              <MenuItem value="trabalhador">Trabalhador</MenuItem>
              <MenuItem value="empresa">Empresa</MenuItem>
            </TextField>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome de usuário"
                  name="username"
                  value={registerData.username}
                  onChange={handleChange(setRegisterData)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleChange(setRegisterData)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primeiro Nome"
                  name="first_name"
                  value={registerData.first_name}
                  onChange={handleChange(setRegisterData)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sobrenome"
                  name="last_name"
                  value={registerData.last_name}
                  onChange={handleChange(setRegisterData)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone"
                  value={registerData.telefone}
                  onChange={handleChange(setRegisterData)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Senha"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleChange(setRegisterData)}
                  required
                />
              </Grid>
            </Grid>

            {/* Campos específicos do trabalhador */}
            {registerData.tipo === 'trabalhador' && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CPF"
                    name="cpf"
                    value={registerData.cpf}
                    onChange={handleChange(setRegisterData)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Data de Nascimento"
                    name="data_nascimento"
                    type="date"
                    value={registerData.data_nascimento}
                    onChange={handleChange(setRegisterData)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    name="endereco"
                    value={registerData.endereco}
                    onChange={handleChange(setRegisterData)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={registerData.tem_habilitacao}
                        onChange={handleChange(setRegisterData)}
                        name="tem_habilitacao"
                      />
                    }
                    label="Possui habilitação"
                  />
                </Grid>
                {registerData.tem_habilitacao && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Categoria da Habilitação"
                      name="categoria_habilitacao"
                      value={registerData.categoria_habilitacao}
                      onChange={handleChange(setRegisterData)}
                    >
                      <MenuItem value="A">Categoria A</MenuItem>
                      <MenuItem value="B">Categoria B</MenuItem>
                      <MenuItem value="C">Categoria C</MenuItem>
                      <MenuItem value="D">Categoria D</MenuItem>
                      <MenuItem value="E">Categoria E</MenuItem>
                    </TextField>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Campos específicos da empresa */}
            {registerData.tipo === 'empresa' && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome da Empresa"
                    name="nome_empresa"
                    value={registerData.nome_empresa}
                    onChange={handleChange(setRegisterData)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CNPJ"
                    name="cnpj"
                    value={registerData.cnpj}
                    onChange={handleChange(setRegisterData)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    name="endereco"
                    value={registerData.endereco}
                    onChange={handleChange(setRegisterData)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Site (opcional)"
                    name="site"
                    value={registerData.site}
                    onChange={handleChange(setRegisterData)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Setor"
                    name="setor"
                    value={registerData.setor}
                    onChange={handleChange(setRegisterData)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Tamanho da Empresa"
                    name="tamanho_empresa"
                    value={registerData.tamanho_empresa}
                    onChange={handleChange(setRegisterData)}
                    required
                  >
                    <MenuItem value="micro">Microempresa</MenuItem>
                    <MenuItem value="pequena">Pequena</MenuItem>
                    <MenuItem value="media">Média</MenuItem>
                    <MenuItem value="grande">Grande</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Descrição da Empresa"
                    name="descricao"
                    value={registerData.descricao}
                    onChange={handleChange(setRegisterData)}
                    required
                  />
                </Grid>
              </Grid>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Login;
