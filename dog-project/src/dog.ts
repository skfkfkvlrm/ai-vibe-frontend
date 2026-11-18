export type Dog = {
  id: number
  kind: string
  price: number | null
  image: string | null
  country: string | null
  height: number | null
  weight: number | null
  content: string | null
  readcount: number
}

// DB 값이 'jindo.jpg' 또는 '/static/jindo.jpg' 여도 '/jindo.jpg'로 맞춘다. 업로드 이미지는 'uploads/xxx' → '/uploads/xxx'.
export function imageUrl(image: string | null): string {
  if (!image) return ''
  return '/' + image.replace(/^\/?(static\/)?/, '')
}

export function show(value: string | number | null, unit = ''): string {
  return value === null || value === undefined || value === '' ? '-' : `${value}${unit}`
}

// GET /api/deleted 응답. soft delete된 개의 복구 화면 표시용 항목만 담는다.
export type DeletedDog = {
  id: number
  kind: string
  price: number | null
  image: string | null
  deletedAt: string
}

// 서버가 시간대 없는 LocalDateTime('2026-11-18T17:30:00.123')을 주므로 변환 없이 그대로 보기 좋게 자른다.
export function showDateTime(value: string): string {
  return value.replace('T', ' ').slice(0, 19)
}
