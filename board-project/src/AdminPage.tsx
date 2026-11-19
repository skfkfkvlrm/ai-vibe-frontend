import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  adminErrorMessage,
  listDeletedBoards,
  listMembers,
  restoreBoard,
  type DeletedBoard,
} from './api/admin'
import type { Member } from './api/auth'
import { useAuth } from './auth/useAuth'
import Loading from './Loading'
import './App.css'

const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

type Tab = 'deleted' | 'members'

/** 삭제된 글·답글 목록. 한 건씩 복구한다(원글을 복구해도 답글은 그대로). */
function DeletedBoards() {
  const [items, setItems] = useState<DeletedBoard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listDeletedBoards(controller.signal)
      .then((data) => {
        setItems(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(adminErrorMessage(e))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const restore = async (id: number) => {
    setBusy(true)
    setNotice(null)
    try {
      await restoreBoard(id)
      setItems(await listDeletedBoards())
      setConfirmId(null)
    } catch (e) {
      setNotice(adminErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <p role="alert">오류: {error}</p>
  if (items.length === 0) return <p>삭제된 글이 없습니다.</p>

  return (
    <>
      {notice && <p role="alert">{notice}</p>}
      <table className="board-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>제목</th>
            <th>작성자</th>
            <th>삭제 일시</th>
            <th>복구</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.board_num}>
              <td>{b.re_lev > 0 ? '답글' : '원글'}</td>
              <td>
                <details>
                  <summary>{b.board_subject}</summary>
                  <div className="board-content">{b.board_content || '(본문 없음)'}</div>
                  {b.re_lev > 0 && b.root_deleted && (
                    <p className="admin-warning">
                      원글이 삭제 상태라, 이 답글만 복구해도 게시판 화면에는 보이지 않습니다.
                    </p>
                  )}
                </details>
              </td>
              <td>
                {b.board_name}
                {b.member_id === null ? ' (비회원)' : ''}
              </td>
              <td>{formatDate(b.deleted_at)}</td>
              <td>
                {confirmId === b.board_num ? (
                  <span className="admin-confirm">
                    <button type="button" disabled={busy} onClick={() => restore(b.board_num)}>
                      {busy ? '복구 중...' : '복구 확인'}
                    </button>
                    <button type="button" disabled={busy} onClick={() => setConfirmId(null)}>
                      취소
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmId(b.board_num)}>
                    복구
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

/** 회원 목록(비밀번호 제외). */
function MemberList() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listMembers(controller.signal)
      .then((data) => {
        setMembers(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(adminErrorMessage(e))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  if (loading) return <Loading />
  if (error) return <p role="alert">오류: {error}</p>
  if (members.length === 0) return <p>회원이 없습니다.</p>

  return (
    <table className="board-table">
      <thead>
        <tr>
          <th>아이디</th>
          <th>이름</th>
          <th>이메일</th>
          <th>권한</th>
          <th>가입일</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.member_id}>
            <td>{m.login_id}</td>
            <td>{m.name}</td>
            <td>{m.email}</td>
            <td>{m.role}</td>
            <td>{formatDate(m.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** 관리자 화면. 화면 접근 제한은 편의일 뿐이며 실제 권한은 서버가 DB의 role로 판정한다. */
function AdminPage() {
  const { member, ready } = useAuth()
  const [tab, setTab] = useState<Tab>('deleted')

  if (!ready) return null
  if (!member || member.role !== 'ADMIN') return <Navigate to="/boards" replace />

  return (
    <section>
      <h2>관리자</h2>
      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'deleted'}
          onClick={() => setTab('deleted')}
        >
          삭제된 글
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'members'}
          onClick={() => setTab('members')}
        >
          회원 목록
        </button>
      </div>
      {tab === 'deleted' ? <DeletedBoards /> : <MemberList />}
    </section>
  )
}

export default AdminPage
