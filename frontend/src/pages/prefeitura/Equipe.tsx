import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { api, ApiError } from '@/lib/api'
import { mascaraCpf } from '@/lib/mascaras'
import { formatarTelefone, type Membro } from '@/lib/painel'
import { useUsuario } from '@/lib/usuario'

import { Cabecalho } from './Layout'

export default function Equipe() {
  const { data: eu } = useUsuario()
  const [cpf, setCpf] = useState('')
  const queryClient = useQueryClient()
  const { data: equipe } = useQuery({ queryKey: ['painel', 'equipe'], queryFn: () => api<Membro[]>('/painel/equipe/') })
  const incluir = useMutation({
    mutationFn: () => api<Membro>('/painel/equipe/', { method: 'POST', body: { documento: cpf } }),
    onSuccess: () => {
      setCpf('')
      queryClient.invalidateQueries({ queryKey: ['painel', 'equipe'] })
    },
  })
  const remover = useMutation({
    mutationFn: (id: number) => api(`/painel/equipe/${id}/`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['painel', 'equipe'] }),
  })
  const erro =
    incluir.error instanceof ApiError
      ? String((incluir.error.dados.documento as string[] | undefined)?.[0] ?? incluir.error.message)
      : null

  return (
    <>
      <Cabecalho titulo="Equipe" texto="Quem pode aprovar vagas e ver esta área. Qualquer pessoa da equipe pode incluir outra." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_24rem]">
        <ul className="flex flex-col gap-3">
          {equipe?.map((membro) => (
            <li key={membro.id} className="bg-card flex items-center gap-4 rounded-3xl p-4 shadow-sm ring-1 ring-black/5">
              <span className="bg-primary grid size-12 shrink-0 place-items-center rounded-full text-lg font-extrabold text-white">
                {membro.nome.charAt(0).toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="font-bold">
                  {membro.nome} {membro.id === eu?.id && <span className="text-muted-foreground font-normal">(você)</span>}
                </p>
                <p className="text-muted-foreground text-sm">
                  CPF {mascaraCpf(membro.documento)} · {formatarTelefone(membro.telefone)}
                </p>
              </div>
              <span className="bg-leaf-soft text-[oklch(0.4_0.12_155)] flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold">
                <ShieldCheck className="size-4" /> Aprovador
              </span>
              {membro.id !== eu?.id && (
                <button
                  className="text-muted-foreground hover:bg-coral-soft hover:text-coral rounded-xl p-2"
                  aria-label={`Tirar ${membro.nome} da equipe`}
                  title="Tirar da equipe"
                  onClick={() => {
                    if (confirm(`Tirar a permissão de ${membro.nome}?`)) remover.mutate(membro.id)
                  }}
                >
                  <Trash2 className="size-5" />
                </button>
              )}
            </li>
          ))}
        </ul>

        <form
          className="bg-accent-soft flex h-fit flex-col gap-4 rounded-3xl p-6"
          onSubmit={(e) => {
            e.preventDefault()
            incluir.mutate()
          }}
        >
          <span className="bg-accent text-accent-foreground grid size-12 place-items-center rounded-2xl">
            <UserPlus className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">Incluir na equipe</h2>
            <p className="text-muted-foreground text-sm">
              A pessoa cria a conta normalmente no site com o CPF dela. Depois você digita o CPF aqui.
            </p>
          </div>
          <label className="flex flex-col gap-1">
            <span className="font-bold">CPF</span>
            <input
              value={cpf}
              onChange={(e) => setCpf(mascaraCpf(e.target.value))}
              inputMode="numeric"
              placeholder="000.000.000-00"
              className="bg-card focus:ring-primary min-h-12 rounded-xl border-2 px-4 text-lg outline-none focus:ring-2"
            />
          </label>
          {erro && <p className="text-destructive font-semibold">{erro}</p>}
          <Button type="submit" disabled={incluir.isPending || cpf.length < 14}>
            <UserPlus /> Incluir
          </Button>
        </form>
      </div>
    </>
  )
}
