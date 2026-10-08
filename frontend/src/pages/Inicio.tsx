import { Briefcase, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'

// Tela inicial provisória. As telas de verdade vêm na etapa de protótipo.
export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-4 py-10">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">MeuEmprego</h1>
        <p className="text-muted-foreground text-lg">Vagas de emprego da nossa cidade.</p>
      </header>
      <div className="flex flex-col gap-4">
        <Button size="lg">
          <Search /> Quero trabalhar
        </Button>
        <Button size="lg" variant="outline">
          <Briefcase /> Quero contratar
        </Button>
      </div>
    </main>
  )
}
