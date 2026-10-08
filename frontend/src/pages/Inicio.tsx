import {
  Briefcase,
  ChefHat,
  FileText,
  Hammer,
  Handshake,
  HardHat,
  type LucideIcon,
  MessageCircle,
  Search,
  Sparkles,
  Store,
  Tractor,
  Truck,
} from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

import { Bolhas, IlustracaoCidade } from '@/components/ilustracoes'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { paginaInicial, useUsuario } from '@/lib/usuario'

const PASSOS: { icone: LucideIcon; titulo: string; texto: string; cor: string }[] = [
  {
    icone: FileText,
    titulo: 'Faça seu cadastro',
    texto: 'Leva poucos minutos. O cadastro já vira o seu currículo.',
    cor: 'bg-primary-soft text-primary',
  },
  {
    icone: Search,
    titulo: 'Veja as vagas',
    texto: 'Vagas de empresas da cidade, perto da sua casa.',
    cor: 'bg-accent-soft text-[oklch(0.5_0.13_65)]',
  },
  {
    icone: Handshake,
    titulo: 'Toque em "Tenho interesse"',
    texto: 'A empresa recebe seu contato e chama você no WhatsApp.',
    cor: 'bg-leaf-soft text-[oklch(0.45_0.12_155)]',
  },
]

const AREAS: { icone: LucideIcon; nome: string }[] = [
  { icone: Store, nome: 'Comércio' },
  { icone: ChefHat, nome: 'Cozinha' },
  { icone: HardHat, nome: 'Construção' },
  { icone: Sparkles, nome: 'Limpeza' },
  { icone: Truck, nome: 'Motorista' },
  { icone: Tractor, nome: 'Rural' },
  { icone: Hammer, nome: 'Manutenção' },
  { icone: Briefcase, nome: 'Escritório' },
]

export default function Inicio() {
  const { data: usuario, isLoading } = useUsuario()

  if (usuario) return <Navigate to={paginaInicial(usuario)} replace />

  return (
    <div className="min-h-svh">
      <header className="from-primary relative overflow-hidden rounded-b-[2.5rem] bg-linear-to-br to-[oklch(0.4_0.17_270)] text-white">
        <Bolhas className="absolute inset-0 size-full" />
        <div className="relative mx-auto flex max-w-md flex-col gap-6 px-4 pt-4">
          <nav className="flex min-h-12 items-center justify-between">
            <Logo claro />
            {!isLoading && (
              <Link to="/entrar" className="rounded-full bg-white/15 px-5 py-2.5 text-base font-bold hover:bg-white/25">
                Entrar
              </Link>
            )}
          </nav>

          <div className="space-y-3 pt-2">
              <span className="bg-accent text-accent-foreground inline-block rounded-full px-3 py-1 text-sm font-bold">
                Gratuito para todos
              </span>
              <h1 className="text-[2.6rem] leading-[1.05] font-extrabold tracking-tight">
                Trabalho perto <span className="text-accent">de você</span>
              </h1>
              <p className="text-xl text-white/85">Vagas de emprego das empresas da nossa cidade, num só lugar.</p>
          </div>

          <IlustracaoCidade className="-mb-1 w-full" />
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col gap-10 px-4 py-8">
        {!isLoading && (
          <section className="flex flex-col gap-3">
            <Button asLink="/criar-conta?tipo=candidato" size="lg" className="shadow-primary/30 shadow-lg">
              <Search /> Quero trabalhar
            </Button>
            <Button asLink="/criar-conta?tipo=empresa" size="lg" variant="accent" className="shadow-lg shadow-amber-500/20">
              <Briefcase /> Quero contratar
            </Button>
            <Link to="/vagas" className="text-primary min-h-12 py-2 text-center text-lg font-bold underline">
              Só quero ver as vagas abertas
            </Link>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight">Como funciona</h2>
          <ol className="flex flex-col gap-3">
            {PASSOS.map(({ icone: Icone, titulo, texto, cor }, i) => (
              <li key={titulo} className="bg-card flex items-start gap-4 rounded-2xl p-4 ring-1 ring-black/5">
                <span className={`relative grid size-14 shrink-0 place-items-center rounded-2xl ${cor}`}>
                  <Icone className="size-7" strokeWidth={2.2} />
                  <span className="bg-foreground text-background absolute -top-1.5 -left-1.5 grid size-6 place-items-center rounded-full text-sm font-bold">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="text-lg font-bold">{titulo}</h3>
                  <p className="text-muted-foreground text-base">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight">Vagas de todo tipo</h2>
          <ul className="grid grid-cols-4 gap-3">
            {AREAS.map(({ icone: Icone, nome }) => (
              <li key={nome} className="flex flex-col items-center gap-1.5 text-center">
                <span className="bg-primary-soft text-primary grid size-14 place-items-center rounded-2xl">
                  <Icone className="size-7" strokeWidth={2} />
                </span>
                <span className="text-sm font-semibold">{nome}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-leaf-soft flex items-center gap-4 rounded-3xl p-5">
          <span className="bg-leaf grid size-12 shrink-0 place-items-center rounded-2xl text-white">
            <MessageCircle className="size-6" />
          </span>
          <p className="text-base">
            <strong>É fácil:</strong> o cadastro faz uma pergunta por vez, e você pode pedir ajuda a quem quiser.
          </p>
        </section>
      </main>

      <footer className="text-muted-foreground pb-8 text-center text-sm">Desenvolvido por RLC Soluções</footer>
    </div>
  )
}
