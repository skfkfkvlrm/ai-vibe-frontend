import { useState } from 'react'
import DeletedDogs from './DeletedDogs'
import DogForm from './DogForm'
import type { Dog } from './dog'
import type { Notify } from './Toast'

type Tab = 'new' | 'restore'

type Props = {
  onAdded: (dog: Dog) => void
  onRestored: () => void
  onNotify: Notify
}

// 추가 페이지. '새로 추가' 탭은 기존 추가 폼이고, '삭제된 개 복구' 탭에서 삭제한 개를 되살린다.
// 탭 상태는 이 화면 안에서만 유지되고, 페이지를 떠나면 '새로 추가'로 돌아간다.
function AddPage({ onAdded, onRestored, onNotify }: Props) {
  const [tab, setTab] = useState<Tab>('new')

  return (
    <>
      <div className="tabs" role="tablist" aria-label="추가 페이지">
        <button
          type="button"
          role="tab"
          className="btn"
          aria-selected={tab === 'new'}
          onClick={() => setTab('new')}
        >
          새로 추가
        </button>
        <button
          type="button"
          role="tab"
          className="btn"
          aria-selected={tab === 'restore'}
          onClick={() => setTab('restore')}
        >
          삭제된 개 복구
        </button>
      </div>
      {tab === 'new' ? (
        <DogForm mode="add" onDone={onAdded} onNotify={onNotify} />
      ) : (
        <DeletedDogs onRestored={onRestored} onNotify={onNotify} />
      )}
    </>
  )
}

export default AddPage
