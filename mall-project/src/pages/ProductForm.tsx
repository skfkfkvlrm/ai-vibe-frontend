import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteProduct, getProduct, picUrl, saveProduct, type Product } from '../api'

// 등록(/products/new)과 수정(/products/:id/edit)을 한 폼으로 처리한다. 삭제는 수정 화면 안에서만 가능하다.
export default function ProductForm() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const navigate = useNavigate()
  const [current, setCurrent] = useState<Product | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [v] = useState(() => Date.now())

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    getProduct(id, controller.signal)
      .then(setCurrent)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : '알 수 없는 오류')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    // 파일을 고르지 않은 항목은 보내지 않아 서버가 기존 이미지를 유지하게 한다.
    for (const key of ['pic_s', 'pic_l']) {
      const file = form.get(key)
      if (file instanceof File && file.size === 0) form.delete(key)
    }
    setBusy(true)
    setError(null)
    try {
      const saved = await saveProduct(id, form)
      navigate(`/products/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장하지 못했습니다')
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!id || !window.confirm('이 제품을 삭제할까요?')) return
    setBusy(true)
    setError(null)
    try {
      await deleteProduct(id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다')
      setBusy(false)
    }
  }

  if (loading) return <p>불러오는 중...</p>
  if (isEdit && !current) {
    return (
      <>
        <p className="error">제품을 불러오지 못했습니다: {error}</p>
        <Link to="/">목록으로</Link>
      </>
    )
  }

  return (
    <>
      <h1>{isEdit ? '제품 수정' : '새 제품 등록'}</h1>
      <form className="product-form" onSubmit={onSubmit}>
        <label>
          제품명
          <input name="name" required defaultValue={current?.name} />
        </label>
        <label>
          가격(원)
          <input name="price" type="number" min={0} step={1} required defaultValue={current?.price} />
        </label>
        <label>
          종류
          <input name="kind" required maxLength={50} defaultValue={current?.kind} />
        </label>
        <label>
          설명
          <textarea name="text" rows={4} defaultValue={current?.text ?? ''} />
        </label>
        <label>
          작은 이미지(목록용)
          {current?.hasPicS && <img className="preview" src={picUrl(current.id, 's', v)} alt="현재 작은 이미지" />}
          <input name="pic_s" type="file" accept="image/*" />
        </label>
        <label>
          큰 이미지(상세용)
          {current?.hasPicL && <img className="preview" src={picUrl(current.id, 'l', v)} alt="현재 큰 이미지" />}
          <input name="pic_l" type="file" accept="image/*" />
        </label>
        {isEdit && <p className="hint">이미지를 선택하지 않으면 기존 이미지가 유지됩니다.</p>}
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button type="submit" className="btn primary" disabled={busy}>
            {isEdit ? '저장' : '등록'}
          </button>
          <Link to={isEdit ? `/products/${id}` : '/'} className="btn">
            취소
          </Link>
          {isEdit && (
            <button type="button" className="btn danger" onClick={onDelete} disabled={busy}>
              삭제
            </button>
          )}
        </div>
      </form>
    </>
  )
}
