import { ShieldAlert } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useUsuario } from '@/lib/usuario'
import AprovarVagas from '@/pages/prefeitura/AprovarVagas'
import Empresas from '@/pages/prefeitura/Empresas'
import Equipe from '@/pages/prefeitura/Equipe'
import { LayoutPrefeitura } from '@/pages/prefeitura/Layout'
import PainelInicio from '@/pages/prefeitura/PainelInicio'
import Planilhas from '@/pages/prefeitura/Planilhas'

// Área da prefeitura (computador). Só entra quem tem a permissão de aprovador.
export default function Prefeitura() {
  const { data: usuario, isLoading } = useUsuario()

  if (isLoading) return null
  if (!usuario?.permissoes.aprovar_vagas) {
    return (
      <main className="grid min-h-svh place-items-center p-8">
        <div className="bg-card flex max-w-md flex-col items-center gap-4 rounded-3xl p-10 text-center shadow-sm ring-1 ring-black/5">
          <span className="bg-accent-soft text-[oklch(0.5_0.13_65)] grid size-16 place-items-center rounded-2xl">
            <ShieldAlert className="size-8" />
          </span>
          <h1 className="text-2xl font-extrabold">Área da prefeitura</h1>
          <p className="text-muted-foreground">
            {usuario ? 'Sua conta ainda não tem permissão de aprovador. Peça a alguém da equipe.' : 'Entre com uma conta que tenha permissão de aprovador.'}
          </p>
          {!usuario && <Button asLink="/entrar">Entrar</Button>}
        </div>
      </main>
    )
  }

  return (
    <Routes>
      <Route element={<LayoutPrefeitura usuario={usuario} />}>
        <Route index element={<PainelInicio />} />
        <Route path="vagas" element={<AprovarVagas />} />
        <Route path="empresas" element={<Empresas />} />
        <Route path="equipe" element={<Equipe />} />
        <Route path="planilhas" element={<Planilhas />} />
      </Route>
    </Routes>
  )
}
