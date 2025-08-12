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
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../../services/api';

const GerenciarCandidatos = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCandidato, setSelectedCandidato] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    carregarCandidatos();
  }, []);

  const carregarCandidatos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/usuarios/?tipo_usuario=trabalhador');
      setCandidatos(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidatos = candidatos.filter(candidato =>
    candidato.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidato.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidato.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCandidato = async () => {
    if (!selectedCandidato) return;
    
    try {
      await api.delete(`/api/usuarios/${selectedCandidato.id}/`);
      await carregarCandidatos();
      setDeleteDialogOpen(false);
      setSelectedCandidato(null);
    } catch (error) {
      console.error('Erro ao excluir candidato:', error);
      alert('Erro ao excluir candidato. Tente novamente.');
    }
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
        <Typography>Carregando candidatos...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gerenciar Candidatos
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar candidatos..."
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
            onClick={() => navigate('/candidatos/criar')}
          >
            Adicionar Candidato
          </Button>
        </Box>

        {filteredCandidatos.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'Nenhum candidato encontrado com os critérios de busca.' : 'Nenhum candidato cadastrado.'}
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data Cadastro</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCandidatos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((candidato) => (
                    <TableRow key={candidato.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {candidato.first_name} {candidato.last_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{candidato.email}</TableCell>
                      <TableCell>{candidato.telefone || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={candidato.is_active ? 'Ativo' : 'Inativo'}
                          color={candidato.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(candidato.date_joined).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/candidatos/${candidato.id}`)}
                          title="Visualizar"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/candidatos/${candidato.id}/editar`)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedCandidato(candidato);
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
              count={filteredCandidatos.length}
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
            Tem certeza que deseja excluir o candidato "{selectedCandidato?.first_name} {selectedCandidato?.last_name}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteCandidato} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GerenciarCandidatos;
