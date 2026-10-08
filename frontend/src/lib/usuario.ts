import { useQuery } from '@tanstack/react-query'

import { api, ApiError, type Usuario } from '@/lib/api'

/** Usuário logado, ou null quando ninguém entrou. */
export function useUsuario() {
  return useQuery({
    queryKey: ['eu'],
    queryFn: async () => {
      try {
        return await api<Usuario>('/auth/eu/')
      } catch (erro) {
        if (erro instanceof ApiError && erro.status === 403) return null
        throw erro
      }
    },
  })
}
