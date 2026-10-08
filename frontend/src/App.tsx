import { Route, Routes } from 'react-router-dom'

import Inicio from '@/pages/Inicio'
import NaoEncontrada from '@/pages/NaoEncontrada'
import Prefeitura from '@/pages/Prefeitura'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      {/* Área da prefeitura: mesmo app, telas pensadas para computador. */}
      <Route path="/prefeitura/*" element={<Prefeitura />} />
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  )
}
