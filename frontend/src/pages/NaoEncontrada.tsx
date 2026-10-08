import { Link } from 'react-router-dom'

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <Link to="/" className="text-primary text-lg font-semibold underline">
        Voltar para o início
      </Link>
    </main>
  )
}
