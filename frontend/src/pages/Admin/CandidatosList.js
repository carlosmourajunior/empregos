import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Fab,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CandidatosList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' ou 'list'

  useEffect(() => {
    loadCandidatos();
  }, []);

  const loadCandidatos = async () => {
    try {
      const response = await api.get('/api/curriculos/');
      setCandidatos(response.data.results || response.data);
    } catch (error) {
      setError('Erro ao carregar candidatos');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidatos = candidatos.filter(candidato =>
    candidato.trabalhador_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidato.objetivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidato.trabalhador?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  const renderCardView = () => (
    <Grid container spacing={3}>
      {filteredCandidatos.map((candidato) => (
        <Grid item xs={12} md={6} lg={4} key={candidato.id}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h3">
                    {candidato.trabalhador_nome || 'Nome não informado'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {candidato.trabalhador?.user?.email || 'Email não informado'}
                  </Typography>
                </Box>
              </Box>

              {candidato.objetivo && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Objetivo:</strong> {candidato.objetivo}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {candidato.experiencias_profissionais?.length > 0 && (
                  <Chip
                    icon={<WorkIcon />}
                    label={`${candidato.experiencias_profissionais.length} experiência(s)`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {candidato.escolaridades?.length > 0 && (
                  <Chip
                    icon={<SchoolIcon />}
                    label={`${candidato.escolaridades.length} formação(ões)`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {candidato.habilidades?.length > 0 && (
                  <Chip
                    label={`${candidato.habilidades.length} habilidade(s)`}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>

              {candidato.data_atualizacao && (
                <Typography variant="caption" color="textSecondary">
                  Atualizado em: {new Date(candidato.data_atualizacao).toLocaleDateString('pt-BR')}
                </Typography>
              )}
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button
                startIcon={<ViewIcon />}
                onClick={() => navigate(`/candidatos/${candidato.id}`)}
                variant="outlined"
                size="small"
              >
                Ver Perfil
              </Button>
              <Button
                startIcon={<EditIcon />}
                onClick={() => navigate(`/curriculo/editar?id=${candidato.id}`)}
                variant="contained"
                size="small"
              >
                Editar
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Paper>
      <List>
        {filteredCandidatos.map((candidato, index) => (
          <React.Fragment key={candidato.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={candidato.trabalhador_nome || 'Nome não informado'}
                secondary={
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {candidato.trabalhador?.user?.email || 'Email não informado'}
                    </Typography>
                    {candidato.objetivo && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {candidato.objetivo}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => navigate(`/candidatos/${candidato.id}`)}
                  sx={{ mr: 1 }}
                >
                  <ViewIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => navigate(`/curriculo/editar?id=${candidato.id}`)}
                >
                  <EditIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < filteredCandidatos.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Candidatos ({filteredCandidatos.length})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('cards')}
            size="small"
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('list')}
            size="small"
          >
            Lista
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Pesquisar candidatos por nome, objetivo ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredCandidatos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            {searchTerm ? 'Nenhum candidato encontrado' : 'Nenhum candidato cadastrado'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/candidatos/criar')}
            sx={{ mt: 2 }}
          >
            Cadastrar Primeiro Candidato
          </Button>
        </Box>
      ) : (
        <>
          {viewMode === 'cards' ? renderCardView() : renderListView()}
        </>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate('/candidatos/criar')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default CandidatosList;
