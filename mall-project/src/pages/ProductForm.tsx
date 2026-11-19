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
  // 2차 확인: 등록/저장/삭제 버튼을 누르면 해당 모드가 되어 [취소][확인] 버튼으로 바뀐다.
  const [confirming, setConfirming] = useState<'save' | 'delete' | null>(null)
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
    // 첫 제출(브라우저 입력 검증 통과 후)은 확인 단계로만 넘기고, 확인 버튼의 제출에서 실제로 저장한다.
    if (confirming !== 'save') {
      if (confirming === null) setConfirming('save')
      return
    }
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
      setConfirming(null)
    }
  }

  async function onDelete() {
    if (!id) return
    setBusy(true)
    setError(null)
    try {
      await deleteProduct(id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제하지 못했습니다')
      setBusy(false)
      setConfirming(null)
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
      {/* 입력이 바뀌면 확인 단계를 해제해, 확인한 내용과 저장되는 내용이 달라지지 않게 한다. */}
      <form className="product-form" onSubmit={onSubmit} onChange={() => setConfirming(null)}>
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
        {confirming === 'save' && (
          <div className="actions confirm" role="group" aria-label="확인">
            <span className="confirm-msg">이 내용으로 {isEdit ? '저장' : '등록'}할까요?</span>
            {/* 더블클릭이 확인으로 이어지지 않도록, 방금 누른 버튼 자리에는 취소를 둔다. */}
            <button key="cancel" type="button" className="btn" onClick={() => setConfirming(null)} disabled={busy}>
              취소
            </button>
            <button key="ok" type="submit" className="btn primary" disabled={busy}>
              확인
            </button>
          </div>
        )}
        {confirming === 'delete' && (
          <div className="actions confirm" role="group" aria-label="삭제 확인">
            <span className="confirm-msg">이 제품을 삭제할까요?</span>
            {/* 삭제 버튼이 있던 오른쪽 끝에는 취소를 두고, 삭제 확인은 그 왼쪽에 둔다. */}
            <button key="del-ok" type="button" className="btn danger" onClick={onDelete} disabled={busy}>
              삭제 확인
            </button>
            <button key="del-cancel" type="button" className="btn" onClick={() => setConfirming(null)} disabled={busy}>
              취소
            </button>
          </div>
        )}
        {confirming === null && (
          <div className="actions">
            <button key="submit" type="submit" className="btn primary" disabled={busy}>
              {isEdit ? '저장' : '등록'}
            </button>
            <Link to={isEdit ? `/products/${id}` : '/'} className="btn">
              취소
            </Link>
            {isEdit && (
              <button type="button" className="btn danger" onClick={() => setConfirming('delete')} disabled={busy}>
                삭제
              </button>
            )}
          </div>
        )}
      </form>
    </>
  )
}
