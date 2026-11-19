import { Fragment, useEffect, useState } from 'react'
import { getBoard, listBoards, type Board } from './api/boards'
import './App.css'

type Detail =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; board: Board }

const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

function BoardList() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listBoards(controller.signal)
      .then((data) => {
        setBoards(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : '목록을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  // 펼칠 때마다 상세 API를 호출한다(서버 조회수 +1). 접으면 호출하지 않는다.
  const toggle = (id: number) => {
    if (openId === id) {
      setOpenId(null)
      setDetail(null)
      return
    }
    setOpenId(id)
    setDetail({ status: 'loading' })
    getBoard(id)
      .then((board) => {
        // 그 사이 다른 글을 펼쳤다면 결과를 버린다.
        setOpenId((current) => {
          if (current === id) setDetail({ status: 'done', board })
          return current
        })
        setBoards((prev) =>
          prev.map((b) =>
            b.board_num === id ? { ...b, board_readcount: board.board_readcount } : b,
          ),
        )
      })
      .catch((e: unknown) => {
        setOpenId((current) => {
          if (current === id) {
            setDetail({
              status: 'error',
              message: e instanceof Error ? e.message : '본문을 불러오지 못했습니다.',
            })
          }
          return current
        })
      })
  }

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p role="alert">오류: {error}</p>
  if (boards.length === 0) return <p>게시글이 없습니다.</p>

  // 그룹(re_ref)별 답글 수. 답글이 있는 원글만 펼칠 수 있다.
  const replyCounts = new Map<number, number>()
  for (const b of boards) {
    if (b.re_lev > 0) replyCounts.set(b.re_ref, (replyCounts.get(b.re_ref) ?? 0) + 1)
  }

  const opened = boards.find((b) => b.board_num === openId)
  // 원글을 펼치면 같은 그룹(re_ref)의 답글 전체를 보여준다.
  const replies =
    opened && opened.re_lev === 0
      ? boards.filter((b) => b.re_ref === opened.re_ref && b.re_lev > 0)
      : []

  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>제목</th>
          <th>작성자</th>
          <th>조회수</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        {boards.map((b) => {
          const isOpen = b.board_num === openId
          const replyCount = b.re_lev === 0 ? (replyCounts.get(b.re_ref) ?? 0) : 0
          const expandable = replyCount > 0
          return (
            <Fragment key={b.board_num}>
              <tr className={isOpen ? 'board-row open' : 'board-row'}>
                <td style={{ paddingLeft: `${b.re_lev * 16}px` }}>
                  {expandable ? (
                    <button
                      type="button"
                      className="board-toggle"
                      aria-expanded={isOpen}
                      onClick={() => toggle(b.board_num)}
                    >
                      {isOpen ? '▾ ' : '▸ '}
                      {b.board_subject} ({replyCount})
                    </button>
                  ) : (
                    <span>
                      {b.re_lev > 0 ? '↳ ' : ''}
                      {b.board_subject}
                    </span>
                  )}
                </td>
                <td>{b.board_name}</td>
                <td>{b.board_readcount}</td>
                <td>{formatDate(b.board_date)}</td>
              </tr>
              {isOpen && (
                <tr className="board-detail">
                  <td colSpan={4}>
                    {detail?.status === 'loading' && <p>본문을 불러오는 중...</p>}
                    {detail?.status === 'error' && (
                      <p role="alert">오류: {detail.message}</p>
                    )}
                    {detail?.status === 'done' && (
                      <div className="board-content">
                        {detail.board.board_content || '(본문 없음)'}
                      </div>
                    )}
                    {replies.length > 0 && (
                      <div className="board-replies">
                        <h3>답글 {replies.length}개</h3>
                        <ul>
                          {replies.map((r) => (
                            <li
                              key={r.board_num}
                              style={{ marginLeft: `${(r.re_lev - 1) * 16}px` }}
                            >
                              <strong>{r.board_subject}</strong>
                              <span className="board-reply-meta">
                                {r.board_name} · {formatDate(r.board_date)}
                              </span>
                              <div className="board-content">
                                {r.board_content || '(본문 없음)'}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}

export default BoardList
