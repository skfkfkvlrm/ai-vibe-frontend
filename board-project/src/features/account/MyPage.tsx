import { useEffect, useId, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  accountErrorMessage,
  changePassword,
  myPosts,
  updateProfile,
  withdraw,
} from './api'
import type { Board } from '../board/api'
import { useAuth } from '../auth/useAuth'
import Loading from '../../shared/Loading'
import '../../App.css'

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const formatDate = (d: string | null) => d?.slice(0, 16).replace('T', ' ') ?? ''

/** 아이디(읽기 전용)·이름·이메일 수정. 이름을 바꾸면 이미 쓴 글의 작성자명도 함께 바뀐다. */
function ProfileSection() {
  const uid = useId()
  const { member, applyMember } = useAuth()
  const [name, setName] = useState(member?.name ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  if (!member) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setMessage({ ok: false, text: '이름을 입력해 주세요.' })
    if (!EMAIL.test(email.trim())) return setMessage({ ok: false, text: '이메일 형식이 올바르지 않습니다.' })
    const changes: { name?: string; email?: string } = {}
    if (name.trim() !== member.name) changes.name = name.trim()
    if (email.trim().toLowerCase() !== member.email) changes.email = email.trim()
    if (!changes.name && !changes.email) return setMessage({ ok: false, text: '변경된 내용이 없습니다.' })

    setSubmitting(true)
    setMessage(null)
    try {
      const updated = await updateProfile(changes)
      applyMember(updated)
      setName(updated.name)
      setEmail(updated.email)
      setMessage({
        ok: true,
        text: changes.name
          ? '저장되었습니다. 이미 쓴 글의 작성자명도 새 이름으로 바뀌었습니다.'
          : '저장되었습니다.',
      })
    } catch (err) {
      setMessage({ ok: false, text: accountErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form mypage-section" onSubmit={handleSubmit}>
      <h3>내 정보</h3>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-id`}>아이디</label>
        <input id={`${uid}-id`} value={member.login_id} readOnly />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-name`}>이름</label>
        <input id={`${uid}-name`} value={name} maxLength={100} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-email`}>이메일</label>
        <input
          id={`${uid}-email`}
          type="email"
          value={email}
          maxLength={200}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <span className="auth-form-label">가입일</span>
        <span>{formatDate(member.created_at)}</span>
      </div>
      {message && <p role={message.ok ? 'status' : 'alert'}>{message.text}</p>}
      <div className="auth-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}

/** 비밀번호 변경. 성공하면 다른 기기의 로그인은 모두 해제되고 현재 로그인은 새 토큰으로 이어진다. */
function PasswordSection() {
  const uid = useId()
  const { member, applyToken } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!current) return setMessage({ ok: false, text: '현재 비밀번호를 입력해 주세요.' })
    if (next.length < 8) return setMessage({ ok: false, text: '새 비밀번호는 8자 이상이어야 합니다.' })
    if (new TextEncoder().encode(next).length > 72) {
      return setMessage({ ok: false, text: '새 비밀번호가 너무 깁니다.' })
    }
    if (next !== confirm) return setMessage({ ok: false, text: '새 비밀번호 확인이 일치하지 않습니다.' })
    if (next === current) return setMessage({ ok: false, text: '새 비밀번호는 현재 비밀번호와 달라야 합니다.' })

    setSubmitting(true)
    setMessage(null)
    try {
      const token = await changePassword(current, next)
      await applyToken(token.access_token)
      setCurrent('')
      setNext('')
      setConfirm('')
      setMessage({ ok: true, text: '비밀번호가 변경되었습니다. 다른 기기의 로그인은 모두 해제되었습니다.' })
    } catch (err) {
      setMessage({ ok: false, text: accountErrorMessage(err) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form mypage-section" onSubmit={handleSubmit}>
      <h3>비밀번호 변경</h3>
      {member?.password_reset_pending && (
        <p role="alert" className="admin-warning">
          관리자가 발급한 임시 비밀번호를 사용 중입니다. 새 비밀번호로 변경해 주세요.
        </p>
      )}
      <div className="auth-form-row">
        <label htmlFor={`${uid}-cur`}>현재 비밀번호</label>
        <input
          id={`${uid}-cur`}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-new`}>새 비밀번호</label>
        <input
          id={`${uid}-new`}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-conf`}>새 비밀번호 확인</label>
        <input
          id={`${uid}-conf`}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {message && <p role={message.ok ? 'status' : 'alert'}>{message.text}</p>}
      <div className="auth-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '변경 중...' : '비밀번호 변경'}
        </button>
      </div>
    </form>
  )
}

/** 내가 쓴 글·답글(삭제된 글 제외). */
function MyPosts() {
  const [posts, setPosts] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    myPosts(controller.signal)
      .then((data) => {
        setPosts(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(accountErrorMessage(e))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return (
    <section className="mypage-section">
      <h3>내가 쓴 글</h3>
      {loading ? (
        <Loading />
      ) : error ? (
        <p role="alert">오류: {error}</p>
      ) : posts.length === 0 ? (
        <p>작성한 글이 없습니다.</p>
      ) : (
        <table className="board-table">
          <thead>
            <tr>
              <th>구분</th>
              <th>제목</th>
              <th>조회수</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.board_num}>
                <td>{p.re_lev > 0 ? '답글' : '원글'}</td>
                <td>{p.board_subject}</td>
                <td>{p.board_readcount}</td>
                <td>{formatDate(p.board_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

/** 회원 탈퇴. 개인정보는 익명화되고 쓴 글은 '탈퇴한 회원' 이름으로 남으며 되돌릴 수 없다. */
function WithdrawSection() {
  const uid = useId()
  const navigate = useNavigate()
  const { member, logout } = useAuth()
  const [agree, setAgree] = useState(false)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = member?.role === 'ADMIN'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!agree) return setError('안내 내용에 동의해 주세요.')
    if (!password) return setError('비밀번호를 입력해 주세요.')
    setSubmitting(true)
    setError(null)
    try {
      await withdraw(password)
      logout()
      navigate('/boards', { replace: true })
    } catch (err) {
      setError(accountErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <section className="mypage-section">
      <details>
        <summary>회원 탈퇴</summary>
        {isAdmin ? (
          <p>관리자 계정은 탈퇴할 수 없습니다.</p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <p className="admin-warning">
              탈퇴하면 아이디·이메일·이름이 삭제(익명화)되어 되돌릴 수 없습니다. 작성한 글과 답글은 작성자명
              &quot;탈퇴한 회원&quot;으로 남습니다.
            </p>
            <label className="mypage-agree">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              위 내용을 확인했으며 탈퇴에 동의합니다.
            </label>
            <div className="auth-form-row">
              <label htmlFor={`${uid}-pw`}>비밀번호</label>
              <input
                id={`${uid}-pw`}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p role="alert">{error}</p>}
            <div className="auth-form-actions">
              <button type="submit" disabled={submitting || !agree}>
                {submitting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </form>
        )}
      </details>
    </section>
  )
}

/** 내 정보 페이지. 로그인한 회원만 볼 수 있다. */
function MyPage() {
  const { member, ready } = useAuth()

  if (!ready) return null
  if (!member) return <Navigate to="/login" replace />

  return (
    <section>
      <h2>내 정보</h2>
      <ProfileSection />
      <PasswordSection />
      <MyPosts />
      <WithdrawSection />
    </section>
  )
}

export default MyPage
