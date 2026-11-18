import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

const MAX_IMAGE_BYTES = 3 * 1024 * 1024

type ImageResult = { image: string; source?: string | null }
type Busy = 'upload' | 'fetch' | 'submit' | null

function failure(status: number): string {
  if (status === 404) return '나무위키에서 해당 문서나 이미지를 찾지 못했습니다.'
  if (status === 502) return '외부 사이트 요청에 실패했습니다.'
  if (status === 400) return '입력값이나 이미지 형식(png, jpeg, webp / 3MB 이하)을 확인하세요.'
  return `요청에 실패했습니다. (HTTP ${status})`
}

// undefined: 비어 있음, null: 잘못된 값(숫자가 아니거나 음수)
function toNumber(text: string): number | undefined | null {
  const t = text.trim()
  if (t === '') return undefined
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? n : null
}

// 서버 오류와 네트워크 오류를 모두 사람이 읽을 문구의 Error로 바꿔 던진다.
async function request(url: string, init: RequestInit): Promise<Response> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    throw new Error('서버에 연결하지 못했습니다.')
  }
  if (!res.ok) throw new Error(failure(res.status))
  return res
}

function AddDog({ onDone }: { onDone: () => void }) {
  const [kind, setKind] = useState('')
  const [price, setPrice] = useState('')
  const [country, setCountry] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const applyImage = (result: ImageResult) => {
    setImage(result.image)
    setSource(result.source ?? null)
  }

  // 직접 첨부: multipart로 올리고 서버가 돌려준 경로를 보관한다.
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setError('이미지는 3MB 이하만 올릴 수 있습니다.')
      return
    }
    setBusy('upload')
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await request('/api/images', { method: 'POST', body })
      applyImage((await res.json()) as ImageResult)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  // 자동 수집: 종류 이름으로 서버 파이프라인(나무위키 + 로컬 LLM)을 실행한다. 수십 초 걸릴 수 있다.
  const fetchImage = async () => {
    if (kind.trim() === '') {
      setError('이미지를 받아오려면 종류를 먼저 입력하세요.')
      return
    }
    setBusy('fetch')
    setError('')
    try {
      const res = await request('/api/images/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: kind.trim() }),
      })
      applyImage((await res.json()) as ImageResult)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const p = toNumber(price)
    const h = toNumber(height)
    const w = toNumber(weight)
    if (kind.trim() === '') return setError('종류를 입력하세요.')
    if (p === null || (p !== undefined && !Number.isInteger(p)))
      return setError('가격은 0 이상의 정수로 입력하세요.')
    if (h === null || w === null) return setError('키와 몸무게는 0 이상의 숫자로 입력하세요.')

    setBusy('submit')
    setError('')
    try {
      await request('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: kind.trim(),
          ...(p !== undefined && { price: p }),
          ...(h !== undefined && { height: h }),
          ...(w !== undefined && { weight: w }),
          ...(country.trim() && { country: country.trim() }),
          ...(content.trim() && { content: content.trim() }),
          ...(image && { image }),
        }),
      })
      onDone()
    } catch (err) {
      setError((err as Error).message)
      setBusy(null)
    }
  }

  return (
    <form className="add-form panel" onSubmit={submit} aria-label="개 추가">
      <h2>개 추가</h2>

      <label className="field">
        <span>종류 *</span>
        <input value={kind} onChange={(e) => setKind(e.target.value)} maxLength={100} required />
      </label>
      <label className="field">
        <span>가격(원)</span>
        <input
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>
      <label className="field">
        <span>원산지</span>
        <input value={country} onChange={(e) => setCountry(e.target.value)} maxLength={100} />
      </label>
      <label className="field">
        <span>키(cm)</span>
        <input
          type="number"
          min="0"
          step="any"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </label>
      <label className="field">
        <span>몸무게(kg)</span>
        <input
          type="number"
          min="0"
          step="any"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </label>
      <label className="field">
        <span>설명</span>
        <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
      </label>

      <div className="field">
        <span>이미지</span>
        <div className="image-box">
          {image ? (
            <img src={'/' + image} alt="미리보기" />
          ) : (
            <p className="image-empty">이미지 없음</p>
          )}
        </div>
        <div className="form-actions">
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={onFileChange}
          />
          <button
            type="button"
            className="btn"
            disabled={busy !== null}
            onClick={() => fileInput.current?.click()}
          >
            {busy === 'upload' ? '올리는 중...' : '파일 선택'}
          </button>
          <button type="button" className="btn" disabled={busy !== null} onClick={fetchImage}>
            {busy === 'fetch' ? '받아오는 중... (최대 1분)' : '이미지 받아오기'}
          </button>
        </div>
        {source && (
          <p className="source-note">
            출처:{' '}
            <a href={source} target="_blank" rel="noreferrer">
              나무위키
            </a>
            . 이미지 저작권은 각 원저작자에게 있으니 받아온 이미지를 확인한 뒤 사용하세요.
          </p>
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-buy" disabled={busy !== null}>
          {busy === 'submit' ? '추가하는 중...' : '추가하기'}
        </button>
        <a className="btn" href="#/">
          취소
        </a>
      </div>
    </form>
  )
}

export default AddDog
