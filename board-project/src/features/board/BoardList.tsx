import { Fragment, useEffect, useState } from 'react'
import {
  createBoard,
  deleteBoard,
  errorMessage,
  getBoard,
  listBoards,
  replyBoard,
  updateBoard,
  type Board,
  type BoardInput,
} from './api'
import { useAuth } from '../auth/useAuth'
import BoardForm from './BoardForm'
import Loading from '../../shared/Loading'
import PostBlock, { type ActiveForm } from './PostBlock'
import '../../App.css'

type Detail =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; board: Board }

const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

function BoardList() {
  const { member } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [active, setActive] = useState<ActiveForm | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listBoards(controller.signal)
      .then((data) => {
        setBoards(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(errorMessage(e))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  // 펼칠 때마다 상세 API를 호출한다(서버 조회수 +1). 접으면 호출하지 않는다.
  const toggle = (id: number) => {
    setActive(null)
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
          if (current === id) setDetail({ status: 'error', message: errorMessage(e) })
          return current
        })
      })
  }

  // 쓰기 성공 후: 폼을 닫고 목록을 다시 받는다(목록 조회는 조회수를 올리지 않는다).
  const afterWrite = async () => {
    setActive(null)
    try {
      setBoards(await listBoards())
      setNotice(null)
    } catch {
      setNotice('저장은 완료되었지만 목록을 새로 불러오지 못했습니다. 새로고침해 주세요.')
    }
  }

  const handleCreate = async (input: BoardInput) => {
    await createBoard(input)
    await afterWrite()
  }

  const handleReply = async (parentId: number, input: BoardInput) => {
    await replyBoard(parentId, input)
    await afterWrite()
  }

  const handleEdit = async (id: number, input: BoardInput) => {
    const updated = await updateBoard(id, input)
    if (id === openId) setDetail({ status: 'done', board: updated })
    await afterWrite()
  }

  const handleDelete = async (id: number, pass?: string) => {
    await deleteBoard(id, pass)
    if (id === openId) {
      setOpenId(null)
      setDetail(null)
    }
    await afterWrite()
  }

  if (loading) return <Loading />
  if (error) return <p role="alert">오류: {error}</p>

  // 목록에는 원글만 표시하고, 답글은 원글을 펼쳤을 때만 보여준다.
  const topLevel = boards.filter((b) => b.re_lev === 0)

  // 그룹(re_ref)별 답글 수
  const replyCounts = new Map<number, number>()
  for (const b of boards) {
    if (b.re_lev > 0) replyCounts.set(b.re_ref, (replyCounts.get(b.re_ref) ?? 0) + 1)
  }

  const opened = topLevel.find((b) => b.board_num === openId)
  // 원글을 펼치면 같은 그룹(re_ref)의 답글 전체를 보여준다.
  const replies = opened
    ? boards.filter((b) => b.re_ref === opened.re_ref && b.re_lev > 0)
    : []

  const postProps = {
    member,
    active,
    onActive: setActive,
    onEdit: handleEdit,
    onReply: handleReply,
    onDelete: handleDelete,
  }

  return (
    <>
      <div className="board-toolbar">
        <button
          type="button"
          aria-pressed={active?.kind === 'create'}
          onClick={() => setActive(active?.kind === 'create' ? null : { kind: 'create' })}
        >
          글쓰기
        </button>
      </div>
      {active?.kind === 'create' && (
        <BoardForm
          // 로그인 상태가 바뀌면 폼을 새로 만들어 입력란 구성을 맞춘다.
          key={member ? 'member' : 'guest'}
          title="새 글 작성"
          submitLabel="등록"
          authed={member ? { name: member.name } : undefined}
          onSubmit={handleCreate}
          onCancel={() => setActive(null)}
        />
      )}
      {notice && <p role="alert">{notice}</p>}
      {topLevel.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
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
            {topLevel.map((b) => {
              const isOpen = b.board_num === openId
              const replyCount = replyCounts.get(b.re_ref) ?? 0
              return (
                <Fragment key={b.board_num}>
                  <tr className={isOpen ? 'board-row open' : 'board-row'}>
                    <td>
                      <button
                        type="button"
                        className="board-toggle"
                        aria-expanded={isOpen}
                        onClick={() => toggle(b.board_num)}
                      >
                        {isOpen ? '▾ ' : '▸ '}
                        {b.board_subject}
                        {replyCount > 0 ? ` (${replyCount})` : ''}
                      </button>
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
                          <PostBlock
                            board={detail.board}
                            content={detail.board.board_content}
                            {...postProps}
                          />
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
                                  <PostBlock board={r} content={r.board_content} {...postProps} />
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
      )}
    </>
  )
}

export default BoardList
