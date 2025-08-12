import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  MenuItem,
  Pagination,
  Alert,
  InputAdornment,
  Fab,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const VagaCard = ({ vaga, onCandidatar, userType, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const formatSalario = (min, max) => {
    if (!min && !max) return 'A combinar';
    if (min && max) return `R$ ${min} - R$ ${max}`;
    if (min) return `A partir de R$ ${min}`;
    return `Até R$ ${max}`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {vaga.titulo}
        </Typography>
        
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {vaga.empresa_nome}
        </Typography>

        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip 
            icon={<WorkIcon />} 
            label={vaga.area} 
            size="small" 
            color="primary" 
          />
          <Chip 
            icon={<LocationIcon />} 
            label={vaga.local_trabalho} 
            size="small" 
          />
          <Chip 
            icon={<MoneyIcon />} 
            label={formatSalario(vaga.salario_min, vaga.salario_max)} 
            size="small" 
            color="success"
          />
        </Box>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          <strong>Tipo:</strong> {vaga.get_tipo_contrato_display || vaga.tipo_contrato}
        </Typography>

        <Typography variant="body2" color="textSecondary" gutterBottom>
          <strong>Nível:</strong> {vaga.get_nivel_experiencia_display || vaga.nivel_experiencia}
        </Typography>

        <Typography variant="body2" paragraph>
          {vaga.descricao.length > 150 
            ? `${vaga.descricao.substring(0, 150)}...` 
            : vaga.descricao
          }
        </Typography>

        {userType === 'empresa' && (
          <Typography variant="body2" color="primary">
            <strong>Candidaturas:</strong> {vaga.total_candidaturas || 0}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate(`/vagas/${vaga.id}`)}
        >
          Ver Detalhes
        </Button>
        
        {userType === 'trabalhador' && (
          <Button 
            size="small" 
            variant="contained"
            onClick={() => onCandidatar(vaga.id)}
          >
            Candidatar-se
          </Button>
        )}
        
        {userType === 'empresa' && (
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => navigate(`/vagas/${vaga.id}/editar`)}
          >
            Editar
          </Button>
        )}
        
        {userType === 'admin' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Ver candidatos">
              <IconButton size="small" onClick={() => navigate(`/vagas/${vaga.id}/candidatos`)}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar vaga">
              <IconButton size="small" onClick={() => navigate(`/vagas/${vaga.id}/editar`)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir vaga">
              <IconButton size="small" onClick={() => onDelete && onDelete(vaga.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

const VagasList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    search: '',
    area: '',
    tipo_contrato: '',
    nivel_experiencia: '',
  });

  useEffect(() => {
    loadVagas();
  }, [page, filtros]);

  const loadVagas = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, value]) => value !== '')
        ),
      };

      const response = await api.get('/api/vagas/', { params });
      setVagas(response.data.results || response.data);
      
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 20));
      }
    } catch (error) {
      setError('Erro ao carregar vagas');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaga = async (vagaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        await api.delete(`/api/vagas/${vagaId}/`);
        loadVagas(); // Recarregar a lista
      } catch (error) {
        setError('Erro ao excluir vaga');
        console.error('Erro:', error);
      }
    }
  };

  const handleCandidatar = async (vagaId) => {
    try {
      await api.post(`/api/vagas/${vagaId}/candidatar/`);
      alert('Candidatura realizada com sucesso!');
      loadVagas(); // Recarregar para atualizar contador
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao se candidatar';
      alert(message);
    }
  };

  const handleFiltroChange = (field) => (event) => {
    setFiltros(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPage(1); // Reset para primeira página
  };

  const tiposContrato = [
    { value: 'clt', label: 'CLT' },
    { value: 'pj', label: 'Pessoa Jurídica' },
    { value: 'temporario', label: 'Temporário' },
    { value: 'estagio', label: 'Estágio' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'terceirizado', label: 'Terceirizado' },
  ];

  const niveisExperiencia = [
    { value: 'estagiario', label: 'Estagiário' },
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
    { value: 'especialista', label: 'Especialista' },
  ];

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {user?.tipo_usuario === 'empresa' ? 'Minhas Vagas' : 'Vagas Disponíveis'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Buscar vagas"
                value={filtros.search}
                onChange={handleFiltroChange('search')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Área"
                value={filtros.area}
                onChange={handleFiltroChange('area')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Tipo de Contrato"
                value={filtros.tipo_contrato}
                onChange={handleFiltroChange('tipo_contrato')}
              >
                <MenuItem value="">Todos</MenuItem>
                {tiposContrato.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Nível de Experiência"
                value={filtros.nivel_experiencia}
                onChange={handleFiltroChange('nivel_experiencia')}
              >
                <MenuItem value="">Todos</MenuItem>
                {niveisExperiencia.map((nivel) => (
                  <MenuItem key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de Vagas */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>Carregando vagas...</Typography>
        </Box>
      ) : vagas.length === 0 ? (
        <Alert severity="info">
          Nenhuma vaga encontrada com os filtros selecionados.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {vagas.map((vaga) => (
              <Grid item xs={12} md={6} lg={4} key={vaga.id}>
                <VagaCard 
                  vaga={vaga} 
                  onCandidatar={handleCandidatar}
                  userType={user?.tipo_usuario}
                  onDelete={handleDeleteVaga}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
      
      {(user?.tipo_usuario === 'admin' || user?.tipo_usuario === 'empresa') && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => navigate('/vagas/criar')}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default VagasList;
