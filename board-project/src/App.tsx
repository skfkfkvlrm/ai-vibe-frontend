import { Navigate, Route, Routes } from 'react-router-dom'
import BoardList from './BoardList'

function App() {
  return (
    <main>
      <header className="app-header">
        <h1>게시판</h1>
        {/* 백엔드에 회원 기능이 생기기 전까지 자리만 둔다. */}
        <div className="auth-buttons">
          <button type="button" disabled title="준비 중">
            로그인
          </button>
          <button type="button" disabled title="준비 중">
            회원가입
          </button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/boards" replace />} />
        <Route path="/boards" element={<BoardList />} />
      </Routes>
    </main>
  )
}

export default App
