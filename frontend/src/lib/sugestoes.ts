import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'

/** Áreas ou bairros já digitados por outras pessoas, para o campo sugerir. */
export function useSugestoes(campo: 'area' | 'bairro', termo: string) {
  return useQuery({
    queryKey: ['sugestoes', campo, termo],
    queryFn: () => api<string[]>(`/sugestoes/?campo=${campo}&q=${encodeURIComponent(termo)}`),
    staleTime: 60_000,
    placeholderData: (anterior) => anterior,
  }).data ?? []
}
