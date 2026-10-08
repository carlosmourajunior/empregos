import {
  Baby,
  Briefcase,
  Car,
  ChefHat,
  Hammer,
  HardHat,
  HeartPulse,
  type LucideIcon,
  Scissors,
  Shirt,
  Sparkles,
  Store,
  Tractor,
  Truck,
  Wrench,
} from 'lucide-react'

// Ícone e cor pela palavra da área (que é texto livre). O que não reconhecer cai na maleta.
const REGRAS: { palavras: string[]; icone: LucideIcon; cor: string }[] = [
  { palavras: ['cozinh', 'restaur', 'padar', 'lanch', 'garç', 'aliment'], icone: ChefHat, cor: 'bg-coral-soft text-coral' },
  { palavras: ['constru', 'pedre', 'obra', 'servente'], icone: HardHat, cor: 'bg-accent-soft text-[oklch(0.5_0.13_65)]' },
  { palavras: ['limpe', 'faxin', 'domést', 'zelad'], icone: Sparkles, cor: 'bg-leaf-soft text-[oklch(0.45_0.12_155)]' },
  { palavras: ['comérc', 'comerc', 'vend', 'loja', 'caix', 'atend'], icone: Store, cor: 'bg-primary-soft text-primary' },
  { palavras: ['motor', 'entreg', 'transp'], icone: Truck, cor: 'bg-accent-soft text-[oklch(0.5_0.13_65)]' },
  { palavras: ['rural', 'agro', 'campo', 'fazend', 'colhe'], icone: Tractor, cor: 'bg-leaf-soft text-[oklch(0.45_0.12_155)]' },
  { palavras: ['manuten', 'eletric', 'encan'], icone: Wrench, cor: 'bg-primary-soft text-primary' },
  { palavras: ['marcen', 'carpint', 'serral'], icone: Hammer, cor: 'bg-accent-soft text-[oklch(0.5_0.13_65)]' },
  { palavras: ['saúde', 'saude', 'enferm', 'cuidad'], icone: HeartPulse, cor: 'bg-coral-soft text-coral' },
  { palavras: ['criança', 'babá', 'bab'], icone: Baby, cor: 'bg-coral-soft text-coral' },
  { palavras: ['beleza', 'cabel', 'manicure', 'salão'], icone: Scissors, cor: 'bg-coral-soft text-coral' },
  { palavras: ['costur', 'confec', 'têxtil'], icone: Shirt, cor: 'bg-primary-soft text-primary' },
  { palavras: ['mecân', 'mecan', 'oficina', 'lava'], icone: Car, cor: 'bg-primary-soft text-primary' },
]

export function estiloDaArea(area: string) {
  const texto = area.toLowerCase()
  return (
    REGRAS.find((regra) => regra.palavras.some((p) => texto.includes(p))) ?? {
      icone: Briefcase,
      cor: 'bg-primary-soft text-primary',
    }
  )
}
