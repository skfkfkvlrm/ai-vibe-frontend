import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdmin } from './isAdmin'
import { useAuth } from './useAuth'

/** 비로그인은 /login, 로그인했지만 ADMIN이 아니면 목록(/)으로 보낸다. 로그인 복원이 끝나기 전에는 아무것도 그리지 않는다. */
export default function AdminRoute({ children }: { children: ReactNode }) {
  const { member, ready } = useAuth()
  if (!ready) return null
  if (!member) return <Navigate to="/login" replace />
  if (!isAdmin(member)) return <Navigate to="/" replace />
  return <>{children}</>
}
