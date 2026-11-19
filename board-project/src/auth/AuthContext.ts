import { createContext } from 'react'
import type { Member } from '../api/auth'

export interface AuthValue {
  /** 로그인한 회원. 로그아웃 상태면 null */
  member: Member | null
  /** 저장된 토큰으로 로그인 복원을 시도하는 중이면 false */
  ready: boolean
  login: (loginId: string, password: string) => Promise<void>
  logout: () => void
  /** 내 정보 수정 결과 등으로 회원 정보만 갱신한다. */
  applyMember: (member: Member) => void
  /** 비밀번호를 바꾸고 받은 새 토큰으로 현재 로그인을 이어간다(이전 토큰은 서버에서 무효). */
  applyToken: (token: string) => Promise<void>
  /** 임시 비밀번호 변경 안내 팝업을 이번 로그인 세션에서 이미 닫았는지 */
  resetNoticeDismissed: boolean
  dismissResetNotice: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)
