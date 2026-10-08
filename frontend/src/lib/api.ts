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
