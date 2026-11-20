import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { won } from '../api'
import CancelSummary from '../shop/CancelSummary'
import { cancelOrder, getOrders, type Order } from '../shop/shopApi'

const STATUS_META: Record<Order['status'], { label: string; className: string }> = {
  ORDERED: { label: '결제 대기', className: 'badge-pending' },
  PAID: { label: '결제 완료', className: 'badge-paid' },
  PARTIALLY_CANCELED: { label: '일부 취소', className: 'badge-partial' },
  CANCELED: { label: '취소됨', className: 'badge-canceled' },
}

function summarizeLines(order: Order): string {
  const first = order.lines[0]?.name ?? '-'
  const extra = order.lines.length - 1
  return extra > 0 ? `${first} 외 ${extra}건` : first
}

interface OrderDetailProps {
  order: Order
  onUpdated: (updated: Order) => void
}

function OrderDetail({ order, onUpdated }: OrderDetailProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const canCancel = order.status !== 'CANCELED'
  const selectedTotal = order.lines.reduce((sum, line) => {
    const remaining = Math.max(0, line.quantity - line.canceledQuantity)
    const qty = Math.min(remaining, quantities[line.lineId] ?? 0)
    return sum + qty
  }, 0)

  const handleQtyChange = (lineId: number, remaining: number, raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    const next = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(remaining, parsed))
    setQuantities((prev) => ({ ...prev, [lineId]: next }))
  }

  const handleCancel = async () => {
    const trimmedReason = reason.trim()
    const items = order.lines
      .map((line) => {
        const remaining = Math.max(0, line.quantity - line.canceledQuantity)
        const qty = Math.min(remaining, quantities[line.lineId] ?? 0)
        return { lineId: line.lineId, quantity: qty }
      })
      .filter((item) => item.quantity > 0)

    if (items.length === 0 || !trimmedReason) return
    if (!window.confirm('선택한 상품을 취소하시겠습니까?')) return

    setSubmitting(true)
    setCancelError(null)
    try {
      const updated = await cancelOrder(order.id, trimmedReason, items)
      onUpdated(updated)
      setQuantities({})
      setReason('')
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : '주문 취소에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='order-detail'>
      <table className='member-table'>
        <thead>
          <tr>
            <th>상품명</th>
            <th>가격</th>
            <th>수량</th>
            <th>합계</th>
            <th>취소</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => {
            const remaining = Math.max(0, line.quantity - line.canceledQuantity)
            const selectedQty = Math.min(remaining, quantities[line.lineId] ?? 0)
            return (
              <tr key={line.lineId}>
                <td>{line.name}</td>
                <td>{won(line.price)}</td>
                <td>
                  {line.quantity}
                  {line.canceledQuantity > 0 && ` (취소 ${line.canceledQuantity})`}
                </td>
                <td>{won(line.price * line.quantity)}</td>
                <td>
                  {remaining === 0 ? (
                    '취소 완료'
                  ) : canCancel ? (
                    <input
                      type='number'
                      className='qty-input'
                      min={0}
                      max={remaining}
                      value={selectedQty}
                      disabled={submitting}
                      aria-label={`${line.name} 취소 수량`}
                      onChange={(e) => handleQtyChange(line.lineId, remaining, e.target.value)}
                    />
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <CancelSummary order={order} />

      {canCancel && (
        <div className='order-cancel-form'>
          <textarea
            rows={2}
            maxLength={200}
            placeholder='취소 사유를 입력하세요 (최대 200자)'
            value={reason}
            disabled={submitting}
            aria-label='취소 사유'
            onChange={(e) => setReason(e.target.value)}
          />
          {cancelError && (
            <p className='error' role='alert'>
              {cancelError}
            </p>
          )}
          <div className='auth-form-actions'>
            <button
              type='button'
              className='btn danger'
              disabled={submitting || selectedTotal === 0 || reason.trim().length === 0}
              onClick={handleCancel}
            >
              {submitting ? '취소 처리 중...' : '선택 상품 취소'}
            </button>
          </div>
        </div>
      )}

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
  )
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

  const handleOrderUpdated = (updated: Order) => {
    setOrders((prev) => (prev ? prev.map((o) => (o.id === updated.id ? updated : o)) : prev))
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
            const statusMeta = STATUS_META[order.status]
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
                  <td>
                    {order.status !== 'CANCELED' && order.canceledAmount > 0 ? (
                      <>
                        {won(order.payableAmount)}
                        <span className='order-total-sub'>(주문 합계 {won(order.totalPrice)})</span>
                      </>
                    ) : (
                      won(order.totalPrice)
                    )}
                  </td>
                  <td>
                    <span className={`badge ${statusMeta.className}`}>{statusMeta.label}</span>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={5}>
                      <OrderDetail order={order} onUpdated={handleOrderUpdated} />
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
