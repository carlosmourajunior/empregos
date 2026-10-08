export const soDigitos = (valor: string) => valor.replace(/\D/g, '')

export function mascaraCpf(valor: string) {
  const d = soDigitos(valor).slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function mascaraCnpj(valor: string) {
  const d = soDigitos(valor).slice(0, 14)
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

/** CPF até 11 dígitos, CNPJ a partir do 12º. */
export function mascaraDocumento(valor: string) {
  return soDigitos(valor).length > 11 ? mascaraCnpj(valor) : mascaraCpf(valor)
}

export function mascaraTelefone(valor: string) {
  const d = soDigitos(valor).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

/** Primeira mensagem de erro de um campo vindo do Django REST Framework. */
export function erroDoCampo(dados: Record<string, unknown>, campo: string) {
  const valor = dados[campo]
  if (Array.isArray(valor)) return String(valor[0])
  if (typeof valor === 'string') return valor
  return undefined
}
