import { Link, Route, Routes } from 'react-router-dom'
import ProductDetail from './pages/ProductDetail'
import ProductForm from './pages/ProductForm'
import ProductList from './pages/ProductList'
import './App.css'

function App() {
  return (
    <main className="mall">
      <header className="site-head">
        <Link to="/">PC Mall</Link>
      </header>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="*" element={<p>페이지를 찾을 수 없습니다. <Link to="/">목록으로</Link></p>} />
      </Routes>
    </main>
  )
}

export default App
