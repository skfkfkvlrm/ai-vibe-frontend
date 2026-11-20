import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ManagePage from './ManagePage'
import SchedulePage from './SchedulePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/hanabank" element={<SchedulePage />} />
        <Route path="/hanabank/manage" element={<ManagePage />} />
        <Route path="*" element={<SchedulePage />} />
      </Routes>
    </BrowserRouter>
  )
}
