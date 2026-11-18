import { useEffect, useState } from 'react'
import { imageUrl, show, showDateTime } from './dog'
import type { DeletedDog } from './dog'
import type { Notify } from './Toast'
import { useConfirm } from './useConfirm'

type Props = {
  onRestored: () => void
  onNotify: Notify
}

type RowProps = {
  dog: DeletedDog
  busy: boolean
  onRestore: (dog: DeletedDog) => void
}

// 행마다 2차 확인 상태를 따로 가진다. 5초 안에 누르지 않으면 원래 버튼으로 돌아간다.
function DeletedRow({ dog, busy, onRestore }: RowProps) {
  const confirm = useConfirm()
  return (
    <li>
      <img src={imageUrl(dog.image)} alt={dog.kind} />
      <span className="dog-kind">{show(dog.kind)}</span>
      <span>{dog.price === null ? '-' : `${dog.price.toLocaleString()}원`}</span>
      <span className="deleted-at">삭제 {showDateTime(dog.deletedAt)}</span>
      <span className="deleted-actions">
        {confirm.armed ? (
          <>
            <button
              type="button"
              className="btn btn-buy"
              disabled={busy}
              onClick={() => {
                confirm.disarm()
                onRestore(dog)
              }}
            >
              정말 복구
            </button>
            <button type="button" className="btn" disabled={busy} onClick={confirm.disarm}>
              취소
            </button>
          </>
        ) : (
          <button type="button" className="btn" disabled={busy} onClick={confirm.arm}>
            복구
          </button>
        )}
      </span>
    </li>
  )
}

// 추가 페이지의 '삭제된 개 복구' 탭. 삭제된 개를 최근 삭제 순으로 보여주고 한 마리씩 복구한다.
function DeletedDogs({ onRestored, onNotify }: Props) {
  const [dogs, setDogs] = useState<DeletedDog[]>([])
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [restoringId, setRestoringId] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/deleted', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<DeletedDog[]>
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

  const restore = async (dog: DeletedDog) => {
    if (restoringId !== null) return
    setRestoringId(dog.id)
    try {
      let res: Response
      try {
        res = await fetch(`/api/restore/${dog.id}`, { method: 'POST' })
      } catch {
        throw new Error('서버에 연결하지 못했습니다.')
      }
      if (res.status === 404) {
        // 이미 복구됐거나 없는 id라 목록에서도 뺀다.
        setDogs((prev) => prev.filter((d) => d.id !== dog.id))
        throw new Error('이미 복구되었거나 찾을 수 없는 개입니다.')
      }
      if (!res.ok) throw new Error(`요청에 실패했습니다. (HTTP ${res.status})`)
      setDogs((prev) => prev.filter((d) => d.id !== dog.id))
      onNotify('success', `${dog.kind}을(를) 복구했습니다.`)
      onRestored()
    } catch (err) {
      onNotify('error', `복구하지 못했습니다. ${(err as Error).message}`)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <section className="cart panel" aria-label="삭제된 개 복구">
      <h2>삭제된 개 복구</h2>
      {status === 'loading' && <p className="dog-msg">불러오는 중...</p>}
      {status === 'error' && <p className="dog-msg">삭제된 개 목록을 불러오지 못했습니다.</p>}
      {status === 'done' && dogs.length === 0 && <p className="dog-msg">삭제된 개가 없습니다.</p>}
      {dogs.length > 0 && (
        <ul className="cart-list deleted-list">
          {dogs.map((dog) => (
            <DeletedRow key={dog.id} dog={dog} busy={restoringId !== null} onRestore={restore} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default DeletedDogs
