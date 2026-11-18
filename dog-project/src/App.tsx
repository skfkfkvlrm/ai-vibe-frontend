import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'
import AddPage from './AddPage'
import DogCard from './DogCard'
import DogForm from './DogForm'
import Toast from './Toast'
import type { Notify, ToastData } from './Toast'
import { imageUrl, show } from './dog'
import type { Dog } from './dog'

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

type Route = { name: 'list' } | { name: 'cart' } | { name: 'add' } | { name: 'edit'; id: number }

function getRoute(): Route {
  const hash = window.location.hash
  if (hash === '#/cart') return { name: 'cart' }
  if (hash === '#/add') return { name: 'add' }
  const edit = /^#\/edit\/(\d+)$/.exec(hash)
  if (edit) return { name: 'edit', id: Number(edit[1]) }
  return { name: 'list' }
}

function won(value: number | null): string {
  return value === null ? '-' : `${value.toLocaleString()}원`
}

function App() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [cart, setCart] = useState<Dog[]>(loadCart)
  const [route, setRoute] = useState<Route>(getRoute)
  // 개를 추가한 뒤 목록을 다시 불러오기 위한 카운터
  const [reloadKey, setReloadKey] = useState(0)
  // 우하단 알림. 앱 최상위에서 관리해 화면이 바뀌어도 3초 동안 유지된다.
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastSeq = useRef(0)

  const notify: Notify = (kind, text) => {
    toastSeq.current += 1
    setToast({ id: toastSeq.current, kind, text })
  }

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute())
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
    const alreadyInCart = cart.some((d) => d.id === dog.id)
    setCart((prev) => (prev.some((d) => d.id === dog.id) ? prev : [...prev, dog]))
    notify('success', alreadyInCart ? '이미 장바구니에 있습니다.' : '장바구니에 담았습니다.')
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
  }, [reloadKey])

  // 복구처럼 화면을 옮기지 않고 목록 데이터만 다시 불러올 때 쓴다.
  const reloadDogs = () => setReloadKey((k) => k + 1)

  const backToList = () => {
    reloadDogs()
    window.location.hash = '#/'
  }

  // 추가를 마치면 목록을 다시 불러오고 목록 페이지로 이동한다.
  const onAdded = () => {
    notify('success', '추가했습니다.')
    backToList()
  }

  // 수정을 저장하면 목록과 장바구니의 같은 id를 서버가 돌려준 값으로 바꾸고 목록으로 돌아간다.
  const onUpdated = (dog: Dog) => {
    setDogs((prev) => prev.map((d) => (d.id === dog.id ? dog : d)))
    setCart((prev) => prev.map((d) => (d.id === dog.id ? dog : d)))
    notify('success', '수정했습니다.')
    backToList()
  }

  // 삭제(soft delete)하면 목록과 장바구니에서 같은 id를 빼고 목록으로 돌아간다.
  const onDeleted = (id: number) => {
    setDogs((prev) => prev.filter((d) => d.id !== id))
    setCart((prev) => prev.filter((d) => d.id !== id))
    notify('success', '삭제했습니다.')
    backToList()
  }

  const openEdit = (id: number) => {
    window.location.hash = `#/edit/${id}`
  }

  const editingDog = route.name === 'edit' ? dogs.find((d) => d.id === route.id) : undefined

  return (
    <main className="shop">
      <header className="shop-header">
        <h1>Dog Shop</h1>
        <div className="header-actions">
          {/* 임시 위치: 장바구니 버튼 왼쪽 */}
          <a className="btn" href={route.name === 'add' ? '#/' : '#/add'}>
            {route.name === 'add' ? '목록' : '＋ 개 추가'}
          </a>
          <a className="btn" href={route.name === 'cart' ? '#/' : '#/cart'}>
            {route.name === 'cart' ? '목록' : `🛒 장바구니 (${cart.length})`}
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
      {route.name === 'add' ? (
        <AddPage onAdded={onAdded} onRestored={reloadDogs} onNotify={notify} />
      ) : route.name === 'edit' ? (
        editingDog ? (
          <DogForm
            key={editingDog.id}
            mode="edit"
            initial={editingDog}
            onDone={onUpdated}
            onDeleted={onDeleted}
            onNotify={notify}
          />
        ) : status === 'loading' ? (
          <p className="dog-msg">불러오는 중...</p>
        ) : (
          <p className="dog-msg">
            {status === 'error' ? '목록을 불러오지 못했습니다.' : '해당 개를 찾을 수 없습니다.'}{' '}
            <a href="#/">목록으로</a>
          </p>
        )
      ) : route.name === 'cart' ? (
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
          <DogCard key={dog.id} dog={dog} onOpen={openEdit} onBuy={buy} />
        ))}
      </div>
      )}
      <Toast toast={toast} />
    </main>
  )
}

export default App
