import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon
} from '@mui/icons-material';
import api from '../../services/api';

const GerenciarEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/usuarios/?tipo_usuario=empresa');
      setEmpresas(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteEmpresa = async () => {
    if (!selectedEmpresa) return;
    
    try {
      await api.delete(`/api/usuarios/${selectedEmpresa.id}/`);
      await carregarEmpresas();
      setDeleteDialogOpen(false);
      setSelectedEmpresa(null);
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      alert('Erro ao excluir empresa. Tente novamente.');
    }
  };

  const handleApproveEmpresa = async (aprovado) => {
    if (!selectedEmpresa) return;
    
    try {
      await api.patch(`/api/usuarios/${selectedEmpresa.id}/aprovar/`, {
        acao: aprovado ? 'aprovar' : 'desaprovar'
      });
      await carregarEmpresas();
      setApproveDialogOpen(false);
      setSelectedEmpresa(null);
    } catch (error) {
      console.error('Erro ao alterar aprovação da empresa:', error);
      alert('Erro ao alterar aprovação da empresa. Tente novamente.');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (empresa) => {
    if (!empresa.is_active) {
      return <Chip label="Inativo" color="default" size="small" />;
    }
    if (empresa.aprovado === false) {
      return <Chip label="Rejeitado" color="error" size="small" />;
    }
    if (empresa.aprovado === true) {
      return <Chip label="Aprovado" color="success" size="small" />;
    }
    return <Chip label="Pendente" color="warning" size="small" />;
  };

  if (loading) {
    return (
      <Container>
        <Typography>Carregando empresas...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gerenciar Empresas
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar empresas..."
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
            onClick={() => navigate('/empresas/criar')}
          >
            Adicionar Empresa
          </Button>
        </Box>

        {filteredEmpresas.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'Nenhuma empresa encontrada com os critérios de busca.' : 'Nenhuma empresa cadastrada.'}
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome/Razão Social</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data Cadastro</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmpresas
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((empresa) => (
                    <TableRow key={empresa.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {empresa.first_name} {empresa.last_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{empresa.email}</TableCell>
                      <TableCell>{empresa.telefone || '-'}</TableCell>
                      <TableCell>
                        {getStatusChip(empresa)}
                      </TableCell>
                      <TableCell>
                        {new Date(empresa.date_joined).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/empresas/${empresa.id}`)}
                          title="Visualizar"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/empresas/${empresa.id}/editar`)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        {empresa.aprovado !== true && (
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedEmpresa(empresa);
                              setApproveDialogOpen(true);
                            }}
                            title="Aprovar"
                            color="success"
                          >
                            <ApproveIcon />
                          </IconButton>
                        )}
                        {empresa.aprovado !== false && (
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedEmpresa(empresa);
                              setApproveDialogOpen(true);
                            }}
                            title="Rejeitar"
                            color="warning"
                          >
                            <RejectIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedEmpresa(empresa);
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
              count={filteredEmpresas.length}
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
            Tem certeza que deseja excluir a empresa "{selectedEmpresa?.first_name} {selectedEmpresa?.last_name}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteEmpresa} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de aprovação/rejeição */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
      >
        <DialogTitle>
          Alterar Status da Empresa
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Empresa: "{selectedEmpresa?.first_name} {selectedEmpresa?.last_name}"
          </Typography>
          <Typography>
            Escolha uma ação:
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => handleApproveEmpresa(false)} 
            color="warning" 
            variant="outlined"
          >
            Rejeitar
          </Button>
          <Button 
            onClick={() => handleApproveEmpresa(true)} 
            color="success" 
            variant="contained"
          >
            Aprovar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GerenciarEmpresas;
