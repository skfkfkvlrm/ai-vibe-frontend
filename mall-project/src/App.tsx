import { useEffect, useState } from 'react'
import './App.css'

interface Product {
  id: number
  name: string
  price: number
  kind: string
  text: string | null
  hasPicS: boolean
  hasPicL: boolean
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/products', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Product[]>
      })
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
    <main className="mall">
      <h1>제품 목록</h1>
      {loading && <p>불러오는 중...</p>}
      {error && <p className="error">목록을 불러오지 못했습니다: {error}</p>}
      {!loading && !error && products.length === 0 && <p>등록된 제품이 없습니다.</p>}
      <ul className="product-grid">
        {products.map((p) => (
          <li key={p.id} className="product-card">
            <div className="thumb">
              {p.hasPicS ? (
                <img src={`/api/products/${p.id}/pic-s`} alt={p.name} loading="lazy" />
              ) : (
                <span>이미지 없음</span>
              )}
            </div>
            <span className="kind">{p.kind}</span>
            <h2>{p.name}</h2>
            <p className="price">{p.price.toLocaleString('ko-KR')}원</p>
            {p.text && <p className="text">{p.text}</p>}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
