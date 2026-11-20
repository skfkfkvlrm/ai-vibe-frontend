import { won } from '../api'
import type { Order } from './shopApi'

interface CancelSummaryProps {
  order: Order
}

export default function CancelSummary({ order }: CancelSummaryProps) {
  if (order.cancels.length === 0) return null

  const showRefund = order.refundedTotal > 0

  return (
    <section className="cancel-summary" aria-label="취소 내역">
      <h3>취소 내역</h3>
      <p className="cancel-summary-note">
        취소한 상품 금액이 차감되어 결제 예정 금액이 주문 합계와 다릅니다.
      </p>
      <dl className="cancel-summary-totals">
        <div>
          <dt>주문 합계</dt>
          <dd>{won(order.totalPrice)}</dd>
        </div>
        <div>
          <dt>취소 차감</dt>
          <dd>-{won(order.canceledAmount)}</dd>
        </div>
        <div className="cancel-summary-payable">
          <dt>결제 예정 금액</dt>
          <dd>{won(order.payableAmount)}</dd>
        </div>
      </dl>
      {showRefund && <p className="refund-total">환불 금액: {won(order.refundedTotal)}</p>}
      <ul className="cancel-summary-list">
        {order.cancels.map((c, i) => (
          <li key={`${c.canceledAt}-${c.productName}-${i}`}>
            <span className="cancel-item-main">
              <strong>{c.productName}</strong> {c.quantity}개 · -{won(c.amount)}
            </span>
            <span className="cancel-item-meta">
              사유: {c.reason} · {new Date(c.canceledAt).toLocaleString('ko-KR')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
