import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import TigrisSilvae from './pages/TigrisSilvae.jsx'
import TigrisSilvaeHome from './pages/TigrisSilvaeHome.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tigris-silvae" element={<TigrisSilvae />} />
      <Route path="/tigris-silvae/home" element={<TigrisSilvaeHome />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}
