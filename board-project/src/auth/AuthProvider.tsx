import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, me, type Member } from '../api/auth'
import { ApiError, AUTH_EXPIRED_EVENT } from '../api/boards'
import { AuthContext, type AuthValue } from './AuthContext'
import { clearToken, getToken, isResetNoticeDismissed, setResetNoticeDismissed, setToken } from './token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [member, setMember] = useState<Member | null>(null)
  // 저장된 토큰이 없으면 복원할 것이 없으므로 처음부터 준비된 상태로 시작한다.
  const [ready, setReady] = useState(() => getToken() === null)
  const [resetNoticeDismissed, setResetNoticeDismissedState] = useState(() => isResetNoticeDismissed())

  // 시작할 때 저장된 토큰이 있으면 /me로 로그인 상태를 복원한다.
  useEffect(() => {
    let cancelled = false
    const token = getToken()
    if (!token) return
    me(token)
      .then((m) => {
        if (!cancelled) setMember(m)
      })
      .catch((e: unknown) => {
        // 만료·위조·변경된 토큰(401)과 밴된 계정(403)의 토큰만 지운다. 네트워크 오류 등은 유지한다.
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) clearToken()
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 토큰을 보낸 요청이 401을 받으면(만료·무효·비밀번호 변경) 로그아웃하고 로그인 화면으로 보낸다.
  useEffect(() => {
    const onExpired = () => {
      clearToken()
      setMember(null)
      navigate('/login', { state: { expired: true } })
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
  }, [navigate])

  const value = useMemo<AuthValue>(
    () => ({
      member,
      ready,
      login: async (loginId, password) => {
        const token = await apiLogin(loginId, password)
        const m = await me(token.access_token)
        setToken(token.access_token)
        // 새 로그인마다 임시 비밀번호 안내를 다시 보여줄 수 있게 한다.
        setResetNoticeDismissed(false)
        setResetNoticeDismissedState(false)
        setMember(m)
      },
      logout: () => {
        clearToken()
        setMember(null)
      },
      applyMember: (m) => setMember(m),
      applyToken: async (token) => {
        setToken(token)
        setMember(await me(token))
      },
      resetNoticeDismissed,
      dismissResetNotice: () => {
        setResetNoticeDismissed(true)
        setResetNoticeDismissedState(true)
      },
    }),
    [member, ready, resetNoticeDismissed],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
