import { ArrowRight, Building2, ClipboardCheck, FileText, Heart, type LucideIcon, Megaphone } from 'lucide-react'

import { Bolhas, IlustracaoCidade } from '@/components/ilustracoes'
import { Button } from '@/components/ui/button'
import { estiloDaArea } from '@/lib/areas'
import { useNumeros } from '@/lib/painel'
import { useUsuario } from '@/lib/usuario'
import { cn } from '@/lib/utils'

function Cartao({ icone: Icone, valor, nome, detalhe, cor }: { icone: LucideIcon; valor?: number; nome: string; detalhe?: string; cor: string }) {
  return (
    <div className="bg-card flex items-center gap-4 rounded-3xl p-5 shadow-sm ring-1 ring-black/5">
      <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl', cor)}>
        <Icone className="size-7" />
      </span>
      <div>
        <p className="text-3xl font-extrabold tabular-nums">{valor ?? '–'}</p>
        <p className="text-muted-foreground font-semibold">{nome}</p>
        {detalhe && <p className="text-muted-foreground text-sm">{detalhe}</p>}
      </div>
    </div>
  )
}

export default function PainelInicio() {
  const { data: usuario } = useUsuario()
  const { data: numeros } = useNumeros()
  const maior = Math.max(1, ...(numeros?.por_area ?? []).flatMap((l) => [l.vagas, l.curriculos]))

  return (
    <div className="flex flex-col gap-6">
      <section className="from-primary relative flex items-center overflow-hidden rounded-[2rem] bg-linear-to-br to-[oklch(0.4_0.17_270)] text-white">
        <Bolhas className="absolute inset-0 size-full" />
        <div className="relative flex-1 space-y-4 p-8">
          <p className="font-semibold text-white/80">Olá, {usuario?.nome.split(' ')[0]}</p>
          {numeros && numeros.pendentes > 0 ? (
            <>
              <h1 className="text-4xl leading-tight font-extrabold tracking-tight">
                <span className="text-accent">{numeros.pendentes}</span>{' '}
                {numeros.pendentes === 1 ? 'vaga esperando' : 'vagas esperando'} aprovação
              </h1>
              <p className="max-w-md text-lg text-white/85">Confira se o anúncio é verdadeiro antes de publicar.</p>
              <Button asLink="/prefeitura/vagas" variant="accent">
                Ver vagas para aprovar <ArrowRight />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-4xl leading-tight font-extrabold tracking-tight">Tudo em dia por aqui</h1>
              <p className="max-w-md text-lg text-white/85">Nenhuma vaga esperando aprovação no momento.</p>
            </>
          )}
        </div>
        <IlustracaoCidade className="relative hidden w-[26rem] shrink-0 self-end lg:block" />
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Cartao
          icone={Megaphone}
          valor={numeros?.vagas_abertas}
          nome="vagas no ar"
          detalhe={numeros ? `${numeros.postos_abertos} postos` : undefined}
          cor="bg-primary-soft text-primary"
        />
        <Cartao icone={FileText} valor={numeros?.curriculos} nome="currículos" cor="bg-leaf-soft text-[oklch(0.45_0.12_155)]" />
        <Cartao icone={Heart} valor={numeros?.interesses} nome="interesses" cor="bg-coral-soft text-coral" />
        <Cartao icone={Building2} valor={numeros?.empresas} nome="empresas" cor="bg-accent-soft text-[oklch(0.5_0.13_65)]" />
      </section>

      <section className="bg-card rounded-3xl p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">Por área de trabalho</h2>
            <p className="text-muted-foreground text-sm">Compare quantas vagas abertas há e quantas pessoas procuram cada área.</p>
          </div>
          <div className="flex gap-4 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <span className="bg-primary size-3 rounded-full" /> Postos abertos
            </span>
            <span className="flex items-center gap-2">
              <span className="bg-leaf size-3 rounded-full" /> Currículos
            </span>
          </div>
        </div>
        {numeros && numeros.por_area.length === 0 && (
          <p className="text-muted-foreground py-6 text-center">Ainda não há vagas nem currículos.</p>
        )}
        <ul className="flex flex-col gap-4">
          {numeros?.por_area.map((linha) => {
            const { icone: Icone, cor } = estiloDaArea(linha.area)
            return (
              <li key={linha.area} className="grid grid-cols-[12rem_1fr_auto] items-center gap-4">
                <span className="flex items-center gap-3 font-bold">
                  <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', cor)}>
                    <Icone className="size-5" />
                  </span>
                  <span className="truncate">{linha.area}</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="bg-primary h-3 rounded-full" style={{ width: `${(linha.vagas / maior) * 100}%`, minWidth: linha.vagas ? 8 : 0 }} />
                  <div className="bg-leaf h-3 rounded-full" style={{ width: `${(linha.curriculos / maior) * 100}%`, minWidth: linha.curriculos ? 8 : 0 }} />
                </div>
                <span className="text-muted-foreground w-80 text-right text-sm tabular-nums">
                  <strong className="text-foreground">{linha.vagas}</strong> postos ·{' '}
                  <strong className="text-foreground">{linha.curriculos}</strong> currículos ·{' '}
                  <strong className="text-coral">{linha.interesses}</strong> interesses
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <ClipboardCheck className="size-4" /> Cada aprovação e recusa fica registrada com o nome de quem decidiu.
      </p>
    </div>
  )
}
