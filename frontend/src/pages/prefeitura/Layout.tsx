import { useQueryClient } from '@tanstack/react-query'
import { Building2, ClipboardCheck, FileSpreadsheet, LayoutDashboard, LogOut, type LucideIcon, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Bolhas } from '@/components/ilustracoes'
import { Logo } from '@/components/Logo'
import { api, type Usuario } from '@/lib/api'
import { useNumeros } from '@/lib/painel'
import { cn } from '@/lib/utils'

const MENU: { para: string; nome: string; icone: LucideIcon; contador?: 'pendentes' }[] = [
  { para: '/prefeitura', nome: 'Início', icone: LayoutDashboard },
  { para: '/prefeitura/vagas', nome: 'Aprovar vagas', icone: ClipboardCheck, contador: 'pendentes' },
  { para: '/prefeitura/empresas', nome: 'Empresas', icone: Building2 },
  { para: '/prefeitura/equipe', nome: 'Equipe', icone: Users },
  { para: '/prefeitura/planilhas', nome: 'Planilhas', icone: FileSpreadsheet },
]

/** Moldura da área da prefeitura: menu lateral fixo, pensado para tela de computador. */
export function LayoutPrefeitura({ usuario }: { usuario: Usuario }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: numeros } = useNumeros()

  async function sair() {
    await api('/auth/logout/', { method: 'POST' })
    queryClient.clear()
    navigate('/')
  }

  return (
    <div className="flex min-h-svh text-base">
      <aside className="from-primary sticky top-0 flex h-svh w-72 shrink-0 flex-col overflow-hidden bg-linear-to-b to-[oklch(0.36_0.16_270)] text-white">
        <Bolhas className="absolute inset-0 size-full" />
        <div className="relative flex flex-1 flex-col gap-8 p-5">
          <div>
            <Logo claro />
            <p className="mt-1 pl-11 text-sm font-semibold text-white/70">Área da prefeitura</p>
          </div>
          <nav className="flex flex-col gap-1">
            {MENU.map(({ para, nome, icone: Icone, contador }) => {
              const valor = contador ? numeros?.[contador] : undefined
              return (
                <NavLink
                  key={para}
                  to={para}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors',
                      isActive ? 'text-primary bg-white shadow-md' : 'text-white/85 hover:bg-white/10',
                    )
                  }
                >
                  <Icone className="size-5" />
                  <span className="flex-1">{nome}</span>
                  {!!valor && (
                    <span className="bg-accent text-accent-foreground min-w-7 rounded-full px-2 text-center text-sm">
                      {valor}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>
          <div className="mt-auto flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <span className="bg-accent text-accent-foreground grid size-10 shrink-0 place-items-center rounded-full font-extrabold">
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{usuario.nome}</p>
              <p className="text-sm text-white/70">Aprovador</p>
            </div>
            <button onClick={sair} className="rounded-xl p-2 hover:bg-white/15" aria-label="Sair" title="Sair">
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-10 py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

/** Título de cada tela da prefeitura, com ações à direita. */
export function Cabecalho({ titulo, texto, children }: { titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{titulo}</h1>
        {texto && <p className="text-muted-foreground mt-1">{texto}</p>}
      </div>
      {children}
    </header>
  )
}
