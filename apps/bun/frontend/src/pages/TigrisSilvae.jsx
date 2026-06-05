import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

export default function TigrisSilvae() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [transitioned, setTransitioned] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const [isNewMember, setIsNewMember] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [memberToken, setMemberToken] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // If already authenticated, skip straight to home
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api.me()
      .then(() => navigate('/tigris-silvae/home', { replace: true }))
      .catch(() => localStorage.removeItem('token'))
  }, [navigate])

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80)
    const t2 = setTimeout(() => setTransitioned(true), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const goHome = () => {
    setFadingOut(true)
    setTimeout(() => navigate('/tigris-silvae/home'), 450)
  }

  const handleLogin = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const { access_token } = await api.login(username, password)
      localStorage.setItem('token', access_token)
      goHome()
    } catch (e) {
      setAuthError(e.message)
      setAuthLoading(false)
    }
  }

  const handleRegister = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const { access_token } = await api.register(username, password, memberToken)
      localStorage.setItem('token', access_token)
      goHome()
    } catch (e) {
      setAuthError(e.message)
      setAuthLoading(false)
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{
        backgroundColor: '#F8F6F1',
        fontFamily: iowanStack,
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div className="flex flex-col items-center w-full max-w-sm px-6 sm:px-4">

        {/* Welkom bij */}
        <div style={{
          opacity: visible && !transitioned ? 1 : 0,
          maxHeight: transitioned ? 0 : '5rem',
          overflow: 'hidden',
          transition: 'opacity 0.7s ease, max-height 0.9s ease 0.3s',
        }}>
          <p className="text-3xl sm:text-5xl font-normal text-stone-500 text-center tracking-widest mb-3">
            Welkom bij
          </p>
        </div>

        {/* Tigris Silvae */}
        <h1
          className="text-4xl sm:text-6xl md:text-8xl font-normal tracking-wide text-stone-800 text-center whitespace-nowrap"
          style={{
            opacity: visible ? 1 : 0,
            marginBottom: transitioned ? '2.5rem' : '0',
            transition: 'opacity 0.8s ease 0.15s, margin-bottom 0.9s ease 0.3s',
          }}
        >
          Tigris Silvae
        </h1>

        {/* Login / Register form */}
        <div style={{
          opacity: transitioned ? 1 : 0,
          transition: 'opacity 0.6s ease 0.6s',
          pointerEvents: transitioned ? 'auto' : 'none',
          fontFamily: latoStack,
          width: '100%',
        }}>
          <div className="flex flex-col gap-5">

            <div className="flex flex-col gap-1">
              <label className="text-xs text-stone-400 tracking-widest uppercase">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="border-b border-stone-300 bg-transparent py-2 text-stone-800 outline-none focus:border-stone-600 transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-stone-400 tracking-widest uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isNewMember && handleLogin()}
                className="border-b border-stone-300 bg-transparent py-2 text-stone-800 outline-none focus:border-stone-600 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {/* Member Token — slides in when isNewMember */}
            <div style={{
              maxHeight: isNewMember ? '6rem' : 0,
              opacity: isNewMember ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 1.2s ease, opacity 1s ease 0.3s',
            }}>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-stone-400 tracking-widest uppercase">Member Token</label>
                <input
                  type="text"
                  value={memberToken}
                  onChange={e => setMemberToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  className="border-b border-stone-300 bg-transparent py-2 text-stone-800 outline-none focus:border-stone-600 transition-colors"
                  placeholder="Enter your token"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-400 text-center tracking-wide">{authError}</p>
            )}

            <div
              className="flex gap-3"
              style={{
                marginTop: isNewMember ? '0.5rem' : '0',
                transition: 'margin-top 2s ease 0.3s',
              }}
            >
              <button
                onClick={handleLogin}
                disabled={authLoading || isNewMember}
                className="flex-1 py-3 border border-stone-400 text-stone-600 tracking-widest uppercase text-xs hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-colors disabled:cursor-not-allowed"
                style={{
                  opacity: isNewMember ? 0 : 1,
                  pointerEvents: isNewMember ? 'none' : 'auto',
                  transition: 'opacity 0.3s ease, background-color 0.2s, color 0.2s, border-color 0.2s',
                }}
              >
                {authLoading && !isNewMember ? '…' : 'Sign In'}
              </button>

              <button
                onClick={isNewMember ? handleRegister : () => setIsNewMember(true)}
                disabled={authLoading}
                className="flex-1 py-3 border border-stone-300 text-stone-400 tracking-widest uppercase text-xs hover:bg-stone-700 hover:text-stone-100 hover:border-stone-700 transition-colors disabled:cursor-not-allowed"
              >
                {authLoading && isNewMember ? '…' : 'New Member'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
