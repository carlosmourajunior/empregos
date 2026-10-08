import { useUsuario } from '@/lib/usuario'

// Área da prefeitura (computador). Por enquanto só confere a permissão.
export default function Prefeitura() {
  const { data: usuario, isLoading } = useUsuario()

  if (isLoading) return null
  if (!usuario?.permissoes.aprovar_vagas) {
    return (
      <main className="mx-auto max-w-3xl px-8 py-16">
        <h1 className="text-2xl font-bold">Área da prefeitura</h1>
        <p className="text-muted-foreground mt-2">Entre com uma conta que tenha permissão de aprovador.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-8 py-10">
      <h1 className="text-2xl font-bold">Olá, {usuario.nome}</h1>
      <p className="text-muted-foreground mt-2">Aqui vão ficar as vagas para aprovar e os relatórios.</p>
    </main>
  )
}
