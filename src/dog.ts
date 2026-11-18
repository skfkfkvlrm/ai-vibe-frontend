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
