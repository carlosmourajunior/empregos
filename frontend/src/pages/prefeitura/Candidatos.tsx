import { Car, ChevronLeft, ChevronRight, GraduationCap, Heart, MapPin, MessageCircle, Pencil, Search, UserRound, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ESCOLARIDADES, linkWhatsApp } from '@/lib/opcoes'
import { type CandidatoPainel, formatarCpf, formatarData, formatarTelefone, useCandidatos } from '@/lib/painel'
import { cn } from '@/lib/utils'

import { EditarCandidato } from './Editar'
import { Cabecalho } from './Layout'

const nomeEscolaridade = (valor: string) => ESCOLARIDADES.find((e) => e.valor === valor)?.nome ?? valor

function idade(nascimento: string) {
  const hoje = new Date()
  const [ano, mes, dia] = nascimento.split('-').map(Number)
  return hoje.getFullYear() - ano - (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia) ? 1 : 0)
}

export default function Candidatos() {
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [aberto, setAberto] = useState<CandidatoPainel | null>(null)
  const [editando, setEditando] = useState<'conta' | 'curriculo' | null>(null)
  const { data, isLoading } = useCandidatos(busca, pagina)
  const candidatos = data?.results ?? []
  const totalPaginas = data ? Math.max(1, Math.ceil(data.count / 20)) : 1

  return (
    <>
      <Cabecalho titulo="Candidatos" texto="Quem procura emprego. Corrija os dados quando a pessoa pedir no balcão.">
        <label className="bg-card focus-within:ring-primary flex w-80 items-center gap-2 rounded-2xl px-4 shadow-sm ring-1 ring-black/10 focus-within:ring-2">
          <Search className="text-muted-foreground size-5" />
          <input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setPagina(1)
            }}
            placeholder="Nome, CPF, WhatsApp ou bairro"
            className="min-h-12 flex-1 bg-transparent outline-none"
          />
        </label>
      </Cabecalho>

      {!isLoading && candidatos.length === 0 ? (
        <p className="bg-card text-muted-foreground rounded-3xl py-12 text-center shadow-sm ring-1 ring-black/5">
          {busca ? 'Ninguém encontrado com essa busca.' : 'Nenhum candidato cadastrado ainda.'}
        </p>
      ) : (
        <div className="bg-card overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5">
          <table className="w-full text-left">
            <thead className="bg-muted/60 text-muted-foreground text-sm">
              <tr>
                <th className="py-3 pl-5 font-bold">Pessoa</th>
                <th className="py-3 font-bold">WhatsApp</th>
                <th className="py-3 font-bold">Bairro</th>
                <th className="py-3 font-bold">Áreas</th>
                <th className="py-3 pr-5 text-right font-bold">Interesses</th>
              </tr>
            </thead>
            <tbody>
              {candidatos.map((candidato) => (
                <tr
                  key={candidato.id}
                  onClick={() => setAberto(candidato)}
                  className={cn('hover:bg-primary-soft/40 cursor-pointer border-t', aberto?.id === candidato.id && 'bg-primary-soft/60')}
                >
                  <td className="py-4 pl-5">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary-soft text-primary grid size-11 shrink-0 place-items-center rounded-full font-extrabold">
                        {candidato.nome.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-bold">{candidato.nome}</p>
                        <p className="text-muted-foreground text-sm">CPF {formatarCpf(candidato.documento)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 whitespace-nowrap tabular-nums">{formatarTelefone(candidato.telefone)}</td>
                  <td className="py-4">{candidato.curriculo?.bairro ?? <span className="text-muted-foreground">Sem currículo</span>}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1">
                      {candidato.curriculo?.areas_interesse.map((area) => (
                        <span key={area} className="bg-muted rounded-full px-2.5 py-0.5 text-sm font-semibold">
                          {area}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 pr-5 text-right font-bold tabular-nums">{candidato.interesses}</td>
                </tr>
              ))}
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

      {aberto && <Detalhe candidato={aberto} onFechar={() => setAberto(null)} onEditar={(curriculo) => setEditando(curriculo ? 'curriculo' : 'conta')} />}
      {aberto && editando && (
        <EditarCandidato
          candidato={aberto}
          abrirCurriculo={editando === 'curriculo'}
          onFechar={() => setEditando(null)}
          onSalvo={(candidato) => {
            setAberto(candidato)
            setEditando(null)
          }}
        />
      )}
    </>
  )
}

function Detalhe({
  candidato,
  onFechar,
  onEditar,
}: {
  candidato: CandidatoPainel
  onFechar: () => void
  onEditar: (curriculo?: boolean) => void
}) {
  const cv = candidato.curriculo
  const itens = cv
    ? [
        { icone: MapPin, nome: 'Bairro', valor: cv.bairro },
        { icone: GraduationCap, nome: 'Estudo', valor: nomeEscolaridade(cv.escolaridade) },
        { icone: Car, nome: 'CNH', valor: cv.tem_cnh ? `Sim, ${cv.categoria_cnh || 'sem categoria'}` : 'Não tem' },
        { icone: Heart, nome: 'Interesses enviados', valor: String(candidato.interesses) },
      ]
    : []
  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/30" onClick={onFechar}>
      <aside className="bg-background flex h-full w-[32rem] flex-col overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()} aria-label="Dados do candidato">
        <div className="flex items-start gap-4 border-b p-6">
          <span className="bg-primary-soft text-primary grid size-14 shrink-0 place-items-center rounded-2xl">
            <UserRound className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl leading-tight font-extrabold">{candidato.nome}</h2>
            <p className="text-muted-foreground">
              {cv ? `${idade(cv.data_nascimento)} anos · ` : ''}desde {formatarData(candidato.criado_em)}
            </p>
          </div>
          <button onClick={() => onEditar()} className="hover:bg-muted text-primary rounded-xl p-2" aria-label="Editar candidato" title="Editar">
            <Pencil className="size-6" />
          </button>
          <button onClick={onFechar} className="hover:bg-muted rounded-xl p-2" aria-label="Fechar">
            <X className="size-6" />
          </button>
        </div>
        <div className="flex flex-col gap-5 p-6">
          <section className="bg-card rounded-2xl p-4 ring-1 ring-black/5">
            <p className="text-muted-foreground text-sm">CPF {formatarCpf(candidato.documento)}</p>
            <a
              href={linkWhatsApp(candidato.telefone, 'Olá! Aqui é da prefeitura, sobre o seu cadastro no MeuEmprego.')}
              target="_blank"
              rel="noreferrer"
              className="text-[oklch(0.45_0.12_155)] mt-1 inline-flex items-center gap-2 text-lg font-bold hover:underline"
            >
              <MessageCircle className="size-5" /> {formatarTelefone(candidato.telefone)}
            </a>
          </section>
          {!cv ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center">
              <p className="text-muted-foreground">Esta pessoa ainda não preencheu o currículo.</p>
              <Button size="sm" variant="outline" onClick={() => onEditar(true)}>
                <Pencil /> Preencher agora
              </Button>
            </div>
          ) : (
            <>
              <section>
                <h3 className="text-muted-foreground mb-2 text-sm font-bold">Quer trabalhar com</h3>
                <div className="flex flex-wrap gap-2">
                  {cv.areas_interesse.map((area) => (
                    <span key={area} className="bg-primary-soft text-primary rounded-full px-3 py-1 font-bold">
                      {area}
                    </span>
                  ))}
                </div>
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
              <section>
                <h3 className="text-muted-foreground mb-2 text-sm font-bold">Experiências</h3>
                {cv.experiencias.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma experiência informada.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {cv.experiencias.map((exp, i) => (
                      <li key={i} className="bg-card rounded-2xl p-3 ring-1 ring-black/5">
                        <p className="font-bold">{exp.o_que_fazia}</p>
                        <p className="text-muted-foreground text-sm">
                          {exp.onde} · {exp.quanto_tempo}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
