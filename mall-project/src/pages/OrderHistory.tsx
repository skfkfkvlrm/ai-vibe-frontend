import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { won } from '../api'
import { getOrders, type Order } from '../shop/shopApi'

function summarizeLines(order: Order): string {
  const first = order.lines[0]?.name ?? '-'
  const extra = order.lines.length - 1
  return extra > 0 ? `${first} 외 ${extra}건` : first
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    const ctrl = new AbortController()
    getOrders(ctrl.signal)
      .then(setOrders)
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : '구매 이력을 불러오지 못했습니다.')
      })
    return () => ctrl.abort()
  }, [])

  const toggle = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (error) {
    return (
      <p className='error' role='alert'>
        {error}
      </p>
    )
  }
  if (orders === null) return <p role='status'>불러오는 중...</p>
  if (orders.length === 0) {
    return (
      <div className='notice'>
        <p>구매 이력이 없습니다.</p>
        <Link to='/' className='btn'>
          상품 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className='table-wrap'>
      <table className='member-table'>
        <thead>
          <tr>
            <th>주문번호</th>
            <th>주문일시</th>
            <th>상품</th>
            <th>합계</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const isOpen = openIds.has(order.id)
            const isPaid = order.status === 'PAID'
            return (
              <Fragment key={order.id}>
                <tr>
                  <td>#{order.id}</td>
                  <td>{new Date(order.orderDate).toLocaleString('ko-KR')}</td>
                  <td>
                    <button
                      type='button'
                      className='order-toggle'
                      aria-expanded={isOpen}
                      onClick={() => toggle(order.id)}
                    >
                      {summarizeLines(order)}
                    </button>
                  </td>
                  <td>{won(order.totalPrice)}</td>
                  <td>
                    <span className={`badge ${isPaid ? 'badge-paid' : 'badge-pending'}`}>
                      {isPaid ? '결제 완료' : '결제 대기'}
                    </span>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={5}>
                      <div className='order-detail'>
                        <table className='member-table'>
                          <thead>
                            <tr>
                              <th>상품명</th>
                              <th>가격</th>
                              <th>수량</th>
                              <th>합계</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.lines.map((line, idx) => (
                              <tr key={`${order.id}-${line.productId ?? 'deleted'}-${idx}`}>
                                <td>{line.name}</td>
                                <td>{won(line.price)}</td>
                                <td>{line.quantity}</td>
                                <td>{won(line.price * line.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <dl className='detail-info'>
                          <dt>주문자</dt>
                          <dd>{order.formName}</dd>
                          <dt>이메일</dt>
                          <dd>{order.formMail}</dd>
                          <dt>요청사항</dt>
                          <dd>{order.formMsg || '-'}</dd>
                        </dl>
                        {order.status === 'ORDERED' && (
                          <div className='auth-form-actions'>
                            <Link to={`/orders/${order.id}`} className='btn primary'>
                              결제하기
                            </Link>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
