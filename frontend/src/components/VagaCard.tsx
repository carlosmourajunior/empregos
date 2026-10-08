import { Clock, Heart, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Vaga } from '@/lib/api'
import { estiloDaArea } from '@/lib/areas'
import { formatarSalario } from '@/lib/opcoes'
import { cn } from '@/lib/utils'

export function VagaCard({ vaga }: { vaga: Vaga }) {
  const { icone: Icone, cor } = estiloDaArea(vaga.area)
  return (
    <Link
      to={`/vagas/${vaga.id}`}
      className="bg-card hover:ring-primary flex flex-col gap-3 rounded-3xl p-4 shadow-sm ring-1 ring-black/5 transition"
    >
      <div className="flex items-start gap-3">
        <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl', cor)}>
          <Icone className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-tight font-extrabold">{vaga.cargo}</h3>
          <p className="text-muted-foreground truncate text-base">{vaga.empresa}</p>
        </div>
        {vaga.tenho_interesse && (
          <span className="bg-coral-soft text-coral grid size-9 place-items-center rounded-full" title="Você tem interesse">
            <Heart className="size-5 fill-current" />
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="bg-leaf-soft rounded-full px-3 py-1 text-[oklch(0.4_0.11_155)]">{formatarSalario(vaga.salario)}</span>
        <span className="bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1">
          <MapPin className="size-4" /> {vaga.bairro}
        </span>
        <span className="bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1">
          <Clock className="size-4" /> {vaga.horario_nome}
        </span>
        {vaga.quantidade > 1 && (
          <span className="bg-muted inline-flex items-center gap-1 rounded-full px-3 py-1">
            <Users className="size-4" /> {vaga.quantidade} vagas
          </span>
        )}
      </div>
    </Link>
  )
}
