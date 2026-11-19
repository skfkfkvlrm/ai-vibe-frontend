import { Navigate, Route, Routes } from 'react-router-dom'
import BoardList from './BoardList'

function App() {
  return (
    <main>
      <h1>게시판</h1>
      <Routes>
        <Route path="/" element={<Navigate to="/boards" replace />} />
        <Route path="/boards" element={<BoardList />} />
      </Routes>
    </main>
  )
}

export default App
