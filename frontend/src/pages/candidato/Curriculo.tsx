import { useQuery } from '@tanstack/react-query'
import { Briefcase, Car, FileText, GraduationCap, MapPin, Pencil, Phone, Printer } from 'lucide-react'
import type { ReactNode } from 'react'

import { ApagarConta } from '@/components/ApagarConta'
import { AreaLogada, Vazio } from '@/components/AreaLogada'
import { Button } from '@/components/ui/button'
import { api, ApiError, type Curriculo as TipoCurriculo } from '@/lib/api'
import { mascaraTelefone } from '@/lib/mascaras'
import { ESCOLARIDADES } from '@/lib/opcoes'
import { useUsuario } from '@/lib/usuario'

function idade(nascimento: string) {
  const [a, m, d] = nascimento.split('-').map(Number)
  const hoje = new Date()
  return hoje.getFullYear() - a - (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d) ? 1 : 0)
}

function Linha({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-lg">
      <span className="text-primary">{icone}</span>
      {children}
    </p>
  )
}

export default function Curriculo() {
  const { data: usuario } = useUsuario()
  const { data: curriculo, isLoading } = useQuery({
    queryKey: ['curriculo'],
    queryFn: async () => {
      try {
        return await api<TipoCurriculo>('/curriculo/')
      } catch (erro) {
        if (erro instanceof ApiError && erro.status === 404) return null
        throw erro
      }
    },
  })

  return (
    <AreaLogada usuario={usuario} titulo="Meu currículo" subtitulo="É isso que a empresa vê">
      {isLoading ? null : !curriculo ? (
        <Vazio
          icone={FileText}
          titulo="Vamos montar seu currículo?"
          texto="São 6 perguntas rápidas. Com ele pronto, você pode mostrar interesse nas vagas."
          acao={<Button asLink="/curriculo/editar">Começar</Button>}
        />
      ) : (
        <>
          <article className="bg-card flex flex-col gap-5 overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 print:shadow-none">
            <div className="bg-primary-soft flex items-center gap-4 p-5">
              <span className="bg-primary grid size-16 place-items-center rounded-full text-2xl font-extrabold text-white">
                {usuario?.nome.charAt(0)}
              </span>
              <div>
                <h2 className="text-2xl font-extrabold">{usuario?.nome}</h2>
                <p className="text-muted-foreground text-lg">{idade(curriculo.data_nascimento)} anos</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 px-5">
              {usuario && <Linha icone={<Phone className="size-6" />}>{mascaraTelefone(usuario.telefone.slice(2))}</Linha>}
              <Linha icone={<MapPin className="size-6" />}>{curriculo.bairro}</Linha>
              <Linha icone={<GraduationCap className="size-6" />}>
                {ESCOLARIDADES.find((e) => e.valor === curriculo.escolaridade)?.nome}
              </Linha>
              <Linha icone={<Car className="size-6" />}>
                {curriculo.tem_cnh ? `CNH categoria ${curriculo.categoria_cnh}` : 'Sem carteira de motorista'}
              </Linha>
            </div>
            <div className="flex flex-col gap-2 px-5">
              <h3 className="text-lg font-bold">Quer trabalhar com</h3>
              <ul className="flex flex-wrap gap-2">
                {curriculo.areas_interesse.map((a) => (
                  <li key={a} className="bg-accent-soft rounded-full px-4 py-1.5 font-bold">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 px-5 pb-5">
              <h3 className="text-lg font-bold">Experiência</h3>
              {curriculo.experiencias.length === 0 ? (
                <p className="text-muted-foreground text-lg">Primeiro emprego</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {curriculo.experiencias.map((exp, i) => (
                    <li key={i} className="bg-muted flex items-start gap-3 rounded-2xl p-3">
                      <Briefcase className="text-primary mt-1 size-5 shrink-0" />
                      <div>
                        <p className="font-bold">{exp.o_que_fazia}</p>
                        <p className="text-muted-foreground">
                          {exp.onde}
                          {exp.quanto_tempo && ` · ${exp.quanto_tempo}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
          <div className="grid grid-cols-2 gap-3 print:hidden">
            <Button asLink="/curriculo/editar" variant="outline">
              <Pencil /> Mudar
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer /> Imprimir
            </Button>
          </div>
        </>
      )}
      {!isLoading && <ApagarConta texto="Seu currículo e seus interesses em vagas serão apagados." />}
    </AreaLogada>
  )
}
