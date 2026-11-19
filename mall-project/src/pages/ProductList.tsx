import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, picUrl, won, type Product } from '../api'
import { isAdmin } from '../auth/isAdmin'
import { useAuth } from '../auth/useAuth'

export default function ProductList() {
  const { member } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getProducts(controller.signal)
      .then(setProducts)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : '알 수 없는 오류')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <>
      <div className="page-head">
        <h1>제품 목록</h1>
        {isAdmin(member) && (
          <Link to="/products/new" className="btn primary">
            새 제품 등록
          </Link>
        )}
      </div>
      {loading && <p>불러오는 중...</p>}
      {error && <p className="error">목록을 불러오지 못했습니다: {error}</p>}
      {!loading && !error && products.length === 0 && <p>등록된 제품이 없습니다.</p>}
      <ul className="product-grid">
        {products.map((p) => (
          <li key={p.id}>
            <Link to={`/products/${p.id}`} className="product-card">
              <div className="thumb">
                {p.hasPicS ? (
                  <img src={picUrl(p.id, 's')} alt={p.name} loading="lazy" />
                ) : (
                  <span>이미지 없음</span>
                )}
              </div>
              <span className="kind">{p.kind}</span>
              <h2>{p.name}</h2>
              <p className="price">{won(p.price)}</p>
              {p.text && <p className="text">{p.text}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
