// JWT를 localStorage에 보관한다. 저장소 접근이 막힌 환경에서도 앱이 죽지 않게 감싼다.
const KEY = 'jwt_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // 저장하지 못해도 이번 화면의 로그인 상태는 메모리에서 유지된다.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // 무시
  }
}
