import { useEffect, useState, useCallback } from 'react'
import { api } from '../utils/api'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

export default function TigrisSilvae() {
  const [visible, setVisible] = useState(false)
  const [transitioned, setTransitioned] = useState(false)
  const [isNewMember, setIsNewMember] = useState(false)

  // Auth state
  const [user, setUser] = useState(null)        // { username, is_admin }
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [memberToken, setMemberToken] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Admin state
  const [tokens, setTokens] = useState([])
  const [tokensLoading, setTokensLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80)
    const t2 = setTimeout(() => setTransitioned(true), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.me().then(setUser).catch(() => localStorage.removeItem('token'))
    }
  }, [])

  const fetchTokens = useCallback(async () => {
    setTokensLoading(true)
    try {
      setTokens(await api.listTokens())
    } finally {
      setTokensLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.is_admin) fetchTokens()
  }, [user, fetchTokens])

  const handleLogin = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const { access_token } = await api.login(username, password)
      localStorage.setItem('token', access_token)
      setUser(await api.me())
    } catch (e) {
      setAuthError(e.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async () => {
    setAuthError('')
    setAuthLoading(true)
    try {
      const { access_token } = await api.register(username, password, memberToken)
      localStorage.setItem('token', access_token)
      setUser(await api.me())
    } catch (e) {
      setAuthError(e.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGenerateToken = async () => {
    await api.generateToken()
    fetchTokens()
  }

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#F8F6F1', fontFamily: iowanStack }}
    >
      <div className="flex flex-col items-center w-full max-w-sm">

        {/* Welkom bij */}
        <div style={{
          opacity: visible && !transitioned ? 1 : 0,
          maxHeight: transitioned ? 0 : '8rem',
          overflow: 'hidden',
          transition: 'opacity 0.7s ease, max-height 0.9s ease 0.3s',
        }}>
          <p className="text-5xl font-normal text-stone-500 text-center tracking-widest mb-3">
            Welkom bij
          </p>
        </div>

        {/* Tigris Silvae */}
        <h1
          className="text-8xl font-normal tracking-wide text-stone-800 text-center whitespace-nowrap"
          style={{
            opacity: visible ? 1 : 0,
            marginBottom: transitioned ? '2.5rem' : '0',
            transition: 'opacity 0.8s ease 0.15s, margin-bottom 0.9s ease 0.3s',
          }}
        >
          Tigris Silvae
        </h1>

        {/* Content area */}
        <div style={{
          opacity: transitioned ? 1 : 0,
          transition: 'opacity 0.6s ease 0.6s',
          pointerEvents: transitioned ? 'auto' : 'none',
          fontFamily: latoStack,
          width: '100%',
        }}>

          {/* ── Logged in ── */}
          {user ? (
            <div className="flex flex-col gap-6">
              <p className="text-sm text-stone-500 text-center tracking-widest uppercase">
                Welcome, {user.username}
              </p>

              {/* Admin panel */}
              {user.is_admin && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-400 tracking-widest uppercase">Member Tokens</span>
                    <button
                      onClick={handleGenerateToken}
                      className="text-xs text-stone-500 border border-stone-300 px-3 py-1 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-colors tracking-widest uppercase"
                    >
                      Generate
                    </button>
                  </div>

                  {tokensLoading ? (
                    <p className="text-xs text-stone-400 text-center">Loading…</p>
                  ) : tokens.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center">No tokens yet</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {tokens.map(t => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-2 py-2 border-b border-stone-200"
                        >
                          <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-mono truncate ${t.used_by_username ? 'text-stone-300' : 'text-stone-700'}`}>
                              {t.token}
                            </span>
                            {t.used_by_username && (
                              <span className="text-xs text-stone-400">used by {t.used_by_username}</span>
                            )}
                          </div>
                          {!t.used_by_username && (
                            <button
                              onClick={() => handleCopy(t.token)}
                              className="shrink-0 text-xs text-stone-400 hover:text-stone-700 transition-colors tracking-widest uppercase"
                            >
                              {copied === t.token ? 'Copied' : 'Copy'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="py-2 text-xs text-stone-400 tracking-widest uppercase hover:text-stone-700 transition-colors"
              >
                Sign Out
              </button>
            </div>

          ) : (
            /* ── Login / Register form ── */
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

              {/* Member Token */}
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
          )}

        </div>
      </div>
    </main>
  )
}
