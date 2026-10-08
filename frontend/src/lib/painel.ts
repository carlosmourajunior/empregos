import { useQuery } from '@tanstack/react-query'

import { api, type Paginado, type StatusVaga } from '@/lib/api'

export type VagaPainel = {
  id: number
  cargo: string
  area: string
  descricao: string
  salario: string | null
  contrato_nome: string
  horario_nome: string
  bairro: string
  quantidade: number
  status: StatusVaga
  status_nome: string
  motivo_recusa: string
  avaliada_por: string | null
  avaliada_em: string | null
  criada_em: string
  interessados: number
  empresa_id: number
  empresa: string
  empresa_cnpj: string
  empresa_telefone: string
  empresa_bloqueada: boolean
}

export type Numeros = {
  pendentes: number
  vagas_abertas: number
  postos_abertos: number
  curriculos: number
  empresas: number
  interesses: number
  por_area: { area: string; vagas: number; interesses: number; curriculos: number }[]
}

export type EmpresaPainel = {
  id: number
  nome: string
  documento: string
  telefone: string
  criado_em: string
  bloqueada: boolean
  vagas_abertas: number
  vagas_total: number
}

export type Membro = { id: number; nome: string; documento: string; telefone: string }

export function useNumeros() {
  return useQuery({ queryKey: ['painel', 'numeros'], queryFn: () => api<Numeros>('/painel/numeros/') })
}

export function useVagasPainel(filtros: { status?: string; busca?: string; empresa?: string; pagina?: number }) {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries({ ...filtros, page: filtros.pagina, pagina: undefined })) {
    if (valor) params.set(chave, String(valor))
  }
  return useQuery({
    queryKey: ['painel', 'vagas', filtros],
    queryFn: () => api<Paginado<VagaPainel>>(`/painel/vagas/?${params}`),
    placeholderData: (anterior) => anterior,
  })
}

export const formatarData = (valor: string) => new Date(valor).toLocaleDateString('pt-BR')

export function formatarCnpj(valor: string) {
  return valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function formatarTelefone(valor: string) {
  const local = valor.startsWith('55') ? valor.slice(2) : valor
  return local.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
}

/** Há quanto tempo, em palavras simples ("hoje", "há 3 dias"). */
export function haQuanto(valor: string) {
  const dias = Math.floor((Date.now() - new Date(valor).getTime()) / 86_400_000)
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'ontem'
  return `há ${dias} dias`
}
