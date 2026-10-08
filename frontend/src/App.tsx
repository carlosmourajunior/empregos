import { Route, Routes } from 'react-router-dom'

import Codigo from '@/pages/Codigo'
import CriarConta from '@/pages/CriarConta'
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
      {/* Área da prefeitura: mesmo app, telas pensadas para computador. */}
      <Route path="/prefeitura/*" element={<Prefeitura />} />
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  )
}
