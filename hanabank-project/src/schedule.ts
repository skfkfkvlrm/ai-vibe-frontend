export interface Schedule {
  id: number
  gdate: string // yyyy-MM-dd
  game: string // '1' 홈, '0' 원정
  team: string
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

/** "2026-11-20" -> "2026년 11월 20일(금)". 타임존 영향이 없도록 직접 계산한다. */
export function formatDate(gdate: string): string {
  const [y, m, d] = gdate.split('-').map(Number)
  const day = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${y}년 ${m}월 ${d}일(${day})`
}

export function matchup(s: Schedule): string {
  return s.game === '1' ? `하나은행 vs ${s.team}` : `${s.team} vs 하나은행`
}
