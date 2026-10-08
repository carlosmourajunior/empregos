import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

type Opcao = { valor: string; nome: string; dica?: string }

/** Botões grandes de escolha única (no lugar de select, mais fácil no celular). */
export function Escolhas({
  rotulo,
  opcoes,
  valor,
  onChange,
  erro,
  colunas = 1,
}: {
  rotulo: string
  opcoes: Opcao[]
  valor: string
  onChange: (valor: string) => void
  erro?: string
  colunas?: 1 | 2
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-xl font-bold">{rotulo}</legend>
      <div className={cn('grid gap-3', colunas === 2 && 'grid-cols-2')}>
        {opcoes.map((opcao) => {
          const marcado = opcao.valor === valor
          return (
            <button
              key={opcao.valor}
              type="button"
              role="radio"
              aria-checked={marcado}
              onClick={() => onChange(opcao.valor)}
              className={cn(
                'flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition',
                marcado ? 'border-primary bg-primary-soft' : 'border-border bg-card hover:bg-muted',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full border-2',
                  marcado ? 'border-primary bg-primary text-white' : 'border-border',
                )}
              >
                {marcado && <Check className="size-4" strokeWidth={3} />}
              </span>
              <span>
                <span className="block text-lg font-bold">{opcao.nome}</span>
                {opcao.dica && <span className="text-muted-foreground block text-sm">{opcao.dica}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {erro && (
        <p role="alert" className="text-destructive text-lg font-medium">
          {erro}
        </p>
      )}
    </fieldset>
  )
}
