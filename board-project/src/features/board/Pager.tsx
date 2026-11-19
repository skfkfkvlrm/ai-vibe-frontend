import '../../App.css'

interface PagerProps {
  /** 0부터 시작하는 현재 페이지 */
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const WINDOW = 5

/** 이전/다음과 현재 페이지 주변 번호를 보여주는 페이지 이동. 페이지가 1개 이하이면 그리지 않는다. */
function Pager({ page, totalPages, onChange }: PagerProps) {
  if (totalPages <= 1) return null

  const start = Math.max(0, Math.min(page - Math.floor(WINDOW / 2), totalPages - WINDOW))
  const end = Math.min(totalPages, start + WINDOW)
  const numbers = Array.from({ length: end - start }, (_, i) => start + i)

  return (
    <nav className="pager" aria-label="페이지 이동">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)}>
        이전
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === page ? 'page' : undefined}
          disabled={n === page}
          onClick={() => onChange(n)}
        >
          {n + 1}
        </button>
      ))}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>
        다음
      </button>
    </nav>
  )
}

export default Pager
