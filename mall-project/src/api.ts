export interface Product {
  id: number
  name: string
  price: number
  kind: string
  text: string | null
  hasPicS: boolean
  hasPicL: boolean
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      // 본문이 JSON이 아니면 상태 코드만 사용
    }
    throw new Error(message)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

export const getProducts = (signal?: AbortSignal) => request<Product[]>('/api/products', { signal })

export const getProduct = (id: string, signal?: AbortSignal) =>
  request<Product>(`/api/products/${id}`, { signal })

// 등록(id 없음)과 수정(id 있음) 모두 multipart. 이미지를 비우면 서버가 기존 이미지를 유지한다.
export const saveProduct = (id: string | undefined, form: FormData) =>
  request<Product>(id ? `/api/products/${id}` : '/api/products', {
    method: id ? 'PUT' : 'POST',
    body: form,
  })

export const deleteProduct = (id: string) => request<void>(`/api/products/${id}`, { method: 'DELETE' })

export const picUrl = (id: number, size: 's' | 'l', v?: number) =>
  `/api/products/${id}/pic-${size}${v ? `?v=${v}` : ''}`

export const won = (price: number) => `${price.toLocaleString('ko-KR')}원`
