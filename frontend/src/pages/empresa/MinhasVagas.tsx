import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Briefcase, CheckCircle2, Clock, Hourglass, Pencil, Plus, Users, XCircle } from 'lucide-react'

import { ApagarConta } from '@/components/ApagarConta'
import { AreaLogada, Vazio } from '@/components/AreaLogada'
import { Button } from '@/components/ui/button'
import { api, type StatusVaga, type VagaEmpresa } from '@/lib/api'
import { estiloDaArea } from '@/lib/areas'
import { formatarSalario } from '@/lib/opcoes'
import { useUsuario } from '@/lib/usuario'
import { cn } from '@/lib/utils'

const STATUS: Record<StatusVaga, { nome: string; cor: string; icone: typeof Clock }> = {
  pendente: { nome: 'Aguardando aprovação', cor: 'bg-accent-soft text-[oklch(0.45_0.12_65)]', icone: Hourglass },
  aprovada: { nome: 'Publicada', cor: 'bg-leaf-soft text-[oklch(0.4_0.11_155)]', icone: CheckCircle2 },
  recusada: { nome: 'Recusada', cor: 'bg-coral-soft text-coral', icone: XCircle },
  encerrada: { nome: 'Encerrada', cor: 'bg-muted text-muted-foreground', icone: XCircle },
}

export default function MinhasVagas() {
  const { data: usuario } = useUsuario()
  const queryClient = useQueryClient()
  const { data: vagas, isLoading } = useQuery({ queryKey: ['minhas-vagas'], queryFn: () => api<VagaEmpresa[]>('/minhas-vagas/') })
  const encerrar = useMutation({
    mutationFn: (id: number) => api(`/minhas-vagas/${id}/encerrar/`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['minhas-vagas'] }),
  })

  const abertas = vagas?.filter((v) => v.status !== 'encerrada').length ?? 0
  const interessados = vagas?.reduce((total, v) => total + v.interessados, 0) ?? 0

  return (
    <AreaLogada
      usuario={usuario}
      titulo="Minhas vagas"
      subtitulo={usuario?.nome}
      topo={
        vagas && vagas.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-3xl font-extrabold">{abertas}</p>
              <p className="text-white/85">{abertas === 1 ? 'vaga aberta' : 'vagas abertas'}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-accent text-3xl font-extrabold">{interessados}</p>
              <p className="text-white/85">{interessados === 1 ? 'interessado' : 'interessados'}</p>
            </div>
          </div>
        ) : undefined
      }
    >
      {isLoading ? null : vagas && vagas.length > 0 ? (
        <>
          <Button asLink="/empresa/nova" size="lg" variant="accent" className="shadow-lg shadow-amber-500/20">
            <Plus /> Cadastrar nova vaga
          </Button>
          {vagas.map((vaga) => {
            const { icone: Icone, cor } = estiloDaArea(vaga.area)
            const status = STATUS[vaga.status]
            const IconeStatus = status.icone
            return (
              <article key={vaga.id} className="bg-card flex flex-col gap-4 rounded-3xl p-4 shadow-sm ring-1 ring-black/5">
                <div className="flex items-start gap-3">
                  <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl', cor)}>
                    <Icone className="size-7" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg leading-tight font-extrabold">{vaga.cargo}</h2>
                    <p className="text-muted-foreground">
                      {formatarSalario(vaga.salario)} · {vaga.bairro}
                    </p>
                  </div>
                </div>
                <span className={cn('inline-flex items-center gap-2 self-start rounded-full px-3 py-1 font-bold', status.cor)}>
                  <IconeStatus className="size-5" /> {status.nome}
                </span>
                {vaga.status === 'recusada' && vaga.motivo_recusa && (
                  <p className="bg-coral-soft rounded-2xl p-3">
                    <strong>Motivo:</strong> {vaga.motivo_recusa.replace(/\.$/, '')}. Toque em “Mudar” para corrigir e mandar de novo.
                  </p>
                )}
                {vaga.status !== 'encerrada' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button asLink={`/empresa/vagas/${vaga.id}/interessados`} size="sm" className="col-span-2">
                      <Users /> {vaga.interessados} {vaga.interessados === 1 ? 'interessado' : 'interessados'}
                    </Button>
                    <Button asLink={`/empresa/vagas/${vaga.id}/editar`} size="sm" variant="outline">
                      <Pencil /> Mudar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={encerrar.isPending}
                      onClick={() => {
                        if (confirm('Encerrar esta vaga? Ela some da lista de vagas.')) encerrar.mutate(vaga.id)
                      }}
                    >
                      Encerrar
                    </Button>
                  </div>
                )}
              </article>
            )
          })}
        </>
      ) : (
        <Vazio
          icone={Briefcase}
          titulo="Cadastre sua primeira vaga"
          texto="Leva poucos minutos. A prefeitura confere e publica para quem procura emprego."
          acao={
            <Button asLink="/empresa/nova" variant="accent">
              <Plus /> Nova vaga
            </Button>
          }
        />
      )}
      {!isLoading && <ApagarConta texto="A empresa, todas as vagas e a lista de interessados serão apagadas." />}
    </AreaLogada>
  )
}
