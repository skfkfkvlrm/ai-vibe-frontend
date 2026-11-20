import { Link, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import LoginPage from './auth/LoginPage'
import SignupPage from './auth/SignupPage'
import MembersPage from './admin/MembersPage'
import AdminRoute from './auth/AdminRoute'
import { isAdmin } from './auth/isAdmin'
import { useAuth } from './auth/useAuth'
import CartPage from './pages/CartPage'
import MyPage from './pages/MyPage'
import OrderPage from './pages/OrderPage'
import ProductDetail from './pages/ProductDetail'
import ProductForm from './pages/ProductForm'
import ProductList from './pages/ProductList'
import './App.css'

function SiteHeader() {
  const { member, ready, logout } = useAuth()
  return (
    <header className="site-head">
      <Link to="/">PC Mall</Link>
      {ready && (
        <nav className="auth-nav">
          {member ? (
            <>
              {isAdmin(member) && <Link to="/admin/members">회원 관리</Link>}
              <Link to="/cart">장바구니</Link>
              <Link to="/mypage">{member.name}님</Link>
              <button type="button" className="btn" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

function App() {
  return (
    <AuthProvider>
      <main className="mall">
        <SiteHeader />
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders/:id" element={<OrderPage />} />
          <Route
            path="/products/new"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <AdminRoute>
                <MembersPage />
              </AdminRoute>
            }
          />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/products/:id/edit"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />
          <Route path="*" element={<p>페이지를 찾을 수 없습니다. <Link to="/">목록으로</Link></p>} />
        </Routes>
      </main>
    </AuthProvider>
  )
}

export default App
