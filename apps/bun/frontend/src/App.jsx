import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import TigrisSilvae from './pages/TigrisSilvae.jsx'
import TigrisSilvaeLayout from './pages/TigrisSilvaeLayout.jsx'
import TigrisSilvaeHome from './pages/TigrisSilvaeHome.jsx'
import TigrisSilvaeAgenda from './pages/TigrisSilvaeAgenda.jsx'
import TigrisSilvaeFeed from './pages/TigrisSilvaeFeed.jsx'
import TigrisSilvaeLeaderboard from './pages/TigrisSilvaeLeaderboard.jsx'
import TigrisSilvaeArchief from './pages/TigrisSilvaeArchief.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tigris-silvae" element={<TigrisSilvae />} />

      {/* Authenticated area — shared layout with topbar */}
      <Route element={<TigrisSilvaeLayout />}>
        <Route path="/tigris-silvae/home"        element={<TigrisSilvaeHome />} />
        <Route path="/tigris-silvae/agenda"       element={<TigrisSilvaeAgenda />} />
        <Route path="/tigris-silvae/feed"         element={<TigrisSilvaeFeed />} />
        <Route path="/tigris-silvae/leaderboard"  element={<TigrisSilvaeLeaderboard />} />
        <Route path="/tigris-silvae/archief"      element={<TigrisSilvaeArchief />} />
      </Route>

      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}
