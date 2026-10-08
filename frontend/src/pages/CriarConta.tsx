import { Briefcase, IdCard, Lock, type LucideIcon, Search, Smartphone, UserRound } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Campo } from '@/components/Campo'
import { Progresso, Tela } from '@/components/Tela'
import { Button } from '@/components/ui/button'
import { api, ApiError } from '@/lib/api'
import { erroDoCampo, mascaraCnpj, mascaraCpf, mascaraTelefone, soDigitos } from '@/lib/mascaras'

type Tipo = 'candidato' | 'empresa'
type Chave = 'nome' | 'documento' | 'telefone' | 'senha'

const PASSOS: Chave[] = ['nome', 'documento', 'telefone', 'senha']

export default function CriarConta() {
  const [params] = useSearchParams()
  const tipo = params.get('tipo') as Tipo | null
  return tipo === 'candidato' || tipo === 'empresa' ? <Formulario tipo={tipo} /> : <EscolherTipo />
}

function EscolherTipo() {
  return (
    <Tela titulo="Criar conta" subtitulo="O que você quer fazer?" voltarPara="/">
      <Link
        to="/criar-conta?tipo=candidato"
        className="bg-primary-soft hover:ring-primary flex items-center gap-4 rounded-2xl p-4 ring-2 ring-transparent transition"
      >
        <span className="bg-primary grid size-16 shrink-0 place-items-center rounded-2xl text-white">
          <Search className="size-8" />
        </span>
        <span>
          <span className="block text-xl font-bold">Procurar emprego</span>
          <span className="text-muted-foreground block text-base">Para quem quer trabalhar</span>
        </span>
      </Link>
      <Link
        to="/criar-conta?tipo=empresa"
        className="bg-accent-soft hover:ring-accent flex items-center gap-4 rounded-2xl p-4 ring-2 ring-transparent transition"
      >
        <span className="bg-accent text-accent-foreground grid size-16 shrink-0 place-items-center rounded-2xl">
          <Briefcase className="size-8" />
        </span>
        <span>
          <span className="block text-xl font-bold">Oferecer vagas</span>
          <span className="text-muted-foreground block text-base">Para empresas da cidade</span>
        </span>
      </Link>
    </Tela>
  )
}

const ICONES: Record<Chave, LucideIcon> = { nome: UserRound, documento: IdCard, telefone: Smartphone, senha: Lock }

function Formulario({ tipo }: { tipo: Tipo }) {
  const navigate = useNavigate()
  const [passo, setPasso] = useState(0)
  const [dados, setDados] = useState<Record<Chave, string>>({ nome: '', documento: '', telefone: '', senha: '' })
  const [erros, setErros] = useState<Partial<Record<Chave, string>>>({})
  const [enviando, setEnviando] = useState(false)

  const empresa = tipo === 'empresa'
  const chave = PASSOS[passo]

  const perguntas: Record<Chave, { rotulo: string; dica?: string; props: Record<string, unknown> }> = {
    nome: {
      rotulo: empresa ? 'Qual o nome da empresa?' : 'Qual o seu nome completo?',
      props: { autoComplete: empresa ? 'organization' : 'name', autoCapitalize: 'words' },
    },
    documento: {
      rotulo: empresa ? 'Qual o CNPJ da empresa?' : 'Qual o seu CPF?',
      dica: 'Só os números já bastam.',
      props: { inputMode: 'numeric', placeholder: empresa ? '00.000.000/0000-00' : '000.000.000-00' },
    },
    telefone: {
      rotulo: 'Qual o seu WhatsApp?',
      dica: 'Vamos mandar um código para confirmar. Coloque o DDD.',
      props: { inputMode: 'tel', autoComplete: 'tel-national', placeholder: '(00) 00000-0000' },
    },
    senha: {
      rotulo: 'Crie uma senha',
      dica: 'Pelo menos 6 letras ou números. Não use só números.',
      props: { type: 'password', autoComplete: 'new-password' },
    },
  }

  function mudar(valor: string) {
    const formatado =
      chave === 'documento'
        ? (empresa ? mascaraCnpj : mascaraCpf)(valor)
        : chave === 'telefone'
          ? mascaraTelefone(valor)
          : valor
    setDados({ ...dados, [chave]: formatado })
    setErros({ ...erros, [chave]: undefined })
  }

  function conferirPasso() {
    const valor = dados[chave].trim()
    if (!valor) return 'Preencha para continuar.'
    if (chave === 'documento' && soDigitos(valor).length !== (empresa ? 14 : 11))
      return empresa ? 'O CNPJ tem 14 números.' : 'O CPF tem 11 números.'
    if (chave === 'telefone' && soDigitos(valor).length < 10) return 'Coloque o DDD e o número.'
    if (chave === 'senha' && valor.length < 6) return 'A senha precisa ter pelo menos 6 letras ou números.'
  }

  async function avancar(evento: FormEvent) {
    evento.preventDefault()
    const erro = conferirPasso()
    if (erro) {
      setErros({ ...erros, [chave]: erro })
      return
    }
    if (passo < PASSOS.length - 1) {
      setPasso(passo + 1)
      return
    }
    setEnviando(true)
    try {
      await api('/auth/cadastro/', { method: 'POST', body: { ...dados, tipo } })
      navigate(`/codigo?documento=${soDigitos(dados.documento)}`)
    } catch (e) {
      if (e instanceof ApiError) {
        const encontrados = Object.fromEntries(PASSOS.map((c) => [c, erroDoCampo(e.dados, c)]))
        const primeiro = PASSOS.findIndex((c) => encontrados[c])
        if (primeiro >= 0) {
          setErros(encontrados)
          setPasso(primeiro)
          return
        }
      }
      setErros({ senha: e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.' })
    } finally {
      setEnviando(false)
    }
  }

  const pergunta = perguntas[chave]
  const ultimo = passo === PASSOS.length - 1

  return (
    <Tela
      titulo={empresa ? 'Cadastro da empresa' : 'Seu cadastro'}
      subtitulo="Uma pergunta de cada vez"
      icone={ICONES[chave]}
      voltarPara={passo === 0 ? '/criar-conta' : undefined}
    >
      <Progresso passo={passo + 1} total={PASSOS.length} />
      <form onSubmit={avancar} className="flex flex-col gap-6" noValidate>
        <Campo
          key={chave}
          rotulo={pergunta.rotulo}
          dica={pergunta.dica}
          erro={erros[chave]}
          value={dados[chave]}
          onChange={(e) => mudar(e.target.value)}
          autoFocus
          {...pergunta.props}
        />
        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={enviando}>
            {ultimo ? (enviando ? 'Criando...' : 'Criar conta') : 'Continuar'}
          </Button>
          {passo > 0 && (
            <Button type="button" variant="ghost" onClick={() => setPasso(passo - 1)}>
              Voltar uma pergunta
            </Button>
          )}
        </div>
      </form>
      <p className="text-center text-lg">
        Já tem conta?{' '}
        <Link to="/entrar" className="text-primary font-semibold underline">
          Entrar
        </Link>
      </p>
    </Tela>
  )
}
