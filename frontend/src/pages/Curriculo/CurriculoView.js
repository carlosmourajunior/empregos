import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  School,
  Star,
  Language,
  Edit
} from '@mui/icons-material';
import api from '../../services/api';

const CurriculoView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curriculo, setCurriculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    carregarCurriculo();
  }, [id]);

  const carregarCurriculo = async () => {
    try {
      const response = await api.get(`/api/curriculos/${id || 'meu'}/`);
      setCurriculo(response.data);
      
      // Verificar se é o dono do currículo
      const userId = localStorage.getItem('userId');
      const curriculoUserId = response.data.trabalhador?.user?.id || response.data.trabalhador?.id;
      setIsOwner(!id || (curriculoUserId == userId));
    } catch (error) {
      console.error('Erro ao carregar currículo:', error);
      if (error.response?.status === 404 && !id) {
        // Se não tem currículo e é a rota "meu", mostrar opção de criar
        setCurriculo(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!curriculo) {
    if (!id) {
      // Página "Meu Currículo" sem currículo cadastrado
      return (
        <Container sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Meu Currículo
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Você ainda não possui um currículo cadastrado.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/curriculo/editar')}
              sx={{ mr: 2 }}
            >
              Criar Meu Currículo
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </Paper>
        </Container>
      );
    }
    
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Currículo não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Cabeçalho */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {curriculo.trabalhador?.user?.first_name || ''} {curriculo.trabalhador?.user?.last_name || ''}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {curriculo.objetivo || 'Objetivo não informado'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                {curriculo.trabalhador?.user?.email && (
                  <Chip icon={<Email />} label={curriculo.trabalhador.user.email} />
                )}
                {curriculo.telefone && (
                  <Chip icon={<Phone />} label={curriculo.telefone} />
                )}
                {curriculo.endereco && (
                  <Chip icon={<LocationOn />} label={curriculo.endereco} />
                )}
              </Box>
            </Box>
          </Box>
          
          {isOwner && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate('/curriculo/editar')}
            >
              Editar
            </Button>
          )}
        </Box>

        <Grid container spacing={4}>
          {/* Resumo Profissional */}
          {curriculo.resumo_profissional && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo Profissional
                  </Typography>
                  <Typography variant="body1">
                    {curriculo.resumo_profissional}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Experiências Profissionais */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Experiência Profissional
                </Typography>
                
                {curriculo.experiencias_profissionais?.length > 0 ? (
                  curriculo.experiencias_profissionais.map((exp, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {exp.cargo || 'Cargo não informado'}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {exp.empresa || 'Empresa não informada'} • {exp.data_inicio || ''} - {exp.data_fim || 'Atual'}
                      </Typography>
                      {exp.descricao && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {exp.descricao}
                        </Typography>
                      )}
                      {index < curriculo.experiencias_profissionais.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary">
                    Nenhuma experiência profissional cadastrada
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Educação */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Educação
                </Typography>
                
                {curriculo.escolaridades?.length > 0 ? (
                  curriculo.escolaridades.map((edu, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {edu.nivel || 'Nível não informado'} {edu.curso ? `em ${edu.curso}` : ''}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {edu.instituicao || 'Instituição não informada'} • {edu.ano_conclusao || 'Em andamento'}
                      </Typography>
                      {index < curriculo.escolaridades.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary">
                    Nenhuma escolaridade cadastrada
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Cursos */}
            {curriculo.cursos?.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cursos e Certificações
                  </Typography>
                  
                  {curriculo.cursos.map((curso, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {curso.nome || 'Curso não informado'}
                      </Typography>
                      <Typography variant="subtitle2" color="textSecondary">
                        {curso.instituicao || 'Instituição não informada'} • {curso.carga_horaria || '0'}h
                      </Typography>
                      {curso.data_conclusao && (
                        <Typography variant="body2" color="textSecondary">
                          Concluído em: {curso.data_conclusao}
                        </Typography>
                      )}
                      {index < curriculo.cursos.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Habilidades */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Habilidades
                </Typography>
                
                {curriculo.habilidades?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {curriculo.habilidades.map((habilidade, index) => (
                      <Chip
                        key={index}
                        label={`${habilidade.nome || 'Habilidade'} (${habilidade.nivel || 'N/A'})`}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography color="textSecondary">
                    Nenhuma habilidade cadastrada
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Idiomas */}
            {curriculo.idiomas?.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <Language sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Idiomas
                  </Typography>
                  
                  {curriculo.idiomas.map((idioma, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{idioma.idioma || 'Idioma'}</strong> - {idioma.nivel || 'Nível não informado'}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tipos de Vaga Procurada */}
            {curriculo.tipos_vaga_procurada?.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tipos de Vaga Procurada
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {curriculo.tipos_vaga_procurada.map((tipo, index) => (
                      <Chip
                        key={index}
                        label={tipo.tipo_vaga || 'Tipo não informado'}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Informações Adicionais */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Adicionais
                </Typography>
                
                {curriculo.data_nascimento && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Data de Nascimento:</strong> {new Date(curriculo.data_nascimento).toLocaleDateString('pt-BR')}
                  </Typography>
                )}
                
                {curriculo.estado_civil && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Estado Civil:</strong> {curriculo.estado_civil}
                  </Typography>
                )}
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Disponibilidade para Viagem:</strong> {curriculo.disponibilidade_viagem ? 'Sim' : 'Não'}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Disponibilidade para Mudança:</strong> {curriculo.disponibilidade_mudanca ? 'Sim' : 'Não'}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  <strong>Última atualização:</strong> {curriculo.data_atualizacao ? new Date(curriculo.data_atualizacao).toLocaleDateString('pt-BR') : 'Não disponível'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Botões de ação */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          
          {!isOwner && localStorage.getItem('userRole') === 'empresa' && (
            <Button variant="contained" color="primary">
              Entrar em Contato
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CurriculoView;
