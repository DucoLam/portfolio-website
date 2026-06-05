import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
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

// Topbar height — keep in sync with min-h in page components
export const BAR_HEIGHT = '5rem' // h-20

export default function TigrisSilvaeLayout() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const [user, setUser]             = useState(null)
  const [ready, setReady]           = useState(false)
  const [barVisible, setBarVisible] = useState(false)

  // Sliding indicator
  const navRef      = useRef(null)
  const itemRefs    = useRef({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false, animate: false })

  // ── Auth ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('token')
    if (!token) { navigate('/tigris-silvae', { replace: true }); return }
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

  // ── Sliding indicator ────────────────────────────────────────────
  useEffect(() => {
    const active = navItems.find(item => item.to === location.pathname)
    if (!active || !navRef.current || !itemRefs.current[active.to]) return

    const nav  = navRef.current
    const item = itemRefs.current[active.to]
    const navRect  = nav.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()

    const left  = itemRect.left - navRect.left + nav.scrollLeft
    const width = itemRect.width

    setIndicator(prev => ({
      left,
      width,
      visible: true,
      animate: prev.visible, // only animate after first paint
    }))
  }, [location.pathname, ready])

  // Recalculate on resize
  useEffect(() => {
    const recalc = () => {
      const active = navItems.find(item => item.to === location.pathname)
      if (!active || !navRef.current || !itemRefs.current[active.to]) return
      const nav  = navRef.current
      const item = itemRefs.current[active.to]
      const navRect  = nav.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      setIndicator(prev => ({
        ...prev,
        left: itemRect.left - navRect.left + nav.scrollLeft,
        width: itemRect.width,
      }))
    }
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [location.pathname])

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
        <div
          className="flex items-center px-8 gap-8 max-w-5xl mx-auto"
          style={{ height: BAR_HEIGHT }}
        >

          {/* Logo */}
          <span
            className="text-lg text-stone-700 tracking-widest shrink-0"
            style={{ fontFamily: iowanStack }}
          >
            Tigris Silvae
          </span>

          {/* Nav — position relative so indicator can anchor to it */}
          <nav
            ref={navRef}
            className="relative flex items-center gap-8 overflow-x-auto flex-1 h-full"
            style={{ scrollbarWidth: 'none' }}
          >
            {navItems.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                ref={el => { itemRefs.current[to] = el }}
                className={({ isActive }) =>
                  `text-sm tracking-widest uppercase whitespace-nowrap transition-colors duration-200 ${
                    isActive ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Sliding underline indicator */}
            {indicator.visible && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: indicator.left,
                  width: indicator.width,
                  height: 2,
                  backgroundColor: '#44403c', // stone-700
                  transition: indicator.animate
                    ? 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                    : 'none',
                }}
              />
            )}
          </nav>

          {/* Right — admin + sign out */}
          <div className="flex items-center gap-6 shrink-0">
            {user?.is_admin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-sm text-stone-400 tracking-widest uppercase hover:text-stone-700 transition-colors"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-stone-300 tracking-widest uppercase hover:text-stone-500 transition-colors"
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
