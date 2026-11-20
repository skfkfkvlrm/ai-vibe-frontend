import { request } from '../api'

export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  hasPicS: boolean
  quantity: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  totalPrice: number
}

export interface OrderLine {
  productId: number | null
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: number
  orderDate: string
  totalPrice: number
  /** ORDERED(결제 전) | PAID(모의 결제 완료) */
  status: 'ORDERED' | 'PAID'
  formName: string
  formMail: string
  formMsg: string | null
  lines: OrderLine[]
}

export interface OrderForm {
  formName: string
  formMail: string
  formMsg: string
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const getCart = (signal?: AbortSignal) => request<Cart>('/api/cart', { signal })

export const addToCart = (productId: number, quantity: number) =>
  request<Cart>('/api/cart', json('POST', { productId, quantity }))

export const changeCartQuantity = (id: number, quantity: number) =>
  request<Cart>(`/api/cart/${id}`, json('PATCH', { quantity }))

export const removeCartItem = (id: number) => request<Cart>(`/api/cart/${id}`, { method: 'DELETE' })

export const placeOrder = (form: OrderForm) => request<Order>('/api/orders', json('POST', form))

export const getOrders = (signal?: AbortSignal) => request<Order[]>('/api/orders', { signal })

export const getOrder =(id: string, signal?: AbortSignal) => request<Order>(`/api/orders/${id}`, { signal })

/** 모의 결제. 실제 PG 연동 없이 서버가 상태만 PAID로 바꾼다. */
export const payOrder = (id: number) => request<Order>(`/api/orders/${id}/pay`, { method: 'POST' })
