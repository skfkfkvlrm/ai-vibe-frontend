import { useEffect, useLayoutEffect, useState } from 'react'
import './App.css'

type Theme = 'light' | 'dark'
const THEME_KEY = 'theme'

// 저장된 선택이 있으면 그것을, 없으면 OS 설정을 따른다.
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // 저장소에 접근할 수 없으면 OS 설정을 사용한다.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type Dog = {
  id: number
  kind: string
  price: number | null
  image: string | null
  country: string | null
  height: number | null
  weight: number | null
  content: string | null
  readcount: number
}

// DB 값이 'jindo.jpg' 또는 '/static/jindo.jpg' 여도 '/jindo.jpg'로 맞춘다.
function imageUrl(image: string | null): string {
  if (!image) return ''
  return '/' + image.replace(/^\/?(static\/)?/, '')
}

function show(value: string | number | null, unit = ''): string {
  return value === null || value === undefined || value === '' ? '-' : `${value}${unit}`
}

const CART_KEY = 'cart'

// 장바구니는 새로고침해도 유지되도록 localStorage에 저장한다.
function loadCart(): Dog[] {
  try {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed as Dog[]
    }
  } catch {
    // 읽지 못하면 빈 장바구니로 시작한다.
  }
  return []
}

const isCartHash = () => window.location.hash === '#/cart'

function won(value: number | null): string {
  return value === null ? '-' : `${value.toLocaleString()}원`
}

function App() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [cart, setCart] = useState<Dog[]>(loadCart)
  const [inCart, setInCart] = useState(isCartHash)

  useEffect(() => {
    const onHashChange = () => setInCart(isCartHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {
      // 저장하지 못해도 현재 화면의 장바구니는 유지된다.
    }
  }, [cart])

  // 같은 개는 한 번만 담고, 담은 뒤 장바구니 페이지로 이동한다.
  const buy = (dog: Dog) => {
    setCart((prev) => (prev.some((d) => d.id === dog.id) ? prev : [...prev, dog]))
    window.location.hash = '#/cart'
  }

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((d) => d.id !== id))

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      // 저장하지 못해도 현재 화면의 테마는 바뀐다.
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/dogs', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Dog[]>
      })
      .then((data) => {
        setDogs(data)
        setStatus('done')
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setStatus('error')
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="shop">
      <header className="shop-header">
        <h1>Dog Shop</h1>
        <div className="header-actions">
          <a className="btn" href={inCart ? '#/' : '#/cart'}>
            {inCart ? '목록' : `🛒 장바구니 (${cart.length})`}
          </a>
          <button
            type="button"
            className="btn"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? '☀️ 라이트' : '🌙 다크'}
          </button>
        </div>
      </header>
      {inCart ? (
        <section className="cart panel" aria-label="장바구니">
          <h2>장바구니</h2>
          {cart.length === 0 ? (
            <p className="dog-msg">장바구니가 비어 있습니다.</p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map((dog) => (
                  <li key={dog.id}>
                    <img src={imageUrl(dog.image)} alt={dog.kind} />
                    <span className="dog-kind">{show(dog.kind)}</span>
                    <span>{won(dog.price)}</span>
                    <button type="button" className="btn" onClick={() => removeFromCart(dog.id)}>
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
              <p className="cart-total">
                합계: {won(cart.reduce((sum, d) => sum + (d.price ?? 0), 0))}
              </p>
            </>
          )}
        </section>
      ) : (
      <div className="dog-grid">
        {status === 'loading' && <p className="dog-msg">불러오는 중...</p>}
        {status === 'error' && <p className="dog-msg">목록을 불러오지 못했습니다.</p>}
        {status === 'done' && dogs.length === 0 && (
          <p className="dog-msg">등록된 개가 없습니다.</p>
        )}
        {dogs.map((dog) => (
          <article className="dog-card panel" key={dog.id}>
            <img src={imageUrl(dog.image)} alt={dog.kind} />
            <ul>
              <li className="dog-kind">{show(dog.kind)}</li>
              <li>키: {show(dog.height, 'cm')}</li>
              <li>몸무게: {show(dog.weight, 'kg')}</li>
              <li>원산지: {show(dog.country)}</li>
              <li>{show(dog.content)}</li>
            </ul>
            <button type="button" className="btn btn-buy" onClick={() => buy(dog)}>
              {dog.price === null ? '구매' : `구매 · ${dog.price.toLocaleString()}원`}
            </button>
          </article>
        ))}
      </div>
      )}
    </main>
  )
}

export default App
