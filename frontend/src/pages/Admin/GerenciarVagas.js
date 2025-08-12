import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const GerenciarVagas = () => {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarVagas();
  }, []);

  const carregarVagas = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Se for empresa, só mostra suas próprias vagas
      if (user?.tipo_usuario === 'empresa') {
        params.empresa = user.id;
      }
      
      const response = await api.get('/api/vagas/', { params });
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
    vaga.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteVaga = async () => {
    if (!selectedVaga) return;
    
    try {
      await api.delete(`/api/vagas/${selectedVaga.id}/`);
      await carregarVagas();
      setDeleteDialogOpen(false);
      setSelectedVaga(null);
    } catch (error) {
      console.error('Erro ao excluir vaga:', error);
      alert('Erro ao excluir vaga. Tente novamente.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa': return 'success';
      case 'pausada': return 'warning';
      case 'encerrada': return 'error';
      case 'pendente': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ativa': return 'Ativa';
      case 'pausada': return 'Pausada';
      case 'encerrada': return 'Encerrada';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          {user?.tipo_usuario === 'admin' ? 'Gerenciar Vagas' : 'Minhas Vagas'}
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar vagas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vagas/criar')}
          >
            Adicionar Vaga
          </Button>
        </Box>

        {filteredVagas.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'Nenhuma vaga encontrada com os critérios de busca.' : 'Nenhuma vaga cadastrada.'}
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  {user?.tipo_usuario === 'admin' && <TableCell>Empresa</TableCell>}
                  <TableCell>Local</TableCell>
                  <TableCell>Salário</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Candidaturas</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVagas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((vaga) => (
                    <TableRow key={vaga.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {vaga.titulo}
                        </Typography>
                      </TableCell>
                      {user?.tipo_usuario === 'admin' && (
                        <TableCell>{vaga.empresa_nome}</TableCell>
                      )}
                      <TableCell>{vaga.cidade}, {vaga.estado}</TableCell>
                      <TableCell>{formatSalarioRange(vaga)}</TableCell>
                      <TableCell>{vaga.tipo_contrato}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(vaga.status)}
                          color={getStatusColor(vaga.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<PeopleIcon />}
                          label={vaga.candidaturas_count || 0}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/vagas/${vaga.id}`)}
                          title="Visualizar"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/vagas/${vaga.id}/candidatos`)}
                          title="Ver Candidatos"
                        >
                          <PeopleIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/vagas/${vaga.id}/editar`)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedVaga(vaga);
                            setDeleteDialogOpen(true);
                          }}
                          title="Excluir"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredVagas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </TableContainer>
        )}
      </Box>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a vaga "{selectedVaga?.titulo}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteVaga} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GerenciarVagas;
