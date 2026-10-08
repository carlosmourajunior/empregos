import { useQueryClient } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Campo } from '@/components/Campo'
import { Tela } from '@/components/Tela'
import { Button } from '@/components/ui/button'
import { api, type Usuario } from '@/lib/api'
import { soDigitos } from '@/lib/mascaras'

const ESPERA_REENVIO = 60

export default function Codigo() {
  const [params] = useSearchParams()
  const documento = params.get('documento') ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState<string>()
  const [aviso, setAviso] = useState<string>()
  const [enviando, setEnviando] = useState(false)
  const [espera, setEspera] = useState(ESPERA_REENVIO)

  useEffect(() => {
    if (espera <= 0) return
    const timer = setTimeout(() => setEspera(espera - 1), 1000)
    return () => clearTimeout(timer)
  }, [espera])

  async function confirmar(evento: FormEvent) {
    evento.preventDefault()
    if (codigo.length !== 6) {
      setErro('O código tem 6 números.')
      return
    }
    setEnviando(true)
    setErro(undefined)
    try {
      const usuario = await api<Usuario>('/auth/verificar-codigo/', { method: 'POST', body: { documento, codigo } })
      queryClient.setQueryData(['eu'], usuario)
      navigate(usuario.tipo === 'prefeitura' ? '/prefeitura' : '/')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  async function reenviar() {
    setErro(undefined)
    try {
      await api('/auth/enviar-codigo/', { method: 'POST', body: { documento } })
      setAviso('Enviamos um novo código.')
      setEspera(ESPERA_REENVIO)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não conseguimos reenviar. Tente de novo.')
    }
  }

  return (
    <Tela titulo="Confirme seu WhatsApp" voltarPara="/entrar">
      <div className="bg-muted flex items-start gap-3 rounded-lg p-4 text-lg">
        <MessageCircle className="text-primary mt-0.5 size-7 shrink-0" />
        <p>Mandamos uma mensagem no seu WhatsApp com um código de 6 números.</p>
      </div>
      <form onSubmit={confirmar} className="flex flex-col gap-6">
        <Campo
          rotulo="Digite o código"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="text-center text-3xl tracking-[0.5em]"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(soDigitos(e.target.value).slice(0, 6))}
          erro={erro}
          autoFocus
        />
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? 'Confirmando...' : 'Confirmar'}
        </Button>
      </form>
      {aviso && <p className="text-center text-lg">{aviso}</p>}
      <Button variant="ghost" onClick={reenviar} disabled={espera > 0}>
        {espera > 0 ? `Pedir outro código em ${espera}s` : 'Não chegou? Pedir outro código'}
      </Button>
    </Tela>
  )
}
