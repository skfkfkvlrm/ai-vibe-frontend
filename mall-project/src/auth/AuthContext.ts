import { createContext } from 'react'
import type { Member } from './api'

export interface AuthValue {
  /** 로그인한 회원. 로그아웃 상태면 null */
  member: Member | null
  /** 저장된 토큰으로 로그인 복원을 시도하는 중이면 false */
  ready: boolean
  login: (loginId: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)
