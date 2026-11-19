import { useEffect, useState } from 'react'
import { listBoards, type Board } from './api/boards'

function BoardList() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p role="alert">오류: {error}</p>
  if (boards.length === 0) return <p>게시글이 없습니다.</p>

  return (
    <table>
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>작성자</th>
          <th>조회수</th>
          <th>작성일</th>
        </tr>
      </thead>
      <tbody>
        {boards.map((b) => (
          <tr key={b.board_num}>
            <td>{b.board_num}</td>
            <td style={{ paddingLeft: `${b.re_lev * 16}px` }}>
              {b.re_lev > 0 ? '↳ ' : ''}
              {b.board_subject}
            </td>
            <td>{b.board_name}</td>
            <td>{b.board_readcount}</td>
            <td>{b.board_date?.slice(0, 16).replace('T', ' ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default BoardList
