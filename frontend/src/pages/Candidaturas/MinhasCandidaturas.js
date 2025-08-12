import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  TrendingUp as StatusIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const MinhasCandidaturas = () => {
  const { user } = useAuth();
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCandidaturas();
  }, []);

  const loadCandidaturas = async () => {
    try {
      const response = await api.get('/api/vagas/minhas-candidaturas/');
      setCandidaturas(response.data);
    } catch (error) {
      setError('Erro ao carregar candidaturas');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'candidatado': 'default',
      'em_analise': 'info',
      'pre_selecionado': 'warning',
      'entrevista': 'primary',
      'aprovado': 'success',
      'reprovado': 'error',
      'desistiu': 'secondary',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'candidatado': 'Candidatado',
      'em_analise': 'Em Análise',
      'pre_selecionado': 'Pré-selecionado',
      'entrevista': 'Entrevista',
      'aprovado': 'Aprovado',
      'reprovado': 'Reprovado',
      'desistiu': 'Desistiu',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <Container>
        <Typography>Carregando candidaturas...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Minhas Candidaturas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {candidaturas.length === 0 ? (
        <Alert severity="info">
          Você ainda não se candidatou a nenhuma vaga.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {candidaturas.map((candidatura) => (
            <Grid item xs={12} md={6} lg={4} key={candidatura.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {candidatura.vaga_titulo}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <StatusIcon fontSize="small" sx={{ mr: 1 }} />
                    <Chip 
                      label={getStatusLabel(candidatura.status)}
                      color={getStatusColor(candidatura.status)}
                      size="small"
                    />
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Candidatura: {new Date(candidatura.data_candidatura).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {candidatura.score_compatibilidade && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <StatusIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="primary">
                        Compatibilidade: {(candidatura.score_compatibilidade * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  )}

                  {candidatura.observacoes && (
                    <Paper sx={{ p: 1, mt: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">
                        <strong>Observações:</strong> {candidatura.observacoes}
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Estatísticas resumidas */}
      {candidaturas.length > 0 && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resumo das Candidaturas
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Total de Candidaturas"
                secondary={candidaturas.length}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Em Andamento"
                secondary={candidaturas.filter(c => 
                  !['aprovado', 'reprovado', 'desistiu'].includes(c.status)
                ).length}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Aprovadas"
                secondary={candidaturas.filter(c => c.status === 'aprovado').length}
              />
            </ListItem>
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default MinhasCandidaturas;
