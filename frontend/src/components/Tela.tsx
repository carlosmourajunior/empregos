import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Moldura das telas do celular: voltar, título e conteúdo numa coluna estreita. */
export function Tela({ titulo, voltarPara, children }: { titulo: string; voltarPara?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-6 px-4 py-6">
      {voltarPara && (
        <Link to={voltarPara} className="text-primary -ml-1 inline-flex min-h-12 items-center gap-2 self-start text-lg font-semibold">
          <ArrowLeft className="size-6" /> Voltar
        </Link>
      )}
      <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
      {children}
    </main>
  )
}

export function Progresso({ passo, total }: { passo: number; total: number }) {
  return (
    <div className="flex flex-col gap-2" aria-label={`Passo ${passo} de ${total}`}>
      <p className="text-muted-foreground text-base font-medium">
        Passo {passo} de {total}
      </p>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(passo / total) * 100}%` }} />
      </div>
    </div>
  )
}
