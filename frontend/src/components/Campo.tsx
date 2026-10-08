import { type ComponentProps, useId } from 'react'

import { Input } from '@/components/ui/input'

type Props = ComponentProps<typeof Input> & {
  rotulo: string
  dica?: string
  erro?: string
}

/** Pergunta + campo + erro em linguagem simples. Uma pergunta por tela no cadastro. */
export function Campo({ rotulo, dica, erro, ...props }: Props) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-2xl font-semibold">
        {rotulo}
      </label>
      {dica && <p className="text-muted-foreground text-base">{dica}</p>}
      <Input id={id} aria-invalid={erro ? true : undefined} aria-describedby={erro ? `${id}-erro` : undefined} {...props} />
      {erro && (
        <p id={`${id}-erro`} role="alert" className="text-destructive text-lg font-medium">
          {erro}
        </p>
      )}
    </div>
  )
}
