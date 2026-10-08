import { useQueryClient } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Campo } from '@/components/Campo'
import { Tela } from '@/components/Tela'
import { Button } from '@/components/ui/button'
import { api, ApiError, type Usuario } from '@/lib/api'
import { mascaraDocumento, soDigitos } from '@/lib/mascaras'

export default function Entrar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [documento, setDocumento] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string>()
  const [enviando, setEnviando] = useState(false)

  async function entrar(evento: FormEvent) {
    evento.preventDefault()
    setErro(undefined)
    setEnviando(true)
    try {
      const usuario = await api<Usuario>('/auth/login/', { method: 'POST', body: { documento, senha } })
      queryClient.setQueryData(['eu'], usuario)
      navigate(usuario.tipo === 'prefeitura' ? '/prefeitura' : '/')
    } catch (e) {
      if (e instanceof ApiError && e.dados.codigo === 'telefone_nao_verificado') {
        navigate(`/codigo?documento=${soDigitos(documento)}`)
        return
      }
      setErro(e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tela titulo="Entrar" subtitulo="Que bom ter você de volta" icone={KeyRound} voltarPara="/">
      <form onSubmit={entrar} className="flex flex-col gap-6">
        <Campo
          rotulo="Seu CPF ou CNPJ"
          inputMode="numeric"
          autoComplete="username"
          placeholder="000.000.000-00"
          value={documento}
          onChange={(e) => setDocumento(mascaraDocumento(e.target.value))}
          required
        />
        <Campo
          rotulo="Sua senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={erro}
          required
        />
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <p className="text-center text-lg">
        Ainda não tem conta?{' '}
        <Link to="/criar-conta" className="text-primary font-semibold underline">
          Criar conta
        </Link>
      </p>
    </Tela>
  )
}
