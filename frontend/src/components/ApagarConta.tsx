import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

/** "Apagar minha conta" (LGPD): pede confirmação e remove todos os dados. */
export function ApagarConta({ texto }: { texto: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmando, setConfirmando] = useState(false)
  const [apagando, setApagando] = useState(false)

  async function apagar() {
    setApagando(true)
    await api('/auth/eu/', { method: 'DELETE' })
    queryClient.clear()
    navigate('/', { replace: true })
  }

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="text-muted-foreground hover:text-coral mx-auto inline-flex min-h-12 items-center gap-2 font-semibold underline print:hidden"
      >
        <Trash2 className="size-5" /> Apagar minha conta
      </button>
    )
  }
  return (
    <div className="bg-coral-soft flex flex-col gap-3 rounded-3xl p-5 print:hidden" role="alert">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Trash2 className="text-coral size-6" /> Apagar sua conta?
      </h2>
      <p className="text-lg">{texto} Não dá para desfazer.</p>
      <Button className="bg-coral hover:bg-coral/90 text-white" disabled={apagando} onClick={apagar}>
        {apagando ? 'Apagando...' : 'Sim, apagar tudo'}
      </Button>
      <Button variant="ghost" onClick={() => setConfirmando(false)}>
        Não, voltar
      </Button>
    </div>
  )
}
