import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { picUrl, won } from '../api'
import { useAuth } from '../auth/useAuth'
import {
  changeCartQuantity,
  getCart,
  placeOrder,
  removeCartItem,
  type Cart,
} from '../shop/shopApi'

// 백엔드(MemberRules)와 같은 규칙. 최종 검증은 서버가 한다.
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const errText = (e: unknown) => (e instanceof Error ? e.message : '알 수 없는 오류')

export default function CartPage() {
  const { member, ready } = useAuth()
  const uid = useId()
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(member?.name ?? '')
  const [mail, setMail] = useState(member?.email ?? '')
  const [msg, setMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!member) return
    const controller = new AbortController()
    getCart(controller.signal)
      .then(setCart)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(errText(e))
      })
    return () => controller.abort()
  }, [member])

  if (!ready) return <p>불러오는 중...</p>
  if (!member) return <Navigate to="/login" replace />

  const run = async (job: () => Promise<Cart>) => {
    setError(null)
    try {
      setCart(await job())
    } catch (e) {
      setError(errText(e))
    }
  }

  const handleOrder = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length > 100) return setError('주문자 이름을 입력해 주세요.')
    if (!EMAIL.test(mail.trim())) return setError('이메일 형식이 올바르지 않습니다.')
    if (msg.length > 500) return setError('요청 메시지는 500자 이내로 입력해 주세요.')
    setSubmitting(true)
    setError(null)
    try {
      const order = await placeOrder({ formName: name.trim(), formMail: mail.trim(), formMsg: msg.trim() })
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(errText(err))
      setSubmitting(false)
    }
  }

  const empty = cart !== null && cart.items.length === 0

  return (
    <>
      <div className="page-head">
        <h1>장바구니</h1>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!cart && !error && <p>불러오는 중...</p>}
      {empty && (
        <p>
          장바구니가 비어 있습니다. <Link to="/">상품 보러 가기</Link>
        </p>
      )}
      {cart && !empty && (
        <>
          <div className="table-wrap">
            <table className="member-table">
              <thead>
                <tr>
                  <th>상품</th>
                  <th>가격</th>
                  <th>수량</th>
                  <th>합계</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="cart-product">
                        {item.hasPicS && <img src={picUrl(item.productId, 's')} alt="" />}
                        <Link to={`/products/${item.productId}`}>{item.name}</Link>
                      </div>
                    </td>
                    <td>{won(item.price)}</td>
                    <td>
                      <input
                        className="qty-input"
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity}
                        aria-label={`${item.name} 수량`}
                        onChange={(e) => {
                          const q = Number(e.target.value)
                          if (Number.isInteger(q) && q >= 1 && q <= 99) {
                            void run(() => changeCartQuantity(item.id, q))
                          }
                        }}
                      />
                    </td>
                    <td>{won(item.subtotal)}</td>
                    <td>
                      <button type="button" className="btn" onClick={() => void run(() => removeCartItem(item.id))}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cart-total">
            총 결제 금액 <strong>{won(cart.totalPrice)}</strong>
          </p>

          <form className="auth-form" onSubmit={handleOrder}>
            <h2>주문 정보</h2>
            <div className="auth-form-row">
              <label htmlFor={`${uid}-name`}>주문자</label>
              <input id={`${uid}-name`} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="auth-form-row">
              <label htmlFor={`${uid}-mail`}>이메일</label>
              <input
                id={`${uid}-mail`}
                type="email"
                value={mail}
                maxLength={200}
                onChange={(e) => setMail(e.target.value)}
              />
            </div>
            <div className="auth-form-row">
              <label htmlFor={`${uid}-msg`}>요청사항</label>
              <textarea
                id={`${uid}-msg`}
                value={msg}
                maxLength={500}
                rows={3}
                onChange={(e) => setMsg(e.target.value)}
              />
            </div>
            <div className="auth-form-actions">
              <button type="submit" className="btn primary" disabled={submitting}>
                {submitting ? '주문 중...' : '주문하기'}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  )
}
