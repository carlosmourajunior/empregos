import { useQuery } from '@tanstack/react-query'
import { MapPin, Search, SearchX, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AreaLogada, Vazio } from '@/components/AreaLogada'
import { VagaCard } from '@/components/VagaCard'
import { api, type Paginado, type Vaga } from '@/lib/api'
import { useSugestoes } from '@/lib/sugestoes'
import { useUsuario } from '@/lib/usuario'
import { cn } from '@/lib/utils'

export default function Vagas() {
  const { data: usuario } = useUsuario()
  const [params, setParams] = useSearchParams()
  const busca = params.get('busca') ?? ''
  const area = params.get('area') ?? ''
  const bairro = params.get('bairro') ?? ''
  const [texto, setTexto] = useState(busca)
  const areas = useSugestoes('area', '')

  const filtro = new URLSearchParams({ busca, area, bairro }).toString()
  const { data, isLoading } = useQuery({
    queryKey: ['vagas', filtro],
    queryFn: () => api<Paginado<Vaga>>(`/vagas/?${filtro}`),
  })

  function mudar(campo: string, valor: string) {
    const novos = new URLSearchParams(params)
    if (valor) novos.set(campo, valor)
    else novos.delete(campo)
    setParams(novos, { replace: true })
  }

  return (
    <AreaLogada
      usuario={usuario}
      titulo="Vagas abertas"
      subtitulo={data ? `${data.count} ${data.count === 1 ? 'vaga encontrada' : 'vagas encontradas'}` : ' '}
      topo={
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            mudar('busca', texto.trim())
          }}
          className="flex min-h-14 items-center gap-2 rounded-2xl bg-white px-4 text-[var(--foreground)] shadow-lg"
        >
          <Search className="text-muted-foreground size-6 shrink-0" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar: cozinha, pedreiro..."
            aria-label="Buscar vagas"
            className="min-w-0 flex-1 bg-transparent text-lg outline-none"
          />
          {texto && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => {
                setTexto('')
                mudar('busca', '')
              }}
            >
              <X className="text-muted-foreground size-6" />
            </button>
          )}
        </form>
      }
    >
      {areas.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por área">
          {['', ...areas].map((a) => (
            <button
              key={a || 'todas'}
              onClick={() => mudar('area', a)}
              className={cn(
                'min-h-11 shrink-0 rounded-full px-4 text-base font-bold whitespace-nowrap ring-1 transition',
                area.toLowerCase() === a.toLowerCase()
                  ? 'bg-primary text-primary-foreground ring-primary'
                  : 'bg-card ring-border hover:bg-muted',
              )}
            >
              {a || 'Todas'}
            </button>
          ))}
        </div>
      )}

      {bairro && (
        <button
          onClick={() => mudar('bairro', '')}
          className="bg-accent-soft inline-flex min-h-11 items-center gap-2 self-start rounded-full px-4 font-bold"
        >
          <MapPin className="size-5" /> {bairro} <X className="size-5" />
        </button>
      )}

      {isLoading ? (
        <p className="text-muted-foreground py-10 text-center text-lg">Carregando vagas...</p>
      ) : data && data.results.length > 0 ? (
        data.results.map((vaga) => <VagaCard key={vaga.id} vaga={vaga} />)
      ) : (
        <Vazio
          icone={SearchX}
          titulo="Nenhuma vaga por aqui"
          texto={busca || area || bairro ? 'Tente buscar outra palavra ou tirar os filtros.' : 'Novas vagas aparecem aqui assim que forem aprovadas.'}
        />
      )}
    </AreaLogada>
  )
}
