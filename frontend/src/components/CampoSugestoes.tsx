import { type ComponentProps, useId } from 'react'

import { Campo } from '@/components/Campo'
import { useSugestoes } from '@/lib/sugestoes'

/** Campo de texto livre que sugere o que outras pessoas já digitaram (área ou bairro). */
export function CampoSugestoes({
  campo,
  value,
  ...props
}: ComponentProps<typeof Campo> & { campo: 'area' | 'bairro'; value: string }) {
  const lista = useId()
  const sugestoes = useSugestoes(campo, value)
  return (
    <>
      <Campo list={lista} value={value} autoComplete="off" {...props} />
      <datalist id={lista}>
        {sugestoes.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </>
  )
}
