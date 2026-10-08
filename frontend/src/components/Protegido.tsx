import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import type { Usuario } from '@/lib/api'
import { useUsuario } from '@/lib/usuario'

/** Só mostra a tela para quem entrou com o tipo de conta certo. */
export function Protegido({ tipo, children }: { tipo: Usuario['tipo']; children: ReactNode }) {
  const { data: usuario, isLoading } = useUsuario()
  if (isLoading) return null
  if (!usuario) return <Navigate to="/entrar" replace />
  if (usuario.tipo !== tipo) return <Navigate to="/" replace />
  return children
}
