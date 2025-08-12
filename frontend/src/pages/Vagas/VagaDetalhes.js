import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Box,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Work,
  LocationOn,
  AttachMoney,
  CalendarToday,
  School,
  Person,
  CheckCircle
} from '@mui/icons-material';
import api from '../../services/api';

const VagaDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vaga, setVaga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [candidatando, setCandidatando] = useState(false);
  const [jaCandidatou, setJaCandidatou] = useState(false);

  useEffect(() => {
    carregarVaga();
    verificarCandidatura();
  }, [id]);

  const carregarVaga = async () => {
    try {
      const response = await api.get(`/vagas/${id}/`);
      setVaga(response.data);
    } catch (error) {
      console.error('Erro ao carregar vaga:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarCandidatura = async () => {
    try {
      const response = await api.get(`/vagas/${id}/candidaturas/verificar/`);
      setJaCandidatou(response.data.ja_candidatou);
    } catch (error) {
      console.error('Erro ao verificar candidatura:', error);
    }
  };

  const candidatarSe = async () => {
    setCandidatando(true);
    try {
      await api.post(`/vagas/${id}/candidatar/`);
      setJaCandidatou(true);
      alert('Candidatura realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao se candidatar:', error);
      alert('Erro ao se candidatar. Verifique se você possui um currículo cadastrado.');
    } finally {
      setCandidatando(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!vaga) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Vaga não encontrada</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Cabeçalho da vaga */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {vaga.titulo}
                </Typography>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {vaga.empresa?.nome_empresa}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  <Chip icon={<LocationOn />} label={vaga.localizacao} />
                  <Chip icon={<Work />} label={vaga.tipo_contrato} />
                  <Chip 
                    icon={<AttachMoney />} 
                    label={`R$ ${vaga.salario_min} - R$ ${vaga.salario_max}`} 
                  />
                  <Chip 
                    icon={<CalendarToday />} 
                    label={`Até ${new Date(vaga.data_limite).toLocaleDateString()}`} 
                  />
                </Box>
              </Box>
              
              {localStorage.getItem('userRole') === 'trabalhador' && (
                <Box>
                  {jaCandidatou ? (
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      disabled
                      sx={{ ml: 2 }}
                    >
                      Já Candidatado
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={candidatarSe}
                      disabled={candidatando}
                      sx={{ ml: 2 }}
                    >
                      {candidatando ? 'Candidatando...' : 'Candidatar-se'}
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Descrição */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Descrição da Vaga
                </Typography>
                <Typography variant="body1" paragraph>
                  {vaga.descricao}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Responsabilidades
                </Typography>
                <Typography variant="body1" paragraph>
                  {vaga.responsabilidades}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Benefícios
                </Typography>
                <Typography variant="body1">
                  {vaga.beneficios}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Requisitos */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Requisitos
                </Typography>
                
                {vaga.requisitos?.map((requisito, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {requisito.tipo_requisito}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {requisito.descricao}
                    </Typography>
                    {requisito.obrigatorio && (
                      <Chip label="Obrigatório" color="error" size="small" sx={{ mt: 0.5 }} />
                    )}
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Informações Adicionais
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <School sx={{ mr: 1, color: 'grey.600' }} />
                  <Typography variant="body2">
                    Escolaridade: {vaga.escolaridade_minima}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ mr: 1, color: 'grey.600' }} />
                  <Typography variant="body2">
                    Experiência: {vaga.experiencia_minima} anos
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Work sx={{ mr: 1, color: 'grey.600' }} />
                  <Typography variant="body2">
                    Vagas disponíveis: {vaga.numero_vagas}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Informações da empresa */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sobre a Empresa
                </Typography>
                <Typography variant="body1">
                  {vaga.empresa?.descricao_empresa || 'Informações sobre a empresa não disponíveis.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={() => navigate('/vagas')}>
            Voltar às Vagas
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VagaDetalhes;
