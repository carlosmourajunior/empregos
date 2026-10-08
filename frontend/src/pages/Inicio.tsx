import { useQueryClient } from '@tanstack/react-query'
import { Briefcase, LogOut, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useUsuario } from '@/lib/usuario'

export default function Inicio() {
  const { data: usuario, isLoading } = useUsuario()
  const queryClient = useQueryClient()

  async function sair() {
    await api('/auth/logout/', { method: 'POST' })
    queryClient.setQueryData(['eu'], null)
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-8 px-4 py-10">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">MeuEmprego</h1>
        <p className="text-muted-foreground text-lg">Vagas de emprego da nossa cidade.</p>
      </header>

      {isLoading ? null : usuario ? (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-2xl">
            Olá, <strong>{usuario.nome.split(' ')[0]}</strong>!
          </p>
          <p className="text-muted-foreground text-lg">
            {usuario.tipo === 'empresa'
              ? 'Em breve você vai poder cadastrar suas vagas aqui.'
              : 'Em breve você vai ver as vagas e montar seu currículo aqui.'}
          </p>
          <Button variant="outline" onClick={sair}>
            <LogOut /> Sair
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <Button asLink="/criar-conta?tipo=candidato" size="lg">
              <Search /> Quero trabalhar
            </Button>
            <Button asLink="/criar-conta?tipo=empresa" size="lg" variant="outline">
              <Briefcase /> Quero contratar
            </Button>
          </div>
          <p className="text-center text-lg">
            Já tem conta?{' '}
            <Link to="/entrar" className="text-primary font-semibold underline">
              Entrar
            </Link>
          </p>
        </>
      )}
    </main>
  )
}
