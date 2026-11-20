import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, picUrl, won, type Product } from '../api'
import { isAdmin } from '../auth/isAdmin'
import { useAuth } from '../auth/useAuth'
import { addToCart } from '../shop/shopApi'

export default function ProductDetail() {
  const { member } = useAuth()
  const { id = '' } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  // 수정 직후 이전 이미지가 캐시에서 보이지 않도록 진입 시마다 버전 값을 붙인다.
  const [v] = useState(() => Date.now())
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [cartMsg, setCartMsg] = useState<{ text: string; error: boolean } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getProduct(id, controller.signal)
      .then(setProduct)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : '알 수 없는 오류')
      })
    return () => controller.abort()
  }, [id])

  const handleAdd = async () => {
    if (!member) {
      navigate('/login')
      return
    }
    setAdding(true)
    setCartMsg(null)
    try {
      await addToCart(Number(id), qty)
      setCartMsg({ text: '장바구니에 담았습니다.', error: false })
    } catch (e) {
      setCartMsg({ text: e instanceof Error ? e.message : '알 수 없는 오류', error: true })
    } finally {
      setAdding(false)
    }
  }

  if (error) {
    return (
      <>
        <p className="error">제품을 불러오지 못했습니다: {error}</p>
        <Link to="/">목록으로</Link>
      </>
    )
  }
  if (!product) return <p>불러오는 중...</p>

  return (
    <>
      <div className="page-head">
        <h1>{product.name}</h1>
        {isAdmin(member) && (
          <Link to={`/products/${product.id}/edit`} className="btn primary">
            수정
          </Link>
        )}
      </div>
      <div className="detail">
        <div className="detail-image">
          {product.hasPicL || product.hasPicS ? (
            <img src={picUrl(product.id, product.hasPicL ? 'l' : 's', v)} alt={product.name} />
          ) : (
            <span>이미지 없음</span>
          )}
        </div>
        <dl className="detail-info">
          <dt>종류</dt>
          <dd>{product.kind}</dd>
          <dt>가격</dt>
          <dd className="price">{won(product.price)}</dd>
          <dt>설명</dt>
          <dd>{product.text || '-'}</dd>
          <dd className="add-cart">
            <input
              className="qty-input"
              type="number"
              min={1}
              max={99}
              value={qty}
              aria-label="수량"
              onChange={(e) => setQty(Math.min(99, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
            />
            <button type="button" className="btn primary" disabled={adding} onClick={() => void handleAdd()}>
              {adding ? '담는 중...' : '장바구니 담기'}
            </button>
          </dd>
        </dl>
      </div>
      <p>
        <Link to="/">← 목록으로</Link>
      </p>
      {cartMsg && (
        <div className="modal-backdrop" onClick={() => setCartMsg(null)}>
          <div
            className="modal"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && setCartMsg(null)}
          >
            <p className={cartMsg.error ? 'error' : undefined}>{cartMsg.text}</p>
            <div className="modal-actions">
              <button type="button" className="btn" autoFocus onClick={() => setCartMsg(null)}>
                {cartMsg.error ? '닫기' : '계속 쇼핑'}
              </button>
              {!cartMsg.error && (
                <button type="button" className="btn primary" onClick={() => navigate('/cart')}>
                  장바구니 보기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
