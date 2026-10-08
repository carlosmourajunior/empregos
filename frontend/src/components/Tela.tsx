import { ArrowLeft, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Bolhas } from '@/components/ilustracoes'
import { Logo } from '@/components/Logo'

type Props = {
  titulo: string
  subtitulo?: string
  voltarPara?: string
  /** Ícone grande no topo colorido (usado no cadastro, um por pergunta). */
  icone?: LucideIcon
  /** Ilustração no topo colorido, no lugar do ícone. */
  ilustracao?: ReactNode
  children: ReactNode
}

/** Moldura das telas do celular: topo azul com ilustração e o conteúdo num cartão branco. */
export function Tela({ titulo, subtitulo, voltarPara, icone: Icone, ilustracao, children }: Props) {
  return (
    <div className="min-h-svh">
      <header className="from-primary relative overflow-hidden bg-linear-to-br to-[oklch(0.4_0.17_270)] pb-16 text-white">
        <Bolhas className="absolute inset-0 size-full" />
        <div className="relative mx-auto flex max-w-md flex-col gap-5 px-4 pt-4">
          <div className="flex min-h-12 items-center justify-between">
            {voltarPara ? (
              <Link
                to={voltarPara}
                className="-ml-2 inline-flex min-h-12 items-center gap-2 rounded-lg px-2 text-lg font-semibold hover:bg-white/10"
              >
                <ArrowLeft className="size-6" /> Voltar
              </Link>
            ) : (
              <span />
            )}
            <Link to="/" aria-label="Início">
              <Logo claro className="text-lg" />
            </Link>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">{titulo}</h1>
              {subtitulo && <p className="text-lg text-white/85">{subtitulo}</p>}
            </div>
            {Icone && (
              <span className="bg-accent text-accent-foreground grid size-20 shrink-0 rotate-3 place-items-center rounded-3xl shadow-lg">
                <Icone className="size-10" strokeWidth={2.2} />
              </span>
            )}
          </div>
          {ilustracao}
        </div>
      </header>
      <main className="relative mx-auto -mt-10 max-w-md px-4 pb-10">
        <div className="bg-card flex flex-col gap-6 rounded-3xl p-5 shadow-xl shadow-black/5 ring-1 ring-black/5">
          {children}
        </div>
      </main>
    </div>
  )
}

export function Progresso({ passo, total }: { passo: number; total: number }) {
  return (
    <div className="flex items-center gap-3" aria-label={`Passo ${passo} de ${total}`}>
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-colors ${i < passo ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className="text-muted-foreground text-base font-semibold whitespace-nowrap">
        {passo} de {total}
      </span>
    </div>
  )
}
