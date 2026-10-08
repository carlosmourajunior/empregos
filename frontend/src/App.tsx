import { Route, Routes } from 'react-router-dom'

import { Protegido } from '@/components/Protegido'
import Curriculo from '@/pages/candidato/Curriculo'
import EditarCurriculo from '@/pages/candidato/EditarCurriculo'
import Interesses from '@/pages/candidato/Interesses'
import VagaDetalhe from '@/pages/candidato/VagaDetalhe'
import Vagas from '@/pages/candidato/Vagas'
import Codigo from '@/pages/Codigo'
import CriarConta from '@/pages/CriarConta'
import FormVaga from '@/pages/empresa/FormVaga'
import Interessados from '@/pages/empresa/Interessados'
import MinhasVagas from '@/pages/empresa/MinhasVagas'
import Entrar from '@/pages/Entrar'
import Inicio from '@/pages/Inicio'
import NaoEncontrada from '@/pages/NaoEncontrada'
import Prefeitura from '@/pages/Prefeitura'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/criar-conta" element={<CriarConta />} />
      <Route path="/codigo" element={<Codigo />} />

      {/* Vagas abertas: qualquer pessoa vê; para mostrar interesse precisa entrar. */}
      <Route path="/vagas" element={<Vagas />} />
      <Route path="/vagas/:id" element={<VagaDetalhe />} />
      <Route path="/interesses" element={<Protegido tipo="candidato"><Interesses /></Protegido>} />
      <Route path="/curriculo" element={<Protegido tipo="candidato"><Curriculo /></Protegido>} />
      <Route path="/curriculo/editar" element={<Protegido tipo="candidato"><EditarCurriculo /></Protegido>} />

      <Route path="/empresa" element={<Protegido tipo="empresa"><MinhasVagas /></Protegido>} />
      <Route path="/empresa/nova" element={<Protegido tipo="empresa"><FormVaga /></Protegido>} />
      <Route path="/empresa/vagas/:id/editar" element={<Protegido tipo="empresa"><FormVaga /></Protegido>} />
      <Route path="/empresa/vagas/:id/interessados" element={<Protegido tipo="empresa"><Interessados /></Protegido>} />

      {/* Área da prefeitura: mesmo app, telas pensadas para computador. */}
      <Route path="/prefeitura/*" element={<Prefeitura />} />
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  )
}
