import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>
        <Box color={`${color}.main`}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await api.get('/api/dashboard/');
      setStats(response.data);
    } catch (error) {
      setError('Erro ao carregar estatísticas');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    if (user?.tipo_usuario === 'admin') {
      return 'Painel Administrativo';
    } else if (user?.tipo_usuario === 'empresa') {
      return 'Painel da Empresa';
    } else {
      return 'Meu Painel';
    }
  };

  const renderAdminStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total de Usuários"
          value={stats.total_usuarios || 0}
          icon={<PeopleIcon fontSize="large" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Usuários Pendentes"
          value={stats.usuarios_pendentes || 0}
          icon={<PeopleIcon fontSize="large" />}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total de Vagas"
          value={stats.total_vagas || 0}
          icon={<WorkIcon fontSize="large" />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Candidaturas"
          value={stats.total_candidaturas || 0}
          icon={<AssignmentIcon fontSize="large" />}
          color="info"
        />
      </Grid>
    </Grid>
  );

  const renderEmpresaStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Minhas Vagas"
          value={stats.minhas_vagas || 0}
          icon={<WorkIcon fontSize="large" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Vagas Ativas"
          value={stats.vagas_ativas || 0}
          icon={<TrendingUpIcon fontSize="large" />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Candidaturas"
          value={stats.total_candidaturas || 0}
          icon={<AssignmentIcon fontSize="large" />}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pendentes"
          value={stats.candidaturas_pendentes || 0}
          icon={<AssignmentIcon fontSize="large" />}
          color="warning"
        />
      </Grid>
    </Grid>
  );

  const renderTrabalhadorStats = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Candidaturas"
          value={stats.minhas_candidaturas || 0}
          icon={<AssignmentIcon fontSize="large" />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Em Andamento"
          value={stats.candidaturas_em_andamento || 0}
          icon={<TrendingUpIcon fontSize="large" />}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Aprovadas"
          value={stats.candidaturas_aprovadas || 0}
          icon={<AssignmentIcon fontSize="large" />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Vagas Disponíveis"
          value={stats.vagas_disponiveis || 0}
          icon={<WorkIcon fontSize="large" />}
          color="warning"
        />
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getWelcomeMessage()}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Bem-vindo, {user?.first_name}! Aqui está um resumo das suas atividades.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {user?.tipo_usuario === 'admin' && renderAdminStats()}
      {user?.tipo_usuario === 'empresa' && renderEmpresaStats()}
      {user?.tipo_usuario === 'trabalhador' && renderTrabalhadorStats()}

      {user?.tipo_usuario === 'trabalhador' && !stats.tem_curriculo && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Você ainda não cadastrou seu currículo. 
          <strong> Complete seu perfil para receber recomendações de vagas!</strong>
        </Alert>
      )}

      {!user?.aprovado && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Sua conta está aguardando aprovação do administrador.
        </Alert>
      )}
    </Container>
  );
};

export default Dashboard;
