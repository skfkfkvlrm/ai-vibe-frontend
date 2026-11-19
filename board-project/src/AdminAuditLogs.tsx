import { useEffect, useState } from 'react'
import { adminErrorMessage, listAuditLogs, type AuditLog } from './api/admin'
import Loading from './Loading'
import './App.css'

const formatDate = (d: string) => d.slice(0, 19).replace('T', ' ')

const ACTION_LABELS: Record<string, string> = {
  BOARD_RESTORE: '글 복구',
  BOARD_EDIT: '관리자 글 수정',
  BOARD_DELETE: '관리자 글 삭제',
  MEMBER_BAN: '회원 밴',
  MEMBER_UNBAN: '밴 해제',
  MEMBER_PASSWORD_RESET: '비밀번호 초기화',
  LOGIN_LOCKED: '로그인 잠금',
}

const TARGET_LABELS: Record<string, string> = { BOARD: '글', MEMBER: '회원', LOGIN: '로그인' }

/** 관리자 작업·로그인 잠금 기록. 조회 전용(최신 200건). */
function AdminAuditLogs() {
  const [items, setItems] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listAuditLogs(controller.signal)
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

  if (loading) return <Loading />
  if (error) return <p role="alert">오류: {error}</p>
  if (items.length === 0) return <p>기록이 없습니다.</p>

  return (
    <>
      <p>최근 {items.length}건(최신순, 조회 전용)</p>
      <table className="board-table">
        <thead>
          <tr>
            <th>일시</th>
            <th>수행자</th>
            <th>동작</th>
            <th>대상</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.audit_id}>
              <td>{formatDate(l.created_at)}</td>
              <td>{l.admin_login_id ?? '(시스템)'}</td>
              <td>{ACTION_LABELS[l.action] ?? l.action}</td>
              <td>
                {TARGET_LABELS[l.target_type] ?? l.target_type}
                {l.target_id !== null ? ` #${l.target_id}` : ''}
              </td>
              <td>{l.detail ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default AdminAuditLogs
