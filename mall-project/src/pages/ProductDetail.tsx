import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct, picUrl, won, type Product } from '../api'
import { isAdmin } from '../auth/isAdmin'
import { useAuth } from '../auth/useAuth'

export default function ProductDetail() {
  const { member } = useAuth()
  const { id = '' } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  // 수정 직후 이전 이미지가 캐시에서 보이지 않도록 진입 시마다 버전 값을 붙인다.
  const [v] = useState(() => Date.now())

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
        </dl>
      </div>
      <p>
        <Link to="/">← 목록으로</Link>
      </p>
    </>
  )
}
