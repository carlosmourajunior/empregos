import { useQueryClient } from '@tanstack/react-query'
import { Briefcase, FileText, Heart, LogOut, type LucideIcon, Plus, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { Bolhas } from '@/components/ilustracoes'
import { Logo } from '@/components/Logo'
import { api, type Usuario } from '@/lib/api'
import { cn } from '@/lib/utils'

const MENUS: Record<'candidato' | 'empresa', { para: string; nome: string; icone: LucideIcon }[]> = {
  candidato: [
    { para: '/vagas', nome: 'Vagas', icone: Search },
    { para: '/interesses', nome: 'Meus interesses', icone: Heart },
    { para: '/curriculo', nome: 'Currículo', icone: FileText },
  ],
  empresa: [
    { para: '/empresa', nome: 'Minhas vagas', icone: Briefcase },
    { para: '/empresa/nova', nome: 'Nova vaga', icone: Plus },
  ],
}

/** Moldura das telas de quem já entrou: topo colorido, conteúdo e menu fixo embaixo. */
export function AreaLogada({
  usuario,
  titulo,
  subtitulo,
  topo,
  children,
}: {
  usuario?: Usuario | null
  titulo: string
  subtitulo?: string
  /** Conteúdo extra no topo colorido (ex.: busca). */
  topo?: ReactNode
  children: ReactNode
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const menu = usuario && usuario.tipo !== 'prefeitura' ? MENUS[usuario.tipo] : []

  async function sair() {
    await api('/auth/logout/', { method: 'POST' })
    queryClient.clear()
    navigate('/')
  }

  return (
    <div className={cn('min-h-svh', menu.length > 0 && 'pb-28')}>
      <header className="from-primary relative overflow-hidden rounded-b-[2rem] bg-linear-to-br to-[oklch(0.4_0.17_270)] pb-6 text-white">
        <Bolhas className="absolute inset-0 size-full" />
        <div className="relative mx-auto flex max-w-md flex-col gap-4 px-4 pt-4">
          <div className="flex min-h-12 items-center justify-between">
            <NavLink to="/" aria-label="Início">
              <Logo claro />
            </NavLink>
            {usuario ? (
              <button
                onClick={sair}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/15 px-4 text-base font-bold hover:bg-white/25"
              >
                <LogOut className="size-5" /> Sair
              </button>
            ) : (
              <NavLink to="/entrar" className="rounded-full bg-white/15 px-5 py-2.5 text-base font-bold hover:bg-white/25">
                Entrar
              </NavLink>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">{titulo}</h1>
            {subtitulo && <p className="text-lg text-white/85">{subtitulo}</p>}
          </div>
          {topo}
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">{children}</main>

      {menu.length > 0 && (
        <nav className="bg-card/95 fixed inset-x-0 bottom-0 z-10 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <ul className="mx-auto flex max-w-md">
            {menu.map(({ para, nome, icone: Icone }) => (
              <li key={para} className="flex-1">
                <NavLink
                  to={para}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-bold',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={cn('rounded-full px-4 py-1', isActive && 'bg-primary-soft')}>
                        <Icone className="size-6" />
                      </span>
                      {nome}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}

/** Caixa de "nada por aqui" com desenho e uma ação. */
export function Vazio({ icone: Icone, titulo, texto, acao }: { icone: LucideIcon; titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="bg-card flex flex-col items-center gap-3 rounded-3xl p-8 text-center ring-1 ring-black/5">
      <span className="bg-accent-soft relative grid size-24 place-items-center rounded-full">
        <span className="bg-accent text-accent-foreground grid size-14 rotate-6 place-items-center rounded-2xl shadow-md">
          <Icone className="size-7" />
        </span>
      </span>
      <h2 className="text-xl font-bold">{titulo}</h2>
      <p className="text-muted-foreground text-base">{texto}</p>
      {acao}
    </div>
  )
}
