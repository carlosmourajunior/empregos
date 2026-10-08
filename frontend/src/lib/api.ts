// Cliente da API do Django. A sessão fica em cookie; o CSRF vem do cookie csrftoken.

export class ApiError extends Error {
  status: number
  dados: Record<string, unknown>

  constructor(status: number, dados: Record<string, unknown>) {
    super(typeof dados.detail === 'string' ? dados.detail : 'Algo deu errado. Tente de novo.')
    this.status = status
    this.dados = dados
  }
}

function lerCookie(nome: string) {
  return document.cookie
    .split('; ')
    .find((parte) => parte.startsWith(`${nome}=`))
    ?.split('=')[1]
}

async function garantirCsrf() {
  if (!lerCookie('csrftoken')) await fetch('/api/auth/csrf/', { credentials: 'same-origin' })
  return lerCookie('csrftoken') ?? ''
}

export async function api<T>(caminho: string, opcoes: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = opcoes.method ?? 'GET'
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json'
    headers['X-CSRFToken'] = await garantirCsrf()
  }
  const resposta = await fetch(`/api${caminho}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: opcoes.body === undefined ? undefined : JSON.stringify(opcoes.body),
  })
  if (resposta.status === 204) return undefined as T
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new ApiError(resposta.status, dados)
  return dados as T
}

export type Usuario = {
  id: number
  nome: string
  documento: string
  telefone: string
  tipo: 'candidato' | 'empresa' | 'prefeitura'
  telefone_verificado: boolean
  permissoes: { aprovar_vagas: boolean }
}

export type Paginado<T> = { count: number; next: string | null; previous: string | null; results: T[] }

export type Vaga = {
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
  empresa: string
  criada_em: string
  tenho_interesse: boolean
}

export type StatusVaga = 'pendente' | 'aprovada' | 'recusada' | 'encerrada'

export type VagaEmpresa = {
  id: number
  cargo: string
  area: string
  descricao: string
  salario: string | null
  contrato: string
  horario: string
  bairro: string
  quantidade: number
  status: StatusVaga
  status_nome: string
  interessados: number
  criada_em: string
}

export type Experiencia = { o_que_fazia: string; onde: string; quanto_tempo: string }

export type Curriculo = {
  data_nascimento: string
  bairro: string
  escolaridade: string
  areas_interesse: string[]
  tem_cnh: boolean
  categoria_cnh: string
  experiencias: Experiencia[]
}

export type Interessado = {
  id: number
  criado_em: string
  nome: string
  telefone: string
  cpf: string
  idade: number | null
  bairro: string
  escolaridade: string
  areas_interesse: string[]
  tem_cnh: boolean
  categoria_cnh: string
  experiencias: Experiencia[]
}
