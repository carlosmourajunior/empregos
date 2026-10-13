import type { LucideIcon } from 'lucide-react'
import { type ComponentProps, type ReactNode, useId } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Peças dos formulários de edição da prefeitura: janela, campos compactos (tela de computador) e erros da API.

const CLASSE_CAMPO =
  'bg-card focus:border-primary aria-invalid:border-destructive min-h-11 w-full rounded-xl border-2 px-3 text-base outline-none'

export function Janela({
  titulo,
  texto,
  icone: Icone,
  ocupado,
  erro,
  largura = 'max-w-2xl',
  onFechar,
  onSalvar,
  children,
}: {
  titulo: string
  texto?: string
  icone: LucideIcon
  ocupado: boolean
  erro?: string
  largura?: string
  onFechar: () => void
  onSalvar: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4" onClick={onFechar}>
      <form
        className={cn('bg-background flex max-h-[92svh] w-full flex-col rounded-3xl shadow-2xl', largura)}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          onSalvar()
        }}
      >
        <div className="flex items-center gap-3 border-b p-6">
          <span className="bg-primary-soft text-primary grid size-12 shrink-0 place-items-center rounded-2xl">
            <Icone className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">{titulo}</h2>
            {texto && <p className="text-muted-foreground text-sm">{texto}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto p-6">{children}</div>
        <div className="bg-card flex items-center justify-end gap-3 rounded-b-3xl border-t p-5">
          {erro && <p className="text-destructive mr-auto font-semibold">{erro}</p>}
          <Button type="button" variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" disabled={ocupado}>
            {ocupado ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Rotulo({ rotulo, erro, className, children }: { rotulo: string; erro?: string; className?: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="text-sm font-bold">
        {rotulo}
      </label>
      {children(id)}
      {erro && (
        <p role="alert" className="text-destructive text-sm font-semibold">
          {erro}
        </p>
      )}
    </div>
  )
}

type Comum = { rotulo: string; erro?: string; className?: string }

export function CampoTexto({ rotulo, erro, className, ...props }: Comum & ComponentProps<'input'>) {
  return (
    <Rotulo rotulo={rotulo} erro={erro} className={className}>
      {(id) => <input id={id} aria-invalid={erro ? true : undefined} className={CLASSE_CAMPO} {...props} />}
    </Rotulo>
  )
}

export function CampoTextoLongo({ rotulo, erro, className, ...props }: Comum & ComponentProps<'textarea'>) {
  return (
    <Rotulo rotulo={rotulo} erro={erro} className={className}>
      {(id) => <textarea id={id} rows={3} aria-invalid={erro ? true : undefined} className={cn(CLASSE_CAMPO, 'py-2')} {...props} />}
    </Rotulo>
  )
}

export function CampoEscolha({
  rotulo,
  erro,
  className,
  opcoes,
  ...props
}: Comum & ComponentProps<'select'> & { opcoes: { valor: string; nome: string }[] }) {
  return (
    <Rotulo rotulo={rotulo} erro={erro} className={className}>
      {(id) => (
        <select id={id} aria-invalid={erro ? true : undefined} className={CLASSE_CAMPO} {...props}>
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.nome}
            </option>
          ))}
        </select>
      )}
    </Rotulo>
  )
}
