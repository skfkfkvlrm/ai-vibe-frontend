// 이 탭에서 이미 열어 본 글 ID. 같은 글을 다시 열어도 조회수가 오르지 않게 하는 용도(브라우저 단위, 탭을 닫으면 초기화).
// 서버에는 기록하지 않으므로 새 탭·새 세션에서는 다시 센다. 저장소 접근이 막힌 환경에서도 앱이 죽지 않게 감싼다.
const KEY = 'viewed_boards'

function read(): number[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === 'number') : []
  } catch {
    return []
  }
}

export function hasViewed(id: number): boolean {
  return read().includes(id)
}

export function markViewed(id: number): void {
  try {
    const ids = read()
    if (!ids.includes(id)) sessionStorage.setItem(KEY, JSON.stringify([...ids, id]))
  } catch {
    // 저장하지 못하면 다음에 다시 열 때 조회수가 한 번 더 오를 뿐이다.
  }
}
