// Listas curtas usadas nos formulários. Os valores batem com os choices do Django.

export const CONTRATOS = [
  { valor: 'clt', nome: 'CLT', dica: 'Carteira assinada' },
  { valor: 'temporario', nome: 'Temporário', dica: 'Por um tempo combinado' },
  { valor: 'diarista', nome: 'Diarista', dica: 'Paga por dia' },
  { valor: 'estagio', nome: 'Estágio', dica: 'Para estudantes' },
]

export const HORARIOS = [
  { valor: 'manha', nome: 'Manhã' },
  { valor: 'tarde', nome: 'Tarde' },
  { valor: 'noite', nome: 'Noite' },
  { valor: 'integral', nome: 'Integral' },
  { valor: 'escala', nome: 'Escala' },
]

export const ESCOLARIDADES = [
  { valor: 'nenhuma', nome: 'Não estudei' },
  { valor: 'fundamental', nome: 'Fundamental' },
  { valor: 'medio', nome: 'Médio' },
  { valor: 'tecnico', nome: 'Técnico' },
  { valor: 'superior', nome: 'Superior' },
]

export function formatarSalario(salario: string | null) {
  if (!salario) return 'A combinar'
  return Number(salario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function linkWhatsApp(telefone: string, texto: string) {
  return `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`
}
