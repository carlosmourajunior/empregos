import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Briefcase, Car, GraduationCap, MapPin, MessageCircle, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { AreaLogada, Vazio } from '@/components/AreaLogada'
import { api, type Interessado, type VagaEmpresa } from '@/lib/api'
import { mascaraTelefone } from '@/lib/mascaras'
import { linkWhatsApp } from '@/lib/opcoes'
import { useUsuario } from '@/lib/usuario'

export default function Interessados() {
  const { id } = useParams()
  const { data: usuario } = useUsuario()
  const { data: vaga } = useQuery({ queryKey: ['minha-vaga', id], queryFn: () => api<VagaEmpresa>(`/minhas-vagas/${id}/`) })
  const { data: pessoas, isLoading } = useQuery({
    queryKey: ['interessados', id],
    queryFn: () => api<Interessado[]>(`/minhas-vagas/${id}/interessados/`),
  })

  return (
    <AreaLogada
      usuario={usuario}
      titulo="Interessados"
      subtitulo={vaga?.cargo}
      topo={
        <Link to="/empresa" className="-ml-2 inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 font-semibold hover:bg-white/10">
          <ArrowLeft className="size-5" /> Minhas vagas
        </Link>
      }
    >
      {isLoading ? null : pessoas && pessoas.length > 0 ? (
        pessoas.map((p) => (
          <article key={p.id} className="bg-card flex flex-col gap-4 rounded-3xl p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <span className="bg-primary grid size-14 shrink-0 place-items-center rounded-full text-xl font-extrabold text-white">
                {p.nome.charAt(0)}
              </span>
              <div>
                <h2 className="text-lg leading-tight font-extrabold">{p.nome}</h2>
                <p className="text-muted-foreground">
                  {p.idade !== null && `${p.idade} anos · `}CPF {p.cpf}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-base">
              <p className="flex items-center gap-2">
                <MapPin className="text-primary size-5" /> {p.bairro}
              </p>
              <p className="flex items-center gap-2">
                <GraduationCap className="text-primary size-5" /> {p.escolaridade}
              </p>
              {p.tem_cnh && (
                <p className="flex items-center gap-2">
                  <Car className="text-primary size-5" /> CNH {p.categoria_cnh}
                </p>
              )}
            </div>
            {p.experiencias.length > 0 && (
              <ul className="flex flex-col gap-2">
                {p.experiencias.map((exp, i) => (
                  <li key={i} className="bg-muted flex items-start gap-2 rounded-2xl p-3">
                    <Briefcase className="text-primary mt-0.5 size-5 shrink-0" />
                    <span>
                      <strong>{exp.o_que_fazia}</strong> em {exp.onde}
                      {exp.quanto_tempo && ` · ${exp.quanto_tempo}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <a
              href={linkWhatsApp(p.telefone, `Olá, ${p.nome.split(' ')[0]}! Vi seu interesse na vaga de ${vaga?.cargo ?? ''} no MeuEmprego.`)}
              target="_blank"
              rel="noreferrer"
              className="bg-leaf inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl text-lg font-bold text-white"
            >
              <MessageCircle className="size-6" /> Chamar no WhatsApp
            </a>
            <p className="text-muted-foreground -mt-2 text-center text-sm">{mascaraTelefone(p.telefone.slice(2))}</p>
          </article>
        ))
      ) : (
        <Vazio
          icone={Users}
          titulo="Ninguém ainda"
          texto={vaga?.status === 'aprovada' ? 'Quando alguém tocar em “Tenho interesse”, aparece aqui.' : 'A vaga ainda não foi publicada. Assim que for aprovada, as pessoas começam a ver.'}
        />
      )}
    </AreaLogada>
  )
}
