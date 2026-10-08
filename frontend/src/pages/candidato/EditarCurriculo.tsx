import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Briefcase, Cake, Car, GraduationCap, History, type LucideIcon, MapPin, Plus, Trash2, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Campo } from '@/components/Campo'
import { CampoSugestoes } from '@/components/CampoSugestoes'
import { Escolhas } from '@/components/Escolhas'
import { Progresso, Tela } from '@/components/Tela'
import { Button } from '@/components/ui/button'
import { api, ApiError, type Curriculo, type Experiencia } from '@/lib/api'
import { erroDoCampo } from '@/lib/mascaras'
import { ESCOLARIDADES } from '@/lib/opcoes'

type Passo = 'data_nascimento' | 'bairro' | 'escolaridade' | 'areas_interesse' | 'experiencias' | 'tem_cnh'

const PASSOS: { chave: Passo; icone: LucideIcon }[] = [
  { chave: 'data_nascimento', icone: Cake },
  { chave: 'bairro', icone: MapPin },
  { chave: 'escolaridade', icone: GraduationCap },
  { chave: 'areas_interesse', icone: Briefcase },
  { chave: 'experiencias', icone: History },
  { chave: 'tem_cnh', icone: Car },
]

const VAZIO: Curriculo = {
  data_nascimento: '',
  bairro: '',
  escolaridade: '',
  areas_interesse: [],
  tem_cnh: false,
  categoria_cnh: '',
  experiencias: [],
}

export default function EditarCurriculo() {
  const { data, isLoading } = useQuery({
    queryKey: ['curriculo'],
    queryFn: async () => {
      try {
        return await api<Curriculo>('/curriculo/')
      } catch (erro) {
        if (erro instanceof ApiError && erro.status === 404) return null
        throw erro
      }
    },
  })
  if (isLoading) return null
  return <Formulario inicial={data ?? VAZIO} />
}

function Formulario({ inicial }: { inicial: Curriculo }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const [passo, setPasso] = useState(0)
  const [dados, setDados] = useState<Curriculo>(inicial)
  const [erro, setErro] = useState<string>()
  const [novaArea, setNovaArea] = useState('')
  const [novaExp, setNovaExp] = useState<Experiencia>({ o_que_fazia: '', onde: '', quanto_tempo: '' })
  const [salvando, setSalvando] = useState(false)

  const { chave, icone } = PASSOS[passo]
  const ultimo = passo === PASSOS.length - 1

  function mudar<K extends keyof Curriculo>(campo: K, valor: Curriculo[K]) {
    setDados({ ...dados, [campo]: valor })
    setErro(undefined)
  }

  function adicionarArea() {
    const area = novaArea.trim()
    if (!area) return
    if (dados.areas_interesse.length >= 3) return setErro('No máximo 3 áreas.')
    if (!dados.areas_interesse.some((a) => a.toLowerCase() === area.toLowerCase()))
      mudar('areas_interesse', [...dados.areas_interesse, area])
    setNovaArea('')
  }

  function adicionarExperiencia() {
    if (!novaExp.o_que_fazia.trim() || !novaExp.onde.trim()) return setErro('Diga o que fazia e onde.')
    mudar('experiencias', [...dados.experiencias, novaExp])
    setNovaExp({ o_que_fazia: '', onde: '', quanto_tempo: '' })
  }

  function conferir() {
    if (chave === 'data_nascimento' && !dados.data_nascimento) return 'Coloque a data em que você nasceu.'
    if (chave === 'bairro' && !dados.bairro.trim()) return 'Diga o bairro onde você mora.'
    if (chave === 'escolaridade' && !dados.escolaridade) return 'Escolha uma opção.'
    if (chave === 'areas_interesse' && dados.areas_interesse.length === 0)
      return novaArea.trim() ? 'Toque em “Adicionar” para incluir a área.' : 'Escreva pelo menos uma área.'
    if (chave === 'tem_cnh' && dados.tem_cnh && !dados.categoria_cnh.trim()) return 'Qual a categoria? Ex.: B'
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
    try {
      const salvo = await api<Curriculo>('/curriculo/', { method: 'PUT', body: dados })
      queryClient.setQueryData(['curriculo'], salvo)
      navigate(params.get('depois') ?? '/curriculo')
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

  return (
    <Tela titulo="Meu currículo" subtitulo="Responda com calma" icone={icone} voltarPara={passo === 0 ? '/curriculo' : undefined}>
      <Progresso passo={passo + 1} total={PASSOS.length} />
      <form onSubmit={avancar} className="flex flex-col gap-6" noValidate>
        {chave === 'data_nascimento' && (
          <Campo
            rotulo="Quando você nasceu?"
            type="date"
            value={dados.data_nascimento}
            onChange={(e) => mudar('data_nascimento', e.target.value)}
            erro={erro}
            autoFocus
          />
        )}
        {chave === 'bairro' && (
          <CampoSugestoes
            campo="bairro"
            rotulo="Em qual bairro você mora?"
            dica="Ajuda a achar vagas perto de você."
            value={dados.bairro}
            onChange={(e) => mudar('bairro', e.target.value)}
            erro={erro}
            autoFocus
          />
        )}
        {chave === 'escolaridade' && (
          <Escolhas
            rotulo="Até onde você estudou?"
            opcoes={ESCOLARIDADES}
            valor={dados.escolaridade}
            onChange={(v) => mudar('escolaridade', v)}
            erro={erro}
          />
        )}
        {chave === 'areas_interesse' && (
          <div className="flex flex-col gap-4">
            <CampoSugestoes
              campo="area"
              rotulo="Em que você quer trabalhar?"
              dica="Escreva até 3 áreas. Ex.: cozinha, limpeza, comércio."
              value={novaArea}
              onChange={(e) => setNovaArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  adicionarArea()
                }
              }}
              erro={erro}
              autoFocus
            />
            <Button type="button" variant="outline" onClick={adicionarArea} disabled={dados.areas_interesse.length >= 3}>
              <Plus /> Adicionar
            </Button>
            {dados.areas_interesse.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {dados.areas_interesse.map((area) => (
                  <li key={area}>
                    <button
                      type="button"
                      onClick={() => mudar('areas_interesse', dados.areas_interesse.filter((a) => a !== area))}
                      className="bg-primary-soft text-primary inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-lg font-bold"
                      aria-label={`Tirar ${area}`}
                    >
                      {area} <X className="size-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {chave === 'experiencias' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold">Já trabalhou antes?</h2>
              <p className="text-muted-foreground text-base">Pode pular se for o primeiro emprego. Até 3 trabalhos.</p>
            </div>
            {dados.experiencias.map((exp, i) => (
              <div key={i} className="bg-muted flex items-start justify-between gap-3 rounded-2xl p-4">
                <div>
                  <p className="text-lg font-bold">{exp.o_que_fazia}</p>
                  <p className="text-muted-foreground">
                    {exp.onde}
                    {exp.quanto_tempo && ` · ${exp.quanto_tempo}`}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Tirar experiência"
                  onClick={() => mudar('experiencias', dados.experiencias.filter((_, j) => j !== i))}
                  className="text-destructive grid size-11 place-items-center rounded-xl hover:bg-white"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            ))}
            {dados.experiencias.length < 3 && (
              <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed p-4">
                <Campo
                  rotulo="O que você fazia?"
                  placeholder="Ex.: ajudante de cozinha"
                  value={novaExp.o_que_fazia}
                  onChange={(e) => setNovaExp({ ...novaExp, o_que_fazia: e.target.value })}
                />
                <Campo
                  rotulo="Onde?"
                  placeholder="Nome do lugar"
                  value={novaExp.onde}
                  onChange={(e) => setNovaExp({ ...novaExp, onde: e.target.value })}
                />
                <Campo
                  rotulo="Por quanto tempo?"
                  placeholder="Ex.: 2 anos"
                  value={novaExp.quanto_tempo}
                  onChange={(e) => setNovaExp({ ...novaExp, quanto_tempo: e.target.value })}
                  erro={erro}
                />
                <Button type="button" variant="outline" onClick={adicionarExperiencia}>
                  <Plus /> Adicionar trabalho
                </Button>
              </div>
            )}
          </div>
        )}
        {chave === 'tem_cnh' && (
          <div className="flex flex-col gap-4">
            <Escolhas
              rotulo="Você tem carteira de motorista?"
              opcoes={[
                { valor: 'sim', nome: 'Sim' },
                { valor: 'nao', nome: 'Não' },
              ]}
              colunas={2}
              valor={dados.tem_cnh ? 'sim' : 'nao'}
              onChange={(v) => mudar('tem_cnh', v === 'sim')}
            />
            {dados.tem_cnh && (
              <Campo
                rotulo="Qual a categoria?"
                placeholder="Ex.: B"
                maxLength={5}
                value={dados.categoria_cnh}
                onChange={(e) => mudar('categoria_cnh', e.target.value.toUpperCase())}
                erro={erro}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={salvando}>
            {ultimo ? (salvando ? 'Salvando...' : 'Salvar currículo') : chave === 'experiencias' && dados.experiencias.length === 0 ? 'Pular' : 'Continuar'}
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
