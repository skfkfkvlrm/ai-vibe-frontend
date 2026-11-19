import { useId, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { authErrorMessage, signup } from './api'
import { useAuth } from './useAuth'

// 백엔드(MemberRules)와 같은 규칙. 최종 검증은 서버가 한다.
const LOGIN_ID = /^[a-z0-9_]{4,20}$/
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const MIN_PASSWORD = 8
const MAX_PASSWORD_BYTES = 72

function validate(v: {
  loginId: string
  password: string
  passwordConfirm: string
  name: string
  email: string
}): string | null {
  if (!LOGIN_ID.test(v.loginId)) return '아이디는 영문 소문자·숫자·_ 4~20자로 입력해 주세요.'
  if (v.password.length < MIN_PASSWORD) return '비밀번호는 8자 이상이어야 합니다.'
  if (new TextEncoder().encode(v.password).length > MAX_PASSWORD_BYTES) {
    return '비밀번호가 너무 깁니다.'
  }
  if (v.password !== v.passwordConfirm) return '비밀번호 확인이 일치하지 않습니다.'
  if (!v.name.trim() || v.name.trim().length > 100) return '이름을 입력해 주세요.'
  if (!EMAIL.test(v.email.trim()) || v.email.trim().length > 200) {
    return '이메일 형식이 올바르지 않습니다.'
  }
  return null
}

function SignupPage() {
  const uid = useId()
  const navigate = useNavigate()
  const { member, ready } = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!ready) return null
  if (member) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const message = validate({ loginId, password, passwordConfirm, name, email })
    if (message) {
      setError(message)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await signup({
        login_id: loginId,
        password,
        name: name.trim(),
        email: email.trim(),
      })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(authErrorMessage(err, 'signup'))
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-id`}>아이디</label>
        <input
          id={`${uid}-id`}
          autoComplete="username"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-pw`}>비밀번호</label>
        <input
          id={`${uid}-pw`}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-pw2`}>비밀번호 확인</label>
        <input
          id={`${uid}-pw2`}
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-name`}>이름</label>
        <input
          id={`${uid}-name`}
          autoComplete="name"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="auth-form-row">
        <label htmlFor={`${uid}-email`}>이메일</label>
        <input
          id={`${uid}-email`}
          type="email"
          autoComplete="email"
          value={email}
          maxLength={200}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="auth-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? '가입 중...' : '가입하기'}
        </button>
        <Link to="/login">로그인으로</Link>
      </div>
    </form>
  )
}

export default SignupPage
