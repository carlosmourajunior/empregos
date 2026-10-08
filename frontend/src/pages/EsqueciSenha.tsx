import { useQueryClient } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Campo } from '@/components/Campo'
import { IlustracaoCelular } from '@/components/ilustracoes'
import { Tela } from '@/components/Tela'
import { Button } from '@/components/ui/button'
import { api, ApiError, type Usuario } from '@/lib/api'
import { erroDoCampo, mascaraDocumento, soDigitos } from '@/lib/mascaras'
import { paginaInicial } from '@/lib/usuario'

/** Esqueci a senha: código pelo WhatsApp e uma senha nova, em duas telas. */
export default function EsqueciSenha() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [documento, setDocumento] = useState('')
  const [codigoEnviado, setCodigoEnviado] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState<{ documento?: string; codigo?: string; senha?: string }>({})
  const [enviando, setEnviando] = useState(false)

  async function pedirCodigo(evento: FormEvent) {
    evento.preventDefault()
    const digitos = soDigitos(documento)
    if (digitos.length !== 11 && digitos.length !== 14) {
      setErros({ documento: 'Digite o CPF (11 números) ou o CNPJ (14 números).' })
      return
    }
    setEnviando(true)
    setErros({})
    try {
      await api('/auth/enviar-codigo/', { method: 'POST', body: { documento } })
      setCodigoEnviado(true)
    } catch (e) {
      setErros({ documento: e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.' })
    } finally {
      setEnviando(false)
    }
  }

  async function trocarSenha(evento: FormEvent) {
    evento.preventDefault()
    if (codigo.length !== 6) {
      setErros({ codigo: 'O código tem 6 números.' })
      return
    }
    if (senha.length < 6) {
      setErros({ senha: 'A senha precisa ter pelo menos 6 letras ou números.' })
      return
    }
    setEnviando(true)
    setErros({})
    try {
      const usuario = await api<Usuario>('/auth/nova-senha/', { method: 'POST', body: { documento, codigo, senha } })
      queryClient.setQueryData(['eu'], usuario)
      navigate(paginaInicial(usuario))
    } catch (e) {
      const senhaErro = e instanceof ApiError ? erroDoCampo(e.dados, 'senha') : undefined
      setErros(senhaErro ? { senha: senhaErro } : { codigo: e instanceof Error ? e.message : 'Algo deu errado.' })
    } finally {
      setEnviando(false)
    }
  }

  if (!codigoEnviado) {
    return (
      <Tela titulo="Esqueci a senha" subtitulo="Vamos mandar um código para o seu WhatsApp" icone={KeyRound} voltarPara="/entrar">
        <form onSubmit={pedirCodigo} className="flex flex-col gap-6" noValidate>
          <Campo
            rotulo="Seu CPF ou CNPJ"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={documento}
            onChange={(e) => setDocumento(mascaraDocumento(e.target.value))}
            erro={erros.documento}
            autoFocus
          />
          <Button type="submit" size="lg" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Mandar código'}
          </Button>
        </form>
      </Tela>
    )
  }

  return (
    <Tela
      titulo="Crie uma senha nova"
      subtitulo="Se o cadastro existir, o código chegou no WhatsApp."
      voltarPara="/entrar"
      ilustracao={<IlustracaoCelular className="mx-auto -mb-6 h-44" />}
    >
      <form onSubmit={trocarSenha} className="flex flex-col gap-6" noValidate>
        <Campo
          rotulo="Código do WhatsApp"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="text-center text-3xl tracking-[0.5em]"
          maxLength={6}
          value={codigo}
          onChange={(e) => setCodigo(soDigitos(e.target.value).slice(0, 6))}
          erro={erros.codigo}
          autoFocus
        />
        <Campo
          rotulo="Senha nova"
          dica="Pelo menos 6 letras ou números. Não use só números."
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={erros.senha}
        />
        <Button type="submit" size="lg" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar e entrar'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setCodigoEnviado(false)}>
          Não recebi o código
        </Button>
      </form>
    </Tela>
  )
}
