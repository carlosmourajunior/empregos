import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BadgeCheck,
  Briefcase,
  Clock,
  FileSignature,
  FileText,
  type LucideIcon,
  MapPin,
  Minus,
  Plus,
  Tag,
  Users,
  Wallet,
} from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Campo } from '@/components/Campo'
import { CampoSugestoes } from '@/components/CampoSugestoes'
import { Escolhas } from '@/components/Escolhas'
import { Progresso, Tela } from '@/components/Tela'
import { Button } from '@/components/ui/button'
import { api, ApiError, type VagaEmpresa } from '@/lib/api'
import { erroDoCampo, soDigitos } from '@/lib/mascaras'
import { CONTRATOS, HORARIOS } from '@/lib/opcoes'

type Dados = {
  cargo: string
  area: string
  descricao: string
  salario: string
  a_combinar: boolean
  contrato: string
  horario: string
  bairro: string
  quantidade: number
}

type Passo = 'cargo' | 'area' | 'descricao' | 'salario' | 'contrato' | 'horario' | 'bairro' | 'quantidade'

const PASSOS: { chave: Passo; icone: LucideIcon }[] = [
  { chave: 'cargo', icone: Briefcase },
  { chave: 'area', icone: Tag },
  { chave: 'descricao', icone: FileText },
  { chave: 'salario', icone: Wallet },
  { chave: 'contrato', icone: FileSignature },
  { chave: 'horario', icone: Clock },
  { chave: 'bairro', icone: MapPin },
  { chave: 'quantidade', icone: Users },
]

const MAX_DESCRICAO = 300

const VAZIO: Dados = {
  cargo: '',
  area: '',
  descricao: '',
  salario: '',
  a_combinar: false,
  contrato: '',
  horario: '',
  bairro: '',
  quantidade: 1,
}

export default function FormVaga() {
  const { id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['minha-vaga', id],
    queryFn: () => api<VagaEmpresa>(`/minhas-vagas/${id}/`),
    enabled: Boolean(id),
  })
  if (id && isLoading) return null
  const inicial: Dados = data
    ? {
        ...data,
        salario: data.salario ? String(Math.round(Number(data.salario))) : '',
        a_combinar: !data.salario,
      }
    : VAZIO
  return <Formulario id={id} inicial={inicial} />
}

function Formulario({ id, inicial }: { id?: string; inicial: Dados }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const idDescricao = useId()
  const [passo, setPasso] = useState(0)
  const [dados, setDados] = useState<Dados>(inicial)
  const [erro, setErro] = useState<string>()
  const [salvando, setSalvando] = useState(false)
  const [pronto, setPronto] = useState(false)

  const { chave, icone } = PASSOS[passo]
  const ultimo = passo === PASSOS.length - 1

  function mudar<K extends keyof Dados>(campo: K, valor: Dados[K]) {
    setDados({ ...dados, [campo]: valor })
    setErro(undefined)
  }

  function conferir() {
    if (chave === 'cargo' && !dados.cargo.trim()) return 'Escreva o nome do cargo.'
    if (chave === 'area' && !dados.area.trim()) return 'Escreva a área.'
    if (chave === 'descricao' && !dados.descricao.trim()) return 'Conte em poucas palavras o que a pessoa vai fazer.'
    if (chave === 'salario' && !dados.a_combinar && !Number(dados.salario)) return 'Coloque o valor ou marque “A combinar”.'
    if (chave === 'contrato' && !dados.contrato) return 'Escolha uma opção.'
    if (chave === 'horario' && !dados.horario) return 'Escolha uma opção.'
    if (chave === 'bairro' && !dados.bairro.trim()) return 'Escreva o bairro do trabalho.'
  }

  async function avancar(evento: FormEvent) {
    evento.preventDefault()
    const problema = conferir()
    if (problema) return setErro(problema)
    if (!ultimo) {
      setPasso(passo + 1)
      return
    }
    setSalvando(true)
    const { a_combinar, ...resto } = dados
    const corpo = { ...resto, salario: a_combinar ? null : dados.salario }
    try {
      await api(id ? `/minhas-vagas/${id}/` : '/minhas-vagas/', { method: id ? 'PATCH' : 'POST', body: corpo })
      queryClient.invalidateQueries({ queryKey: ['minhas-vagas'] })
      setPronto(true)
    } catch (e) {
      if (e instanceof ApiError) {
        const i = PASSOS.findIndex((p) => erroDoCampo(e.dados, p.chave))
        if (i >= 0) {
          setPasso(i)
          return setErro(erroDoCampo(e.dados, PASSOS[i].chave))
        }
      }
      setErro(e instanceof Error ? e.message : 'Algo deu errado. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  if (pronto) {
    return (
      <Tela titulo={id ? 'Vaga atualizada!' : 'Vaga enviada!'} icone={BadgeCheck}>
        <p className="text-xl">
          A prefeitura vai conferir a vaga <strong>{dados.cargo}</strong> e publicar. Você acompanha tudo em “Minhas vagas”.
        </p>
        <Button size="lg" onClick={() => navigate('/empresa')}>
          Ver minhas vagas
        </Button>
      </Tela>
    )
  }

  return (
    <Tela titulo={id ? 'Mudar vaga' : 'Nova vaga'} subtitulo="Uma pergunta de cada vez" icone={icone} voltarPara={passo === 0 ? '/empresa' : undefined}>
      <Progresso passo={passo + 1} total={PASSOS.length} />
      <form onSubmit={avancar} className="flex flex-col gap-6" noValidate>
        {chave === 'cargo' && (
          <Campo
            rotulo="Qual o cargo?"
            placeholder="Ex.: Auxiliar de cozinha"
            maxLength={80}
            value={dados.cargo}
            onChange={(e) => mudar('cargo', e.target.value)}
            erro={erro}
            autoFocus
          />
        )}
        {chave === 'area' && (
          <CampoSugestoes
            campo="area"
            rotulo="De qual área?"
            dica="Ex.: cozinha, comércio, construção."
            maxLength={60}
            value={dados.area}
            onChange={(e) => mudar('area', e.target.value)}
            erro={erro}
            autoFocus
          />
        )}
        {chave === 'descricao' && (
          <div className="flex flex-col gap-2">
            <label htmlFor={idDescricao} className="text-xl font-bold">
              O que a pessoa vai fazer?
            </label>
            <p className="text-muted-foreground text-base">Frases curtas e simples. Pode usar o microfone do teclado.</p>
            <textarea
              id={idDescricao}
              rows={5}
              maxLength={MAX_DESCRICAO}
              value={dados.descricao}
              onChange={(e) => mudar('descricao', e.target.value)}
              aria-invalid={erro ? true : undefined}
              className="border-border bg-card focus:border-primary aria-invalid:border-destructive w-full rounded-xl border-2 p-4 text-xl"
              autoFocus
            />
            <p className="text-muted-foreground text-right text-sm">
              {dados.descricao.length} de {MAX_DESCRICAO}
            </p>
            {erro && (
              <p role="alert" className="text-destructive text-lg font-medium">
                {erro}
              </p>
            )}
          </div>
        )}
        {chave === 'salario' && (
          <div className="flex flex-col gap-4">
            <Escolhas
              rotulo="Qual o salário?"
              colunas={2}
              opcoes={[
                { valor: 'valor', nome: 'Valor fixo' },
                { valor: 'combinar', nome: 'A combinar' },
              ]}
              valor={dados.a_combinar ? 'combinar' : 'valor'}
              onChange={(v) => mudar('a_combinar', v === 'combinar')}
            />
            {!dados.a_combinar && (
              <Campo
                rotulo="Valor por mês (R$)"
                inputMode="numeric"
                placeholder="Ex.: 1800"
                value={dados.salario}
                onChange={(e) => mudar('salario', soDigitos(e.target.value).slice(0, 6))}
                erro={erro}
              />
            )}
          </div>
        )}
        {chave === 'contrato' && (
          <Escolhas rotulo="Tipo de contrato" opcoes={CONTRATOS} valor={dados.contrato} onChange={(v) => mudar('contrato', v)} erro={erro} />
        )}
        {chave === 'horario' && (
          <Escolhas rotulo="Qual o horário?" colunas={2} opcoes={HORARIOS} valor={dados.horario} onChange={(v) => mudar('horario', v)} erro={erro} />
        )}
        {chave === 'bairro' && (
          <CampoSugestoes
            campo="bairro"
            rotulo="Em qual bairro é o trabalho?"
            maxLength={80}
            value={dados.bairro}
            onChange={(e) => mudar('bairro', e.target.value)}
            erro={erro}
            autoFocus
          />
        )}
        {chave === 'quantidade' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Quantas pessoas você quer contratar?</h2>
            <div className="flex items-center justify-center gap-6">
              <Button
                type="button"
                variant="outline"
                aria-label="Menos"
                className="size-16 p-0"
                onClick={() => mudar('quantidade', Math.max(1, dados.quantidade - 1))}
              >
                <Minus />
              </Button>
              <span className="w-20 text-center text-5xl font-extrabold" aria-live="polite">
                {dados.quantidade}
              </span>
              <Button
                type="button"
                variant="outline"
                aria-label="Mais"
                className="size-16 p-0"
                onClick={() => mudar('quantidade', Math.min(99, dados.quantidade + 1))}
              >
                <Plus />
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={salvando}>
            {ultimo ? (salvando ? 'Enviando...' : id ? 'Salvar e enviar para aprovação' : 'Enviar vaga') : 'Continuar'}
          </Button>
          {passo > 0 && (
            <Button type="button" variant="ghost" onClick={() => setPasso(passo - 1)}>
              Voltar uma pergunta
            </Button>
          )}
        </div>
      </form>
    </Tela>
  )
}
