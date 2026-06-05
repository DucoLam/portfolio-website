import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import TigrisSilvae from './pages/TigrisSilvae.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tigris-silvae" element={<TigrisSilvae />} />
    </Routes>
  )
}
