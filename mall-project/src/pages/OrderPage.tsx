import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { won } from '../api'
import { useAuth } from '../auth/useAuth'
import { getOrder, payOrder, type Order } from '../shop/shopApi'

const errText = (e: unknown) => (e instanceof Error ? e.message : '알 수 없는 오류')
const CARDS = ['신한카드', '국민카드', '삼성카드', '현대카드']

/**
 * 주문 확인 + 모의 결제 화면. 실제 PG 연동은 없고, 결제하기를 누르면 잠시 처리 중 표시 후
 * 서버가 주문 상태만 PAID로 바꾼다. 카드 정보는 입력받지도 전송하지도 않는다.
 */
export default function OrderPage() {
  const { member, ready } = useAuth()
  const { id = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState(CARDS[0])
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (!member) return
    const controller = new AbortController()
    getOrder(id, controller.signal)
      .then(setOrder)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(errText(e))
      })
    return () => controller.abort()
  }, [id, member])

  if (!ready) return <p>불러오는 중...</p>
  if (!member) return <Navigate to="/login" replace />
  if (error && !order) {
    return (
      <>
        <p className="error">주문을 불러오지 못했습니다: {error}</p>
        <Link to="/">목록으로</Link>
      </>
    )
  }
  if (!order) return <p>불러오는 중...</p>

  const pay = async () => {
    setPaying(true)
    setError(null)
    try {
      // 실제 결제처럼 보이도록 잠시 처리 중 상태를 보여 준다.
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setOrder(await payOrder(order.id))
    } catch (e) {
      setError(errText(e))
    } finally {
      setPaying(false)
    }
  }

  const paid = order.status === 'PAID'

  return (
    <>
      <div className="page-head">
        <h1>{paid ? '결제 완료' : '주문 확인'}</h1>
      </div>
      <p className={paid ? 'notice success' : 'notice'} role="status">
        {paid
          ? `결제가 완료되었습니다. 주문번호 ${order.id} (모의 결제 · 실제 청구 없음)`
          : `주문이 접수되었습니다. 주문번호 ${order.id} — 아래 내용을 확인하고 결제를 진행해 주세요.`}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="table-wrap">
        <table className="member-table">
          <thead>
            <tr>
              <th>상품</th>
              <th>가격</th>
              <th>수량</th>
              <th>합계</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l, i) => (
              <tr key={i}>
                <td>{l.name}</td>
                <td>{won(l.price)}</td>
                <td>{l.quantity}</td>
                <td>{won(l.price * l.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cart-total">
        총 결제 금액 <strong>{won(order.totalPrice)}</strong>
      </p>
      <dl className="detail-info">
        <dt>주문자</dt>
        <dd>{order.formName}</dd>
        <dt>이메일</dt>
        <dd>{order.formMail}</dd>
        <dt>요청사항</dt>
        <dd>{order.formMsg || '-'}</dd>
      </dl>

      {paid ? (
        <p>
          <Link to="/" className="btn primary">
            쇼핑 계속하기
          </Link>
        </p>
      ) : (
        <div className="auth-form">
          <h2>결제 수단 (모의)</h2>
          <div className="auth-form-row">
            <label htmlFor="card">카드</label>
            <select id="card" value={card} disabled={paying} onChange={(e) => setCard(e.target.value)}>
              {CARDS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="auth-form-actions">
            <button type="button" className="btn primary" disabled={paying} onClick={() => void pay()}>
              {paying ? '결제 처리 중...' : `${won(order.totalPrice)} 결제하기`}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
