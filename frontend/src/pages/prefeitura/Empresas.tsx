import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Building2, ListChecks, MessageCircle, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { api, type Paginado } from '@/lib/api'
import { linkWhatsApp } from '@/lib/opcoes'
import { type EmpresaPainel, formatarCnpj, formatarTelefone } from '@/lib/painel'
import { cn } from '@/lib/utils'

import { Cabecalho } from './Layout'

export default function Empresas() {
  const [busca, setBusca] = useState('')
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['painel', 'empresas', busca],
    queryFn: () => api<Paginado<EmpresaPainel>>(`/painel/empresas/?busca=${encodeURIComponent(busca)}`),
    placeholderData: (anterior) => anterior,
  })
  const bloquear = useMutation({
    mutationFn: ({ id, bloqueada }: { id: number; bloqueada: boolean }) =>
      api(`/painel/empresas/${id}/bloquear/`, { method: 'POST', body: { bloqueada } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel'] }),
  })

  return (
    <>
      <Cabecalho titulo="Empresas" texto="Quem cadastrou vagas. Bloqueie quem estiver agindo de má-fé.">
        <label className="bg-card focus-within:ring-primary flex w-80 items-center gap-2 rounded-2xl px-4 shadow-sm ring-1 ring-black/10 focus-within:ring-2">
          <Search className="text-muted-foreground size-5" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nome ou CNPJ"
            className="min-h-12 flex-1 bg-transparent outline-none"
          />
        </label>
      </Cabecalho>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        {data?.results.map((empresa) => (
          <article
            key={empresa.id}
            className={cn('bg-card flex flex-col gap-4 rounded-3xl p-5 shadow-sm ring-1 ring-black/5', empresa.bloqueada && 'opacity-80 ring-coral/40')}
          >
            <div className="flex items-start gap-4">
              <span
                className={cn(
                  'grid size-14 shrink-0 place-items-center rounded-2xl',
                  empresa.bloqueada ? 'bg-coral-soft text-coral' : 'bg-accent-soft text-[oklch(0.5_0.13_65)]',
                )}
              >
                {empresa.bloqueada ? <Ban className="size-7" /> : <Building2 className="size-7" />}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-extrabold">{empresa.nome}</h2>
                <p className="text-muted-foreground text-sm">CNPJ {formatarCnpj(empresa.documento)}</p>
                <a
                  href={linkWhatsApp(empresa.telefone, 'Olá! Aqui é da prefeitura, sobre o MeuEmprego.')}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[oklch(0.45_0.12_155)] inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
                >
                  <MessageCircle className="size-4" /> {formatarTelefone(empresa.telefone)}
                </a>
              </div>
              {empresa.bloqueada ? (
                <span className="bg-coral-soft text-[oklch(0.5_0.16_25)] rounded-full px-3 py-1 text-sm font-bold">Bloqueada</span>
              ) : (
                <span className="bg-leaf-soft text-[oklch(0.4_0.12_155)] rounded-full px-3 py-1 text-sm font-bold">Ativa</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <p className="flex-1 whitespace-nowrap">
                <strong className="text-lg">{empresa.vagas_abertas}</strong> de {empresa.vagas_total} vagas no ar
              </p>
              <Button size="sm" variant="outline" className="whitespace-nowrap" asLink={`/prefeitura/vagas?status=&empresa=${empresa.id}`}>
                <ListChecks /> Ver vagas
              </Button>
              {empresa.bloqueada ? (
                <Button size="sm" variant="ghost" disabled={bloquear.isPending} onClick={() => bloquear.mutate({ id: empresa.id, bloqueada: false })}>
                  <ShieldCheck /> Desbloquear
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[oklch(0.5_0.16_25)]"
                  disabled={bloquear.isPending}
                  onClick={() => {
                    if (confirm(`Bloquear ${empresa.nome}? Ela não entra mais e as vagas dela saem do ar.`))
                      bloquear.mutate({ id: empresa.id, bloqueada: true })
                  }}
                >
                  <Ban /> Bloquear
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      {data && data.results.length === 0 && <p className="text-muted-foreground py-10 text-center">Nenhuma empresa encontrada.</p>}
    </>
  )
}
