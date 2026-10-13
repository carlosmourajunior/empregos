import { useQuery } from '@tanstack/react-query'

import { api, ApiError, type Curriculo, type Paginado, type StatusVaga } from '@/lib/api'

export type VagaPainel = {
  id: number
  cargo: string
  area: string
  descricao: string
  salario: string | null
  contrato: string
  contrato_nome: string
  horario: string
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

export type CandidatoPainel = {
  id: number
  nome: string
  documento: string
  telefone: string
  criado_em: string
  interesses: number
  curriculo: Curriculo | null
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

export function useCandidatos(busca: string, pagina: number) {
  const params = new URLSearchParams({ busca, page: String(pagina) })
  return useQuery({
    queryKey: ['painel', 'candidatos', busca, pagina],
    queryFn: () => api<Paginado<CandidatoPainel>>(`/painel/candidatos/?${params}`),
    placeholderData: (anterior) => anterior,
  })
}

export const formatarData = (valor: string) => new Date(valor).toLocaleDateString('pt-BR')

export function formatarCnpj(valor: string) {
  return valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function formatarCpf(valor: string) {
  return valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
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

/** Junta os erros da API num objeto { campo: mensagem }. Erros de listas aninhadas viram a primeira mensagem. */
export function errosDa(erro: Error | null): { campos: Record<string, string>; geral?: string } {
  if (!erro) return { campos: {} }
  if (!(erro instanceof ApiError)) return { campos: {}, geral: erro.message }
  const campos: Record<string, string> = {}
  const primeira = (valor: unknown): string | undefined => {
    if (typeof valor === 'string') return valor
    if (Array.isArray(valor)) return valor.map(primeira).find(Boolean)
    if (valor && typeof valor === 'object') return Object.values(valor).map(primeira).find(Boolean)
  }
  const juntar = (dados: Record<string, unknown>, prefixo = '') => {
    for (const [chave, valor] of Object.entries(dados)) {
      if (valor && typeof valor === 'object' && !Array.isArray(valor)) juntar(valor as Record<string, unknown>, `${prefixo}${chave}.`)
      else if (primeira(valor)) campos[`${prefixo}${chave}`] = primeira(valor)!
    }
  }
  juntar(erro.dados)
  const geral = typeof erro.dados.detail === 'string' ? erro.dados.detail : campos.non_field_errors
  return { campos, geral: geral ?? (Object.keys(campos).length ? undefined : erro.message) }
}
