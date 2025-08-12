import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import api from '../../services/api';

const VagasTrabalhador = () => {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    carregarVagas();
  }, []);

  const carregarVagas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/vagas/?status=ativa');
      setVagas(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVagas = vagas.filter(vaga =>
    vaga.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaga.empresa_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaga.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vaga.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSalario = (salario) => {
    if (!salario) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(salario);
  };

  const formatSalarioRange = (vaga) => {
    if (vaga.salario_min && vaga.salario_max) {
      return `${formatSalario(vaga.salario_min)} - ${formatSalario(vaga.salario_max)}`;
    } else if (vaga.salario_min) {
      return `A partir de ${formatSalario(vaga.salario_min)}`;
    } else if (vaga.salario_max) {
      return `Até ${formatSalario(vaga.salario_max)}`;
    }
    return 'A combinar';
  };

  if (loading) {
    return (
      <Container>
        <Typography>Carregando vagas...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vagas Disponíveis
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Buscar vagas por título, empresa, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Box>

        {filteredVagas.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'Nenhuma vaga encontrada com os critérios de busca.' : 'Nenhuma vaga disponível no momento.'}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredVagas.map((vaga) => (
              <Grid item xs={12} md={6} lg={6} key={vaga.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    }
                  }}
                  onClick={() => navigate(`/vagas/${vaga.id}`)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1, pr: 1 }}>
                        {vaga.titulo}
                      </Typography>
                      <Chip
                        label="Ativa"
                        color="success"
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                      {vaga.empresa_nome}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {vaga.cidade}, {vaga.estado}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <WorkIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {vaga.tipo_contrato}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MoneyIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatSalarioRange(vaga)}
                      </Typography>
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {vaga.descricao}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {vaga.numero_vagas} {vaga.numero_vagas === 1 ? 'vaga' : 'vagas'}
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vagas/${vaga.id}`);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default VagasTrabalhador;
