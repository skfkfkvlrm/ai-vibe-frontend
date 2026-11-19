import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  MAX_QUERY_LENGTH,
  PAGE_SIZES,
  createBoard,
  deleteBoard,
  errorMessage,
  getBoard,
  listBoards,
  replyBoard,
  updateBoard,
  type Board,
  type BoardInput,
  type BoardPage,
  type ListParams,
  type PageSize,
  type SearchField,
} from './api'
import { useAuth } from '../auth/useAuth'
import BoardForm from './BoardForm'
import Loading from '../../shared/Loading'
import Pager from './Pager'
import PostBlock, { type ActiveForm } from './PostBlock'
import { hasViewed, markViewed } from './viewed'
import '../../App.css'

type Detail =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; board: Board }

const DEFAULT_SIZE: PageSize = 10
const DEFAULT_FIELD: SearchField = 'TITLE_CONTENT'

const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

/** 주소의 쿼리(?page=&size=&field=&q=)를 목록 조건으로 읽는다. 주소의 page는 1부터, 잘못된 값은 기본값으로 처리한다. */
function parseParams(sp: URLSearchParams): ListParams {
  const pageNumber = Number(sp.get('page'))
  const sizeNumber = Number(sp.get('size'))
  return {
    page: Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber - 1 : 0,
    size: (PAGE_SIZES as readonly number[]).includes(sizeNumber) ? (sizeNumber as PageSize) : DEFAULT_SIZE,
    field: sp.get('field') === 'AUTHOR' ? 'AUTHOR' : DEFAULT_FIELD,
    q: (sp.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH),
  }
}

/** 기본값이 아닌 조건만 주소에 남긴다. */
function buildSearch(p: ListParams): URLSearchParams {
  const sp = new URLSearchParams()
  if (p.page > 0) sp.set('page', String(p.page + 1))
  if (p.size !== DEFAULT_SIZE) sp.set('size', String(p.size))
  if (p.q) {
    sp.set('field', p.field)
    sp.set('q', p.q)
  }
  return sp
}

/** 검색 줄. 입력 중인 값은 이 컴포넌트가 들고 있고, 주소의 조건이 바뀌면 key가 바뀌어 새로 만들어진다. */
function SearchBar({
  field,
  q,
  size,
  onSearch,
  onReset,
  onSize,
}: {
  field: SearchField
  q: string
  size: PageSize
  onSearch: (field: SearchField, q: string) => void
  onReset: () => void
  onSize: (size: PageSize) => void
}) {
  const [draftField, setDraftField] = useState<SearchField>(field)
  const [draftQ, setDraftQ] = useState(q)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(draftField, draftQ.trim())
  }

  return (
    <form className="board-search" onSubmit={submit} role="search">
      <select
        aria-label="검색 조건"
        value={draftField}
        onChange={(e) => setDraftField(e.target.value as SearchField)}
      >
        <option value="TITLE_CONTENT">제목+내용</option>
        <option value="AUTHOR">작성자</option>
      </select>
      <input
        type="search"
        aria-label="검색어"
        value={draftQ}
        maxLength={MAX_QUERY_LENGTH}
        placeholder="검색어"
        onChange={(e) => setDraftQ(e.target.value)}
      />
      <button type="submit">검색</button>
      {q && (
        <button type="button" onClick={onReset}>
          초기화
        </button>
      )}
      <select
        aria-label="페이지 크기"
        value={size}
        onChange={(e) => onSize(Number(e.target.value) as PageSize)}
      >
        {PAGE_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}개씩
          </option>
        ))}
      </select>
    </form>
  )
}

function BoardList() {
  const { member } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => parseParams(searchParams), [searchParams])
  const { page, size, field, q } = params
  // 목록 요청을 구분하는 키. 조건이 바뀌거나 reload가 오르면 새로 불러온다.
  const [reload, setReload] = useState(0)
  const key = `${page}|${size}|${field}|${q}|${reload}`

  const [result, setResult] = useState<{ key: string; page: BoardPage } | null>(null)
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [active, setActive] = useState<ActiveForm | null>(null)

  const current = result?.key === key ? result.page : null
  const currentError = failure?.key === key ? failure.message : null
  const loading = !current && !currentError
  const boards = current?.items ?? []

  useEffect(() => {
    const controller = new AbortController()
    const requestKey = key
    listBoards({ page, size, field, q }, controller.signal)
      .then((data) => {
        if (data.total_pages > 0 && page >= data.total_pages) {
          // 마지막 페이지의 글을 모두 지우는 등으로 현재 페이지가 없어졌으면 마지막 페이지로 옮긴다.
          setSearchParams(buildSearch({ page: data.total_pages - 1, size, field, q }), { replace: true })
          return
        }
        setResult({ key: requestKey, page: data })
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setFailure({ key: requestKey, message: errorMessage(e) })
      })
    return () => controller.abort()
  }, [key, page, size, field, q, setSearchParams])

  // 조건을 바꾸면 주소를 갱신하고 열려 있던 글·폼을 닫는다.
  const go = (next: Partial<ListParams>) => {
    setSearchParams(buildSearch({ ...params, ...next }))
    setOpenId(null)
    setDetail(null)
    setActive(null)
  }

  // 펼칠 때마다 상세 API를 호출한다. 이 탭에서 처음 여는 글만 서버 조회수를 올리고, 다시 열면 올리지 않는다(count=false).
  const toggle = (id: number) => {
    setActive(null)
    if (openId === id) {
      setOpenId(null)
      setDetail(null)
      return
    }
    setOpenId(id)
    setDetail({ status: 'loading' })
    const counted = !hasViewed(id)
    getBoard(id, { count: counted })
      .then((board) => {
        if (counted) markViewed(id)
        // 그 사이 다른 글을 펼쳤다면 결과를 버린다.
        setOpenId((currentId) => {
          if (currentId === id) setDetail({ status: 'done', board })
          return currentId
        })
        setResult((prev) =>
          prev && {
            ...prev,
            page: {
              ...prev.page,
              items: prev.page.items.map((b) =>
                b.board_num === id ? { ...b, board_readcount: board.board_readcount } : b,
              ),
            },
          },
        )
      })
      .catch((e: unknown) => {
        setOpenId((currentId) => {
          if (currentId === id) setDetail({ status: 'error', message: errorMessage(e) })
          return currentId
        })
      })
  }

  // 쓰기 성공 후: 폼을 닫고 현재 페이지를 다시 받는다(목록 조회는 조회수를 올리지 않는다).
  const refresh = () => {
    setActive(null)
    setReload((r) => r + 1)
  }

  // 새 원글은 최신 글이 보이도록 검색을 풀고 1페이지로 이동한다.
  const handleCreate = async (input: BoardInput) => {
    await createBoard(input)
    setSearchParams(buildSearch({ ...params, page: 0, field: DEFAULT_FIELD, q: '' }))
    setOpenId(null)
    setDetail(null)
    refresh()
  }

  const handleReply = async (parentId: number, input: BoardInput) => {
    await replyBoard(parentId, input)
    refresh()
  }

  const handleEdit = async (id: number, input: BoardInput) => {
    const updated = await updateBoard(id, input)
    if (id === openId) setDetail({ status: 'done', board: updated })
    refresh()
  }

  const handleDelete = async (id: number, pass?: string) => {
    await deleteBoard(id, pass)
    if (id === openId) {
      setOpenId(null)
      setDetail(null)
    }
    refresh()
  }

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
      <SearchBar
        key={`${field}|${q}|${size}`}
        field={field}
        q={q}
        size={size}
        onSearch={(f, text) => go({ field: f, q: text, page: 0 })}
        onReset={() => go({ field: DEFAULT_FIELD, q: '', page: 0 })}
        onSize={(s) => go({ size: s, page: 0 })}
      />
      {currentError && <p role="alert">오류: {currentError}</p>}
      {loading && <Loading />}
      {current && topLevel.length === 0 && <p>{q ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}</p>}
      {current && topLevel.length > 0 && (
        <>
          <p className="board-summary">
            {q ? '검색 결과' : '전체'} {current.total_elements}건 · {current.page + 1}/{current.total_pages} 페이지
          </p>
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
          <Pager page={current.page} totalPages={current.total_pages} onChange={(p) => go({ page: p })} />
        </>
      )}
    </>
  )
}

export default BoardList
