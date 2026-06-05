import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

export default function TigrisSilvaeHome() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)

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
        setMounted(true)
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

  // Staggered fade-in helper — each element gets a different delay
  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  })

  return (
    <main
      className="flex min-h-screen items-center justify-center relative"
      style={{ backgroundColor: '#F8F6F1', fontFamily: iowanStack }}
    >

      {/* Admin button — fixed top right, only for admins */}
      {user?.is_admin && (
        <button
          onClick={() => navigate('/admin')}
          className="fixed top-6 right-6 text-xs text-stone-400 tracking-widest uppercase hover:text-stone-700 transition-colors"
          style={{ fontFamily: latoStack, ...fadeIn(0.5) }}
        >
          Admin
        </button>
      )}

      <div className="flex flex-col items-center w-full max-w-sm px-6 sm:px-4 gap-5 text-center">

        <h1
          className="text-4xl sm:text-6xl md:text-8xl font-normal tracking-wide text-stone-800 whitespace-nowrap"
          style={fadeIn(0)}
        >
          Tigris Silvae
        </h1>

        <p
          className="text-sm text-stone-500 tracking-widest uppercase"
          style={{ fontFamily: latoStack, ...fadeIn(0.15) }}
        >
          Welkom, {user?.username}
        </p>

        <div
          className="w-12 border-t border-stone-300"
          style={fadeIn(0.3)}
        />

        <p
          className="text-sm text-stone-400 leading-relaxed"
          style={{ fontFamily: latoStack, ...fadeIn(0.45) }}
        >
          Fijn dat je er bent.
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 text-xs text-stone-300 tracking-widest uppercase hover:text-stone-500 transition-colors"
          style={{ fontFamily: latoStack, ...fadeIn(0.6) }}
        >
          Sign Out
        </button>

      </div>
    </main>
  )
}
