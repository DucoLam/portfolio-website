import { useEffect, useState } from 'react'
import { Outlet, useNavigate, NavLink } from 'react-router-dom'
import { api } from '../utils/api'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

const navItems = [
  { label: 'Home',        to: '/tigris-silvae/home' },
  { label: 'Agenda',      to: '/tigris-silvae/agenda' },
  { label: 'Feed',        to: '/tigris-silvae/feed' },
  { label: 'Leaderboard', to: '/tigris-silvae/leaderboard' },
  { label: 'Archief',     to: '/tigris-silvae/archief' },
]

export default function TigrisSilvaeLayout() {
  const navigate = useNavigate()
  const [user, setUser]           = useState(null)
  const [ready, setReady]         = useState(false)   // don't render Outlet until auth confirmed
  const [barVisible, setBarVisible] = useState(false)

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/tigris-silvae', { replace: true })
      return
    }
    api.me()
      .then(u => {
        if (cancelled) return
        setUser(u)
        setReady(true)
        setTimeout(() => setBarVisible(true), 50)
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem('token')
        navigate('/tigris-silvae', { replace: true })
      })
    return () => { cancelled = true }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/tigris-silvae', { replace: true })
  }

  return (
    <div style={{ backgroundColor: '#F8F6F1', minHeight: '100vh' }}>

      {/* ── Topbar ── */}
      <header
        className="sticky top-0 z-10 border-b border-stone-200"
        style={{
          backgroundColor: '#F8F6F1',
          fontFamily: latoStack,
          opacity: barVisible ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <div className="flex items-center h-14 px-6 gap-6 max-w-5xl mx-auto">

          {/* Logo */}
          <span
            className="text-sm text-stone-600 tracking-widest shrink-0"
            style={{ fontFamily: iowanStack }}
          >
            Tigris Silvae
          </span>

          {/* Nav — scrollable on mobile so it never wraps */}
          <nav className="flex items-center gap-6 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {navItems.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-xs tracking-widest uppercase whitespace-nowrap transition-colors ${
                    isActive ? 'text-stone-800 border-b border-stone-600 pb-px' : 'text-stone-400 hover:text-stone-600'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right — admin + sign out */}
          <div className="flex items-center gap-5 shrink-0">
            {user?.is_admin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-xs text-stone-400 tracking-widest uppercase hover:text-stone-700 transition-colors"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-stone-300 tracking-widest uppercase hover:text-stone-500 transition-colors"
            >
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* ── Page content ── */}
      {ready && <Outlet context={{ user }} />}

    </div>
  )
}
