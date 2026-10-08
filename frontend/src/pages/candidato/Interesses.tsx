import { useQuery } from '@tanstack/react-query'
import { Heart } from 'lucide-react'

import { AreaLogada, Vazio } from '@/components/AreaLogada'
import { Button } from '@/components/ui/button'
import { VagaCard } from '@/components/VagaCard'
import { api, type Vaga } from '@/lib/api'
import { useUsuario } from '@/lib/usuario'

export default function Interesses() {
  const { data: usuario } = useUsuario()
  const { data: vagas, isLoading } = useQuery({ queryKey: ['interesses'], queryFn: () => api<Vaga[]>('/meus-interesses/') })

  return (
    <AreaLogada usuario={usuario} titulo="Meus interesses" subtitulo="Vagas em que você tocou em “Tenho interesse”">
      {isLoading ? null : vagas && vagas.length > 0 ? (
        vagas.map((vaga) => <VagaCard key={vaga.id} vaga={vaga} />)
      ) : (
        <Vazio
          icone={Heart}
          titulo="Nenhum interesse ainda"
          texto="Quando gostar de uma vaga, toque em “Tenho interesse”. Ela aparece aqui."
          acao={<Button asLink="/vagas">Ver vagas</Button>}
        />
      )}
    </AreaLogada>
  )
}
