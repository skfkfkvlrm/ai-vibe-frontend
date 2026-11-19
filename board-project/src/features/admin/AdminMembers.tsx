import { useEffect, useId, useState, type FormEvent } from 'react'
import {
  adminErrorMessage,
  banMember,
  listMembers,
  resetMemberPassword,
  unbanMember,
  type AdminMember,
  type BanType,
} from './api'
import Loading from '../../shared/Loading'
import '../../App.css'

const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

const BAN_OPTIONS: { value: BanType; label: string }[] = [
  { value: '1D', label: '1일' },
  { value: '7D', label: '7일' },
  { value: '30D', label: '30일' },
  { value: 'PERMANENT', label: '영구' },
  { value: 'UNTIL', label: '직접 입력' },
]

function statusText(m: AdminMember): string {
  if (m.status === 'WITHDRAWN') return `탈퇴 (${formatDate(m.withdrawn_at)})`
  if (m.status === 'BANNED') {
    const until = m.banned_permanent ? '영구' : `${formatDate(m.banned_until)}까지`
    return `밴 · ${until}`
  }
  return m.password_reset_pending ? '정상 (임시 비밀번호 사용 중)' : '정상'
}

/** 밴 입력 폼: 사유(필수) + 기간 프리셋(1일/7일/30일/영구) 또는 직접 입력한 해제 시각. */
function BanForm({
  member,
  onDone,
  onCancel,
}: {
  member: AdminMember
  onDone: () => void
  onCancel: () => void
}) {
  const uid = useId()
  const [reason, setReason] = useState('')
  const [type, setType] = useState<BanType>('7D')
  const [until, setUntil] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return setError('밴 사유를 입력해 주세요.')
    if (type === 'UNTIL') {
      if (!until) return setError('해제 날짜·시각을 입력해 주세요.')
      if (new Date(until).getTime() <= Date.now()) return setError('해제 시각은 현재보다 미래여야 합니다.')
    }
    setSubmitting(true)
    setError(null)
    try {
      await banMember(member.member_id, {
        reason: reason.trim(),
        type,
        ...(type === 'UNTIL' ? { until } : {}),
      })
      onDone()
    } catch (err) {
      setError(adminErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <form className="board-form" onSubmit={handleSubmit}>
      <h3>
        {member.login_id} ({member.name}) 밴
      </h3>
      <div className="board-form-row">
        <label htmlFor={`${uid}-reason`}>사유</label>
        <textarea
          id={`${uid}-reason`}
          rows={3}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <fieldset className="admin-ban-types">
        <legend>기간</legend>
        {BAN_OPTIONS.map((o) => (
          <label key={o.value}>
            <input
              type="radio"
              name={`${uid}-type`}
              value={o.value}
              checked={type === o.value}
              onChange={() => setType(o.value)}
            />
            {o.label}
          </label>
        ))}
      </fieldset>
      {type === 'UNTIL' && (
        <div className="board-form-row">
          <label htmlFor={`${uid}-until`}>해제 시각</label>
          <input
            id={`${uid}-until`}
            type="datetime-local"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
          />
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="board-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '처리 중...' : '밴 적용'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          취소
        </button>
      </div>
    </form>
  )
}

/** 회원 목록(비밀번호 제외)과 밴·밴 해제·비밀번호 초기화. 관리자·탈퇴 회원은 대상이 아니다. */
function AdminMembers() {
  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [banId, setBanId] = useState<number | null>(null)
  const [confirmResetId, setConfirmResetId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  // 임시 비밀번호는 이 화면 상태에만 두고, 닫으면 다시 볼 수 없다.
  const [issued, setIssued] = useState<{ loginId: string; password: string } | null>(null)

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

  const reload = async () => {
    try {
      setMembers(await listMembers())
    } catch (e) {
      setNotice(adminErrorMessage(e))
    }
  }

  const handleUnban = async (m: AdminMember) => {
    setBusy(true)
    setNotice(null)
    try {
      await unbanMember(m.member_id)
      await reload()
    } catch (e) {
      setNotice(adminErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async (m: AdminMember) => {
    setBusy(true)
    setNotice(null)
    try {
      const res = await resetMemberPassword(m.member_id)
      setIssued({ loginId: m.login_id, password: res.temporary_password })
      setConfirmResetId(null)
      await reload()
    } catch (e) {
      setNotice(adminErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const copyPassword = async () => {
    if (!issued) return
    try {
      await navigator.clipboard.writeText(issued.password)
      setNotice('임시 비밀번호를 복사했습니다.')
    } catch {
      setNotice('복사하지 못했습니다. 직접 선택해서 복사해 주세요.')
    }
  }

  if (loading) return <Loading />
  if (error) return <p role="alert">오류: {error}</p>
  if (members.length === 0) return <p>회원이 없습니다.</p>

  const banTarget = members.find((m) => m.member_id === banId) ?? null

  return (
    <>
      {issued && (
        <div className="admin-issued" role="status">
          <p>
            <strong>{issued.loginId}</strong> 님의 임시 비밀번호: <code>{issued.password}</code>
          </p>
          <p className="admin-warning">
            이 창을 닫으면 다시 볼 수 없습니다. 안전한 방법으로 회원에게 직접 전달해 주세요. 이 비밀번호로 로그인하면
            변경 안내가 표시되고, 기존 로그인은 모두 해제되었습니다.
          </p>
          <div className="board-form-actions">
            <button type="button" onClick={copyPassword}>
              복사
            </button>
            <button type="button" onClick={() => setIssued(null)}>
              닫기
            </button>
          </div>
        </div>
      )}
      {notice && <p role="alert">{notice}</p>}
      {banTarget && (
        <BanForm
          key={banTarget.member_id}
          member={banTarget}
          onCancel={() => setBanId(null)}
          onDone={async () => {
            setBanId(null)
            await reload()
          }}
        />
      )}
      <table className="board-table">
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>이메일</th>
            <th>권한</th>
            <th>상태</th>
            <th>가입일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const manageable = m.role !== 'ADMIN' && m.status !== 'WITHDRAWN'
            return (
              <tr key={m.member_id}>
                <td>{m.login_id}</td>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.role}</td>
                <td>
                  {statusText(m)}
                  {m.status === 'BANNED' && m.ban_reason && (
                    <div className="board-reply-meta">사유: {m.ban_reason}</div>
                  )}
                </td>
                <td>{formatDate(m.created_at)}</td>
                <td>
                  {!manageable ? (
                    '-'
                  ) : confirmResetId === m.member_id ? (
                    <span className="admin-confirm">
                      <button type="button" disabled={busy} onClick={() => handleReset(m)}>
                        {busy ? '처리 중...' : '초기화 확인'}
                      </button>
                      <button type="button" disabled={busy} onClick={() => setConfirmResetId(null)}>
                        취소
                      </button>
                    </span>
                  ) : (
                    <span className="admin-confirm">
                      {m.status === 'BANNED' ? (
                        <button type="button" disabled={busy} onClick={() => handleUnban(m)}>
                          밴 해제
                        </button>
                      ) : (
                        <button type="button" disabled={busy} onClick={() => setBanId(m.member_id)}>
                          밴
                        </button>
                      )}
                      <button type="button" disabled={busy} onClick={() => setConfirmResetId(m.member_id)}>
                        비밀번호 초기화
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export default AdminMembers
