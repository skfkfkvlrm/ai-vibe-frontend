const TEXT = '로딩 중...'
const RADIUS = 34

/** 문구의 글자들을 원둘레에 배치하고, 원 전체를 회전시키는 로딩 표시. */
function Loading() {
  const chars = Array.from(TEXT)
  const step = 360 / chars.length

  return (
    <div className="loading-ring" role="status" aria-label="불러오는 중">
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            transform: `translate(-50%, -50%) rotate(${i * step}deg) translateY(-${RADIUS}px)`,
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  )
}

export default Loading
