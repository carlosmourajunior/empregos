import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Search,
  ShieldAlert,
  Users,
  Wallet,
  X,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { IlustracaoTudoEmDia } from '@/components/ilustracoes'
import { Button } from '@/components/ui/button'
import { api, ApiError, type StatusVaga } from '@/lib/api'
import { estiloDaArea } from '@/lib/areas'
import { formatarSalario, linkWhatsApp } from '@/lib/opcoes'
import {
  formatarCnpj,
  formatarData,
  formatarTelefone,
  haQuanto,
  useVagasPainel,
  type VagaPainel,
} from '@/lib/painel'
import { cn } from '@/lib/utils'

import { Cabecalho } from './Layout'

const ABAS: { status: StatusVaga | ''; nome: string }[] = [
  { status: 'pendente', nome: 'Esperando aprovação' },
  { status: 'aprovada', nome: 'Publicadas' },
  { status: 'recusada', nome: 'Recusadas' },
  { status: 'encerrada', nome: 'Encerradas' },
  { status: '', nome: 'Todas' },
]

const COR_STATUS: Record<StatusVaga, string> = {
  pendente: 'bg-accent-soft text-[oklch(0.45_0.12_65)]',
  aprovada: 'bg-leaf-soft text-[oklch(0.4_0.12_155)]',
  recusada: 'bg-coral-soft text-[oklch(0.5_0.16_25)]',
  encerrada: 'bg-muted text-muted-foreground',
}

const MOTIVOS = [
  'Salário abaixo do mínimo',
  'Faltam informações sobre o trabalho',
  'Parece anúncio falso',
  'Vaga repetida',
  'Pede pagamento do candidato',
]

export default function AprovarVagas() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? 'pendente'
  const empresa = params.get('empresa') ?? ''
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [selecionadas, setSelecionadas] = useState<number[]>([])
  const [aberta, setAberta] = useState<VagaPainel | null>(null)
  const [recusando, setRecusando] = useState<number[] | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useVagasPainel({ status, busca, empresa, pagina })
  const vagas = data?.results ?? []
  const totalPaginas = data ? Math.max(1, Math.ceil(data.count / 20)) : 1

  const avaliar = useMutation({
    mutationFn: (corpo: { ids: number[]; decisao: 'aprovar' | 'recusar'; motivo?: string }) =>
      api<{ alteradas: number }>('/painel/vagas/avaliar/', { method: 'POST', body: corpo }),
    onSuccess: (_, corpo) => {
      setSelecionadas((atual) => atual.filter((id) => !corpo.ids.includes(id)))
      setAberta(null)
      setRecusando(null)
      queryClient.invalidateQueries({ queryKey: ['painel'] })
    },
  })

  function trocarAba(novo: string) {
    const proximo = new URLSearchParams(params)
    proximo.set('status', novo)
    setParams(proximo)
    setPagina(1)
    setSelecionadas([])
  }

  const todasMarcadas = vagas.length > 0 && vagas.every((v) => selecionadas.includes(v.id))
  const podeAvaliar = (v: VagaPainel) => v.status !== 'encerrada'

  return (
    <>
      <Cabecalho titulo="Aprovar vagas" texto="Confira cada anúncio antes de ele aparecer para o público.">
        <label className="bg-card focus-within:ring-primary flex w-80 items-center gap-2 rounded-2xl px-4 shadow-sm ring-1 ring-black/10 focus-within:ring-2">
          <Search className="text-muted-foreground size-5" />
          <input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPagina(1)
            }}
            placeholder="Buscar cargo, área ou empresa"
            className="min-h-12 flex-1 bg-transparent outline-none"
          />
        </label>
      </Cabecalho>

      {empresa && (
        <p className="bg-primary-soft mb-4 flex items-center justify-between rounded-2xl px-4 py-3 font-semibold">
          Mostrando só as vagas de uma empresa.
          <button
            className="text-primary font-bold underline"
            onClick={() => {
              const proximo = new URLSearchParams(params)
              proximo.delete('empresa')
              setParams(proximo)
            }}
          >
            Ver todas as empresas
          </button>
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {ABAS.map((aba) => (
          <button
            key={aba.nome}
            onClick={() => trocarAba(aba.status)}
            className={cn(
              'rounded-full px-4 py-2 font-bold transition-colors',
              status === aba.status ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card ring-1 ring-black/10 hover:bg-muted',
            )}
          >
            {aba.nome}
          </button>
        ))}
      </div>

      {selecionadas.length > 0 && (
        <div className="bg-foreground text-background sticky top-4 z-10 mb-4 flex items-center gap-3 rounded-2xl px-5 py-3 shadow-lg">
          <span className="flex-1 font-bold">
            {selecionadas.length} {selecionadas.length === 1 ? 'vaga marcada' : 'vagas marcadas'}
          </span>
          <Button size="sm" className="bg-leaf hover:bg-leaf/90 text-white" disabled={avaliar.isPending} onClick={() => avaliar.mutate({ ids: selecionadas, decisao: 'aprovar' })}>
            <Check /> Aprovar todas
          </Button>
          <Button size="sm" variant="ghost" className="hover:bg-white/10" onClick={() => setRecusando(selecionadas)}>
            <XCircle /> Recusar
          </Button>
          <button onClick={() => setSelecionadas([])} className="rounded-xl p-2 hover:bg-white/10" aria-label="Desmarcar">
            <X className="size-5" />
          </button>
        </div>
      )}

      {!isLoading && vagas.length === 0 ? (
        <div className="bg-card flex flex-col items-center gap-2 rounded-3xl py-12 text-center shadow-sm ring-1 ring-black/5">
          <IlustracaoTudoEmDia className="w-56" />
          <h2 className="text-2xl font-extrabold">{status === 'pendente' && !busca ? 'Nenhuma vaga esperando' : 'Nada encontrado'}</h2>
          <p className="text-muted-foreground">
            {status === 'pendente' && !busca ? 'Quando uma empresa cadastrar uma vaga, ela aparece aqui.' : 'Tente outra busca ou outra aba.'}
          </p>
        </div>
      ) : (
        <div className="bg-card overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5">
          <table className="w-full text-left">
            <thead className="bg-muted/60 text-muted-foreground text-sm">
              <tr>
                <th className="w-12 py-3 pl-5">
                  <input
                    type="checkbox"
                    className="accent-primary size-5"
                    aria-label="Marcar todas"
                    checked={todasMarcadas}
                    onChange={() => setSelecionadas(todasMarcadas ? [] : vagas.filter(podeAvaliar).map((v) => v.id))}
                  />
                </th>
                <th className="py-3 font-bold">Vaga</th>
                <th className="py-3 font-bold">Empresa</th>
                <th className="py-3 font-bold">Salário</th>
                <th className="py-3 font-bold">Situação</th>
                <th className="py-3 pr-5 text-right font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vagas.map((vaga) => {
                const { icone: Icone, cor } = estiloDaArea(vaga.area)
                return (
                  <tr
                    key={vaga.id}
                    onClick={() => setAberta(vaga)}
                    className={cn('hover:bg-primary-soft/40 cursor-pointer border-t', aberta?.id === vaga.id && 'bg-primary-soft/60')}
                  >
                    <td className="py-4 pl-5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="accent-primary size-5"
                        aria-label={`Marcar ${vaga.cargo}`}
                        disabled={!podeAvaliar(vaga)}
                        checked={selecionadas.includes(vaga.id)}
                        onChange={() =>
                          setSelecionadas((atual) => (atual.includes(vaga.id) ? atual.filter((id) => id !== vaga.id) : [...atual, vaga.id]))
                        }
                      />
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', cor)}>
                          <Icone className="size-5" />
                        </span>
                        <div>
                          <p className="font-bold">{vaga.cargo}</p>
                          <p className="text-muted-foreground text-sm">
                            {vaga.area} · {vaga.bairro} · {haQuanto(vaga.criada_em)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="flex items-center gap-1.5 font-semibold">
                        {vaga.empresa}
                        {vaga.empresa_bloqueada && <Ban className="text-coral size-4" aria-label="Empresa bloqueada" />}
                      </p>
                      <p className="text-muted-foreground text-sm">{formatarCnpj(vaga.empresa_cnpj)}</p>
                    </td>
                    <td className="py-4 font-semibold tabular-nums">{formatarSalario(vaga.salario)}</td>
                    <td className="py-4">
                      <span className={cn('rounded-full px-3 py-1 text-sm font-bold whitespace-nowrap', COR_STATUS[vaga.status])}>
                        {vaga.status_nome}
                      </span>
                    </td>
                    <td className="py-4 pr-5" onClick={(e) => e.stopPropagation()}>
                      {podeAvaliar(vaga) && (
                        <div className="flex justify-end gap-2">
                          {vaga.status !== 'aprovada' && (
                            <button
                              title="Aprovar"
                              aria-label={`Aprovar ${vaga.cargo}`}
                              disabled={avaliar.isPending}
                              onClick={() => avaliar.mutate({ ids: [vaga.id], decisao: 'aprovar' })}
                              className="bg-leaf-soft text-[oklch(0.4_0.12_155)] hover:bg-leaf grid size-10 place-items-center rounded-xl hover:text-white"
                            >
                              <Check className="size-5" />
                            </button>
                          )}
                          {vaga.status !== 'recusada' && (
                            <button
                              title="Recusar"
                              aria-label={`Recusar ${vaga.cargo}`}
                              onClick={() => setRecusando([vaga.id])}
                              className="bg-coral-soft text-[oklch(0.5_0.16_25)] hover:bg-coral grid size-10 place-items-center rounded-xl hover:text-white"
                            >
                              <X className="size-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {totalPaginas > 1 && (
            <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
              <span className="text-muted-foreground text-sm">
                Página {pagina} de {totalPaginas}
              </span>
              <Button size="sm" variant="outline" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)} aria-label="Página anterior">
                <ChevronLeft />
              </Button>
              <Button size="sm" variant="outline" disabled={pagina === totalPaginas} onClick={() => setPagina(pagina + 1)} aria-label="Próxima página">
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      )}

      {aberta && (
        <Detalhe
          vaga={aberta}
          ocupado={avaliar.isPending}
          onFechar={() => setAberta(null)}
          onAprovar={() => avaliar.mutate({ ids: [aberta.id], decisao: 'aprovar' })}
          onRecusar={() => setRecusando([aberta.id])}
        />
      )}
      {recusando && (
        <Recusar
          quantidade={recusando.length}
          erro={avaliar.error}
          ocupado={avaliar.isPending}
          onFechar={() => {
            setRecusando(null)
            avaliar.reset()
          }}
          onConfirmar={(motivo) => avaliar.mutate({ ids: recusando, decisao: 'recusar', motivo })}
        />
      )}
    </>
  )
}

function Detalhe({
  vaga,
  ocupado,
  onFechar,
  onAprovar,
  onRecusar,
}: {
  vaga: VagaPainel
  ocupado: boolean
  onFechar: () => void
  onAprovar: () => void
  onRecusar: () => void
}) {
  const { icone: Icone, cor } = estiloDaArea(vaga.area)
  const itens = [
    { icone: Wallet, nome: 'Salário', valor: formatarSalario(vaga.salario) },
    { icone: Clock, nome: 'Contrato e horário', valor: `${vaga.contrato_nome} · ${vaga.horario_nome}` },
    { icone: MapPin, nome: 'Bairro', valor: vaga.bairro },
    { icone: Users, nome: 'Vagas', valor: `${vaga.quantidade} · ${vaga.interessados} interessados` },
  ]
  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/30" onClick={onFechar}>
      <aside
        className="bg-background flex h-full w-[32rem] flex-col overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        aria-label="Detalhes da vaga"
      >
        <div className="flex items-start gap-4 border-b p-6">
          <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl', cor)}>
            <Icone className="size-7" />
          </span>
          <div className="flex-1">
            <h2 className="text-2xl leading-tight font-extrabold">{vaga.cargo}</h2>
            <p className="text-muted-foreground">
              {vaga.area} · cadastrada em {formatarData(vaga.criada_em)}
            </p>
          </div>
          <button onClick={onFechar} className="hover:bg-muted rounded-xl p-2" aria-label="Fechar">
            <X className="size-6" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-6">
          <section>
            <h3 className="text-muted-foreground mb-1 text-sm font-bold">O que vai fazer</h3>
            <p className="text-lg">{vaga.descricao}</p>
          </section>
          <ul className="grid grid-cols-2 gap-3">
            {itens.map(({ icone: I, nome, valor }) => (
              <li key={nome} className="bg-card flex gap-3 rounded-2xl p-3 ring-1 ring-black/5">
                <I className="text-primary mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">{nome}</p>
                  <p className="font-bold">{valor}</p>
                </div>
              </li>
            ))}
          </ul>
          <section className="bg-card rounded-2xl p-4 ring-1 ring-black/5">
            <h3 className="text-muted-foreground mb-2 text-sm font-bold">Empresa</h3>
            <p className="text-lg font-bold">{vaga.empresa}</p>
            <p className="text-muted-foreground">CNPJ {formatarCnpj(vaga.empresa_cnpj)}</p>
            {vaga.empresa_bloqueada && (
              <p className="text-coral mt-2 flex items-center gap-2 font-bold">
                <ShieldAlert className="size-5" /> Empresa bloqueada
              </p>
            )}
            <a
              href={linkWhatsApp(vaga.empresa_telefone, `Olá! Aqui é da prefeitura, sobre a vaga de ${vaga.cargo} no MeuEmprego.`)}
              target="_blank"
              rel="noreferrer"
              className="text-[oklch(0.45_0.12_155)] mt-3 inline-flex items-center gap-2 font-bold hover:underline"
            >
              <MessageCircle className="size-5" /> {formatarTelefone(vaga.empresa_telefone)}
            </a>
          </section>
          {vaga.avaliada_por && (
            <p className="text-muted-foreground text-sm">
              {vaga.status === 'recusada' ? 'Recusada' : 'Avaliada'} por <strong>{vaga.avaliada_por}</strong>
              {vaga.avaliada_em && ` em ${formatarData(vaga.avaliada_em)}`}
              {vaga.motivo_recusa && `. Motivo: ${vaga.motivo_recusa}`}
            </p>
          )}
        </div>
        {vaga.status !== 'encerrada' && (
          <div className="bg-card flex gap-3 border-t p-5">
            {vaga.status !== 'recusada' && (
              <Button variant="outline" className="flex-1" onClick={onRecusar}>
                <X /> Recusar
              </Button>
            )}
            {vaga.status !== 'aprovada' && (
              <Button className="bg-leaf hover:bg-leaf/90 flex-1 text-white" disabled={ocupado} onClick={onAprovar}>
                <Check /> Aprovar
              </Button>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}

function Recusar({
  quantidade,
  erro,
  ocupado,
  onFechar,
  onConfirmar,
}: {
  quantidade: number
  erro: Error | null
  ocupado: boolean
  onFechar: () => void
  onConfirmar: (motivo: string) => void
}) {
  const [motivo, setMotivo] = useState('')
  const mensagem = erro instanceof ApiError ? String((erro.dados.motivo as string[] | undefined)?.[0] ?? erro.message) : erro?.message
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4" onClick={onFechar}>
      <form
        className="bg-card flex w-full max-w-lg flex-col gap-4 rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          onConfirmar(motivo)
        }}
      >
        <div className="flex items-center gap-3">
          <span className="bg-coral-soft text-coral grid size-12 place-items-center rounded-2xl">
            <XCircle className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">{quantidade === 1 ? 'Recusar vaga' : `Recusar ${quantidade} vagas`}</h2>
            <p className="text-muted-foreground text-sm">A empresa vê o motivo e pode corrigir.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOTIVOS.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMotivo(m)}
              className={cn('rounded-full px-3 py-1.5 text-sm font-semibold ring-1', motivo === m ? 'bg-primary-soft text-primary ring-primary' : 'ring-black/10 hover:bg-muted')}
            >
              {m}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1">
          <span className="font-bold">Motivo</span>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={200}
            rows={3}
            autoFocus
            className="focus:ring-primary rounded-2xl border-2 p-3 outline-none focus:ring-2"
            placeholder="Escreva com palavras simples"
          />
        </label>
        {mensagem && <p className="text-destructive font-semibold">{mensagem}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-coral hover:bg-coral/90 text-white" disabled={ocupado || !motivo.trim()}>
            Recusar
          </Button>
        </div>
      </form>
    </div>
  )
}
