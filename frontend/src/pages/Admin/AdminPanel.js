import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  Business,
  Person,
  Work,
  Assignment
} from '@mui/icons-material';
import api from '../../services/api';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [estatisticas, setEstatisticas] = useState({});
  const [empresasPendentes, setEmpresasPendentes] = useState([]);
  const [vagasPendentes, setVagasPendentes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [stats, empresas, vagas, users] = await Promise.all([
        api.get('/api/admin/estatisticas/'),
        api.get('/api/admin/empresas/pendentes/'),
        api.get('/api/admin/vagas/pendentes/'),
        api.get('/api/admin/usuarios/')
      ]);

      setEstatisticas(stats.data);
      setEmpresasPendentes(empresas.data);
      setVagasPendentes(vagas.data);
      setUsuarios(users.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const aprovarEmpresa = async (empresaId, aprovado) => {
    try {
      await api.post(`/api/admin/empresas/${empresaId}/aprovar/`, {
        aprovado,
        observacoes
      });
      await carregarDados();
      setDialogOpen(false);
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error);
    }
  };

  const aprovarVaga = async (vagaId, aprovado) => {
    try {
      await api.post(`/api/admin/vagas/${vagaId}/aprovar/`, {
        aprovado,
        observacoes
      });
      await carregarDados();
      setDialogOpen(false);
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao aprovar vaga:', error);
    }
  };

  const ativarDesativarUsuario = async (userId, ativo) => {
    try {
      await api.post(`/api/admin/usuarios/${userId}/ativar/`, { ativo });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
    }
  };

  const openDialog = (item, type) => {
    setSelectedItem({ ...item, type });
    setDialogOpen(true);
  };

  const handleApproval = (aprovado) => {
    if (selectedItem.type === 'empresa') {
      aprovarEmpresa(selectedItem.id, aprovado);
    } else if (selectedItem.type === 'vaga') {
      aprovarVaga(selectedItem.id, aprovado);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Container sx={{ mt: 4 }}><Typography>Carregando...</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Painel Administrativo
      </Typography>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuários Ativos"
            value={estatisticas.usuarios_ativos || 0}
            icon={<Person sx={{ fontSize: 40 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Empresas Ativas"
            value={estatisticas.empresas_ativas || 0}
            icon={<Business sx={{ fontSize: 40 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vagas Ativas"
            value={estatisticas.vagas_ativas || 0}
            icon={<Work sx={{ fontSize: 40 }} />}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Candidaturas"
            value={estatisticas.total_candidaturas || 0}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Empresas Pendentes" />
          <Tab label="Vagas Pendentes" />
          <Tab label="Gerenciar Usuários" />
        </Tabs>

        {/* Tab Empresas Pendentes */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Empresas Aguardando Aprovação
            </Typography>
            
            {empresasPendentes.length === 0 ? (
              <Alert severity="info">Nenhuma empresa pendente de aprovação</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Empresa</TableCell>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Responsável</TableCell>
                      <TableCell>Data Cadastro</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {empresasPendentes.map((empresa) => (
                      <TableRow key={empresa.id}>
                        <TableCell>{empresa.nome_empresa}</TableCell>
                        <TableCell>{empresa.cnpj}</TableCell>
                        <TableCell>
                          {empresa.user.first_name} {empresa.user.last_name}
                          <br />
                          <Typography variant="caption" color="textSecondary">
                            {empresa.user.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(empresa.user.date_joined).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => openDialog(empresa, 'empresa')}
                            sx={{ mr: 1 }}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => openDialog(empresa, 'empresa')}
                          >
                            Rejeitar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab Vagas Pendentes */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vagas Aguardando Aprovação
            </Typography>
            
            {vagasPendentes.length === 0 ? (
              <Alert severity="info">Nenhuma vaga pendente de aprovação</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Empresa</TableCell>
                      <TableCell>Localização</TableCell>
                      <TableCell>Salário</TableCell>
                      <TableCell>Data Criação</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vagasPendentes.map((vaga) => (
                      <TableRow key={vaga.id}>
                        <TableCell>{vaga.titulo}</TableCell>
                        <TableCell>{vaga.empresa.nome_empresa}</TableCell>
                        <TableCell>{vaga.localizacao}</TableCell>
                        <TableCell>
                          R$ {vaga.salario_min} - R$ {vaga.salario_max}
                        </TableCell>
                        <TableCell>
                          {new Date(vaga.data_criacao).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => openDialog(vaga, 'vaga')}
                            sx={{ mr: 1 }}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => openDialog(vaga, 'vaga')}
                          >
                            Rejeitar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab Gerenciar Usuários */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gerenciar Usuários
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data Cadastro</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        {usuario.first_name} {usuario.last_name}
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.tipo_usuario}
                          color={
                            usuario.tipo_usuario === 'admin' ? 'error' :
                            usuario.tipo_usuario === 'empresa' ? 'primary' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.is_active ? 'Ativo' : 'Inativo'}
                          color={usuario.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(usuario.date_joined).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {usuario.tipo_usuario !== 'admin' && (
                          <Button
                            size="small"
                            color={usuario.is_active ? 'error' : 'success'}
                            onClick={() => ativarDesativarUsuario(usuario.id, !usuario.is_active)}
                          >
                            {usuario.is_active ? 'Desativar' : 'Ativar'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Dialog de Aprovação */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem?.type === 'empresa' ? 'Aprovar/Rejeitar Empresa' : 'Aprovar/Rejeitar Vaga'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {selectedItem?.type === 'empresa' 
              ? `Empresa: ${selectedItem?.nome_empresa}`
              : `Vaga: ${selectedItem?.titulo}`
            }
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Observações"
            fullWidth
            multiline
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Adicione observações sobre a aprovação/rejeição (opcional)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => handleApproval(false)} color="error">
            Rejeitar
          </Button>
          <Button onClick={() => handleApproval(true)} color="success">
            Aprovar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
