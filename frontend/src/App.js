import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VagaDetalhes from './pages/Vagas/VagaDetalhes';
import CriarVaga from './pages/Vagas/CriarVaga';
import VagasTrabalhador from './pages/Vagas/VagasTrabalhador';
import GerenciarVagas from './pages/Admin/GerenciarVagas';
import GerenciarCandidatos from './pages/Admin/GerenciarCandidatos';
import GerenciarEmpresas from './pages/Admin/GerenciarEmpresas';
import CriarEmpresa from './pages/Admin/CriarEmpresa';
import CriarUsuario from './pages/Admin/CriarUsuario';
import CriarCandidatoCompleto from './pages/Admin/CriarCandidatoCompleto';
import CurriculoForm from './pages/Curriculo/CurriculoForm';
import CurriculoView from './pages/Curriculo/CurriculoView';
import AdminPanel from './pages/Admin/AdminPanel';
import PerfilUsuario from './pages/Perfil/PerfilUsuario';
import MinhasCandidaturas from './pages/Candidaturas/MinhasCandidaturas';
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/registro" 
        element={!user ? <Register /> : <Navigate to="/dashboard" />} 
      />
      
      {/* Rotas protegidas */}
      <Route 
        path="/" 
        element={user ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="perfil" element={<PerfilUsuario />} />
        
        {/* Rotas para trabalhadores */}
        {user?.tipo_usuario === 'trabalhador' && (
          <>
            <Route path="vagas" element={<VagasTrabalhador />} />
            <Route path="vagas/:id" element={<VagaDetalhes />} />
            <Route path="curriculo/editar" element={<CurriculoForm />} />
            <Route path="curriculo" element={<CurriculoView />} />
            <Route path="candidaturas" element={<MinhasCandidaturas />} />
          </>
        )}
        
        {/* Rotas para empresas */}
        {user?.tipo_usuario === 'empresa' && (
          <>
            <Route path="gerenciar-vagas" element={<GerenciarVagas />} />
            <Route path="vagas/criar" element={<CriarVaga />} />
            <Route path="vagas/:id" element={<VagaDetalhes />} />
            <Route path="vagas/:id/editar" element={<CriarVaga />} />
          </>
        )}
        
        {/* Rotas para admin */}
        {user?.tipo_usuario === 'admin' && (
          <>
            <Route path="admin" element={<AdminPanel />} />
            <Route path="gerenciar-vagas" element={<GerenciarVagas />} />
            <Route path="gerenciar-candidatos" element={<GerenciarCandidatos />} />
            <Route path="gerenciar-empresas" element={<GerenciarEmpresas />} />
            <Route path="candidatos/criar" element={<CriarUsuario />} />
            <Route path="candidatos/criar-completo" element={<CriarCandidatoCompleto />} />
            <Route path="empresas/criar" element={<CriarEmpresa />} />
            <Route path="empresas/:id/editar" element={<CriarEmpresa />} />
            <Route path="vagas/criar" element={<CriarVaga />} />
            <Route path="vagas/:id" element={<VagaDetalhes />} />
            <Route path="vagas/:id/editar" element={<CriarVaga />} />
            <Route path="candidatos/:id" element={<CurriculoView />} />
            <Route path="candidatos/:id/editar" element={<CurriculoForm />} />
          </>
        )}
      </Route>
      
      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
