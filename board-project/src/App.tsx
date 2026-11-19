import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import BoardList from './BoardList'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'

function App() {
  const { member, ready, logout } = useAuth()

  return (
    <main>
      <header className="app-header">
        <h1>
          <Link to="/boards">게시판</Link>
        </h1>
        <div className="auth-buttons">
          {ready &&
            (member ? (
              <>
                <span>{member.name}님</span>
                <button type="button" onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link className="button-link" to="/login">
                  로그인
                </Link>
                <Link className="button-link" to="/signup">
                  회원가입
                </Link>
              </>
            ))}
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/boards" replace />} />
        <Route path="/boards" element={<BoardList />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </main>
  )
}

export default App
