import { imageUrl, show } from './dog'
import type { Dog } from './dog'
import { useConfirm } from './useConfirm'

type Props = {
  dog: Dog
  onOpen: (id: number) => void
  onBuy: (dog: Dog) => void
}

// 목록의 카드 한 장. 구매는 2차 확인(5초 후 자동 복귀)을 거친다.
function DogCard({ dog, onOpen, onBuy }: Props) {
  const buyConfirm = useConfirm()

  return (
    <article
      className="dog-card panel"
      role="link"
      tabIndex={0}
      aria-label={`${dog.kind} 수정`}
      onClick={() => onOpen(dog.id)}
      onKeyDown={(e) => {
        // 안쪽 구매 버튼에서 올라온 키 입력은 무시한다.
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onOpen(dog.id)
        }
      }}
    >
      <img src={imageUrl(dog.image)} alt={dog.kind} />
      <ul>
        <li className="dog-kind">{show(dog.kind)}</li>
        <li>키: {show(dog.height, 'cm')}</li>
        <li>몸무게: {show(dog.weight, 'kg')}</li>
        <li>원산지: {show(dog.country)}</li>
        <li>{show(dog.content)}</li>
      </ul>
      {buyConfirm.armed ? (
        <div className="confirm-row">
          <button
            type="button"
            className="btn btn-buy"
            onClick={(e) => {
              // 카드 클릭(수정 화면 이동)으로 번지지 않게 한다.
              e.stopPropagation()
              buyConfirm.disarm()
              onBuy(dog)
            }}
          >
            구매 확인
          </button>
          <button
            type="button"
            className="btn"
            onClick={(e) => {
              e.stopPropagation()
              buyConfirm.disarm()
            }}
          >
            취소
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-buy"
          onClick={(e) => {
            e.stopPropagation()
            buyConfirm.arm()
          }}
        >
          {dog.price === null ? '구매' : `구매 · ${dog.price.toLocaleString()}원`}
        </button>
      )}
    </article>
  )
}

export default DogCard
