import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, CalendarClock, CheckCircle2, Clock, FileSignature, Heart, MapPin, Users, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AreaLogada } from '@/components/AreaLogada'
import { Button } from '@/components/ui/button'
import { api, ApiError, type Vaga } from '@/lib/api'
import { estiloDaArea } from '@/lib/areas'
import { formatarSalario } from '@/lib/opcoes'
import { useUsuario } from '@/lib/usuario'
import { cn } from '@/lib/utils'

function Info({ icone, rotulo, children }: { icone: ReactNode; rotulo: string; children: ReactNode }) {
  return (
    <div className="bg-muted flex items-center gap-3 rounded-2xl p-3">
      <span className="bg-card text-primary grid size-11 shrink-0 place-items-center rounded-xl">{icone}</span>
      <div>
        <p className="text-muted-foreground text-sm font-semibold">{rotulo}</p>
        <p className="text-lg font-bold">{children}</p>
      </div>
    </div>
  )
}

export default function VagaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: usuario } = useUsuario()
  const { data: vaga, isLoading } = useQuery({ queryKey: ['vaga', id], queryFn: () => api<Vaga>(`/vagas/${id}/`) })

  const interesse = useMutation({
    mutationFn: (quer: boolean) => api(`/vagas/${id}/interesse/`, { method: quer ? 'POST' : 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaga', id] })
      queryClient.invalidateQueries({ queryKey: ['vagas'] })
      queryClient.invalidateQueries({ queryKey: ['interesses'] })
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.dados.codigo === 'sem_curriculo') navigate(`/curriculo/editar?depois=/vagas/${id}`)
    },
  })

  if (isLoading) return null
  if (!vaga) {
    return (
      <AreaLogada usuario={usuario} titulo="Vaga não encontrada">
        <p className="text-lg">Essa vaga pode ter sido encerrada.</p>
        <Button asLink="/vagas">Ver outras vagas</Button>
      </AreaLogada>
    )
  }

  const { icone: Icone, cor } = estiloDaArea(vaga.area)
  const candidato = usuario?.tipo === 'candidato'

  return (
    <AreaLogada
      usuario={usuario}
      titulo={vaga.cargo}
      subtitulo={vaga.empresa}
      topo={
        <Link to="/vagas" className="-ml-2 inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 font-semibold hover:bg-white/10">
          <ArrowLeft className="size-5" /> Todas as vagas
        </Link>
      }
    >
      <section className="bg-card flex flex-col gap-4 rounded-3xl p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <span className={cn('grid size-16 place-items-center rounded-2xl', cor)}>
            <Icone className="size-8" />
          </span>
          <div>
            <p className="text-muted-foreground text-sm font-semibold">Área</p>
            <p className="text-xl font-extrabold">{vaga.area}</p>
          </div>
        </div>
        <div>
          <h2 className="mb-1 text-lg font-bold">O que vai fazer</h2>
          <p className="text-lg">{vaga.descricao}</p>
        </div>
      </section>

      <section className="grid gap-3">
        <Info icone={<Wallet className="size-6" />} rotulo="Salário">
          {formatarSalario(vaga.salario)}
        </Info>
        <Info icone={<FileSignature className="size-6" />} rotulo="Contrato">
          {vaga.contrato_nome}
        </Info>
        <Info icone={<Clock className="size-6" />} rotulo="Horário">
          {vaga.horario_nome}
        </Info>
        <Info icone={<MapPin className="size-6" />} rotulo="Bairro">
          {vaga.bairro}
        </Info>
        <Info icone={<Users className="size-6" />} rotulo="Vagas">
          {vaga.quantidade}
        </Info>
        <Info icone={<CalendarClock className="size-6" />} rotulo="Publicada em">
          {new Date(vaga.criada_em).toLocaleDateString('pt-BR')}
        </Info>
      </section>

      {vaga.tenho_interesse ? (
        <section className="bg-leaf-soft flex flex-col gap-3 rounded-3xl p-5">
          <p className="flex items-center gap-2 text-xl font-extrabold text-[oklch(0.4_0.11_155)]">
            <CheckCircle2 className="size-7" /> Interesse enviado!
          </p>
          <p className="text-lg">A empresa vai ver seu currículo e pode chamar você no WhatsApp.</p>
          <Button variant="ghost" onClick={() => interesse.mutate(false)} disabled={interesse.isPending}>
            Desistir desta vaga
          </Button>
        </section>
      ) : candidato ? (
        <Button size="lg" onClick={() => interesse.mutate(true)} disabled={interesse.isPending} className="shadow-primary/30 shadow-lg">
          <Heart /> Tenho interesse
        </Button>
      ) : !usuario ? (
        <div className="bg-accent-soft flex flex-col gap-3 rounded-3xl p-5">
          <p className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="size-6" /> Gostou da vaga?
          </p>
          <p className="text-lg">Crie sua conta para mostrar interesse. É rápido.</p>
          <Button asLink="/criar-conta?tipo=candidato">Criar conta</Button>
        </div>
      ) : null}
    </AreaLogada>
  )
}
