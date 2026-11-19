import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/useAuth'
import {
  adminErrorMessage,
  banMember,
  getMembers,
  setRole,
  unbanMember,
  type AdminMember,
  type BanType,
} from './adminApi'

const BAN_TYPES: { value: BanType; label: string }[] = [
  { value: '1D', label: '1일' },
  { value: '7D', label: '7일' },
  { value: '30D', label: '30일' },
  { value: 'PERMANENT', label: '영구' },
  { value: 'UNTIL', label: '직접 지정' },
]

/** 역할·밴 해제처럼 확인 한 번이 필요한 행 작업. */
type RowAction = { id: number; kind: 'promote' | 'demote' | 'unban' }

function banText(m: AdminMember): string {
  if (m.status !== 'BANNED') return '정상'
  const until = m.banned_permanent ? '영구' : `~${(m.banned_until ?? '').replace('T', ' ').slice(0, 16)}`
  return `밴 (${until})`
}

function actionLabel(kind: RowAction['kind']): string {
  if (kind === 'promote') return 'ADMIN 승격'
  if (kind === 'demote') return 'ADMIN 해제'
  return '밴 해제'
}

export default function MembersPage() {
  const { member } = useAuth()
  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  // 확인 단계에 들어간 행 작업(승격·해제·밴 해제). 확인 버튼을 눌러야 서버에 보낸다.
  const [pending, setPending] = useState<RowAction | null>(null)
  // 밴 폼 대상 회원과 입력값. confirmingBan이 true이면 [취소][확인] 단계다.
  const [banTarget, setBanTarget] = useState<AdminMember | null>(null)
  const [banType, setBanType] = useState<BanType>('7D')
  const [banUntil, setBanUntil] = useState('')
  const [banReason, setBanReason] = useState('')
  const [confirmingBan, setConfirmingBan] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getMembers(controller.signal)
      .then(setMembers)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(adminErrorMessage(e))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  function replace(updated: AdminMember) {
    setMembers((list) => list.map((m) => (m.member_id === updated.member_id ? updated : m)))
  }

  /** 서버 호출을 실행하고 성공 여부를 돌려준다. 실패 문구는 error에 담는다. */
  async function run(work: () => Promise<AdminMember>, doneText: (m: AdminMember) => string): Promise<boolean> {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await work()
      replace(updated)
      setNotice(doneText(updated))
      return true
    } catch (e) {
      setError(adminErrorMessage(e))
      return false
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  async function confirmRowAction(action: RowAction) {
    if (action.kind === 'unban') {
      await run(() => unbanMember(action.id), (m) => `${m.login_id}님의 밴을 해제했습니다.`)
      return
    }
    const role = action.kind === 'promote' ? 'ADMIN' : 'USER'
    await run(() => setRole(action.id, role), (m) => `${m.login_id}님의 역할을 ${m.role}로 바꿨습니다.`)
  }

  function openBan(m: AdminMember) {
    setBanTarget(m)
    setBanType('7D')
    setBanUntil('')
    setBanReason('')
    setConfirmingBan(false)
    setPending(null)
    setError(null)
    setNotice(null)
  }

  async function onBanSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!banTarget) return
    // 첫 제출(브라우저 입력 검증 통과 후)은 확인 단계로만 넘기고, 확인 버튼의 제출에서 실제로 보낸다.
    if (!confirmingBan) {
      setConfirmingBan(true)
      return
    }
    const target = banTarget
    const ok = await run(
      () =>
        banMember(target.member_id, {
          type: banType,
          reason: banReason.trim(),
          until: banType === 'UNTIL' ? banUntil : undefined,
        }),
      (m) => `${m.login_id}님을 밴했습니다.`,
    )
    // 실패하면 폼을 열어 둔 채 확인 단계만 풀어 다시 고칠 수 있게 한다.
    if (ok) setBanTarget(null)
    setConfirmingBan(false)
  }

  return (
    <>
      <div className="page-head">
        <h1>회원 관리</h1>
      </div>
      {loading && <p>불러오는 중...</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}

      {!loading && (
        <div className="table-wrap">
          <table className="member-table">
            <thead>
              <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>이메일</th>
                <th>역할</th>
                <th>상태</th>
                <th>밴 사유</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isSelf = member?.member_id === m.member_id
                const isAdminRow = m.role === 'ADMIN'
                const confirming = pending?.id === m.member_id ? pending : null
                return (
                  <tr key={m.member_id}>
                    <td>{m.login_id}</td>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.role}</td>
                    <td>{banText(m)}</td>
                    <td>{m.status === 'BANNED' ? m.ban_reason : '-'}</td>
                    <td>
                      {confirming ? (
                        <div className="row-actions" role="group" aria-label="확인">
                          <span className="confirm-msg">{actionLabel(confirming.kind)}할까요?</span>
                          <button type="button" className="btn" disabled={busy} onClick={() => setPending(null)}>
                            취소
                          </button>
                          <button
                            type="button"
                            className="btn primary"
                            disabled={busy}
                            onClick={() => confirmRowAction(confirming)}
                          >
                            확인
                          </button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn"
                            disabled={busy || (isAdminRow && isSelf) || (!isAdminRow && m.status === 'BANNED')}
                            title={
                              isAdminRow && isSelf
                                ? '자기 자신은 해제할 수 없습니다.'
                                : !isAdminRow && m.status === 'BANNED'
                                  ? '밴을 먼저 해제해 주세요.'
                                  : undefined
                            }
                            onClick={() => setPending({ id: m.member_id, kind: isAdminRow ? 'demote' : 'promote' })}
                          >
                            {isAdminRow ? 'ADMIN 해제' : 'ADMIN 승격'}
                          </button>
                          {m.status === 'BANNED' ? (
                            <button
                              type="button"
                              className="btn"
                              disabled={busy}
                              onClick={() => setPending({ id: m.member_id, kind: 'unban' })}
                            >
                              밴 해제
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn"
                              disabled={busy || isAdminRow}
                              title={isAdminRow ? '관리자는 밴할 수 없습니다.' : undefined}
                              onClick={() => openBan(m)}
                            >
                              밴
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {banTarget && (
        <form className="auth-form ban-form" onSubmit={onBanSubmit}>
          <h2>{banTarget.login_id}님 밴</h2>
          <div className="auth-form-row">
            <label htmlFor="ban-type">기간</label>
            <select
              id="ban-type"
              value={banType}
              disabled={confirmingBan}
              onChange={(e) => setBanType(e.target.value as BanType)}
            >
              {BAN_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {banType === 'UNTIL' && (
            <div className="auth-form-row">
              <label htmlFor="ban-until">해제 시각</label>
              <input
                id="ban-until"
                type="datetime-local"
                required
                value={banUntil}
                disabled={confirmingBan}
                onChange={(e) => setBanUntil(e.target.value)}
              />
            </div>
          )}
          <div className="auth-form-row">
            <label htmlFor="ban-reason">사유</label>
            <input
              id="ban-reason"
              required
              maxLength={500}
              value={banReason}
              disabled={confirmingBan}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <div className="auth-form-actions">
            {confirmingBan ? (
              <>
                <span className="confirm-msg">정말 밴할까요?</span>
                <button type="button" className="btn" disabled={busy} onClick={() => setConfirmingBan(false)}>
                  취소
                </button>
                <button type="submit" className="btn primary" disabled={busy}>
                  확인
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn" onClick={() => setBanTarget(null)}>
                  닫기
                </button>
                <button type="submit" className="btn primary">
                  밴
                </button>
              </>
            )}
          </div>
        </form>
      )}
    </>
  )
}
