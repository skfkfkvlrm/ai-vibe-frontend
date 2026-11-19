import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminPage from './features/admin/AdminPage'
import { useAuth } from './features/auth/useAuth'
import BoardList from './features/board/BoardList'
import LoginPage from './features/auth/LoginPage'
import MyPage from './features/account/MyPage'
import ResetNoticeDialog from './features/account/ResetNoticeDialog'
import SignupPage from './features/auth/SignupPage'

function App() {
  const { member, ready, logout } = useAuth()
  const { pathname } = useLocation()
  const onAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')

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
                <Link className="button-link" to="/mypage" title="내 정보">
                  {member.name}님
                </Link>
                {member.role === 'ADMIN' && (
                  // 관리자 화면에서는 같은 자리가 게시글 목록으로 돌아가는 버튼이 된다(SPA 라우팅, 새로고침 없음).
                  <Link className="button-link" to={onAdminPage ? '/boards' : '/admin'}>
                    {onAdminPage ? '게시글 목록' : '관리자'}
                  </Link>
                )}
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
      <ResetNoticeDialog />
    </main>
  )
}

export default App
