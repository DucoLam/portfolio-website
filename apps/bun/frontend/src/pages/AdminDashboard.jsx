import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import CourseEditorModal from '../components/CourseEditorModal'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  const [tokens, setTokens] = useState([])
  const [tokensLoading, setTokensLoading] = useState(false)
  const [copied, setCopied] = useState(null)
  const [deletingToken, setDeletingToken] = useState(null)

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [removing, setRemoving] = useState(null)

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [showCourseEditor, setShowCourseEditor] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState(null)

  const fetchTokens = useCallback(async () => {
    setTokensLoading(true)
    try { setTokens(await api.listTokens()) } finally { setTokensLoading(false) }
  }, [])

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true)
    try { setMembers(await api.listMembers()) } finally { setMembersLoading(false) }
  }, [])

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true)
    try { setCourses(await api.listCourses()) } finally { setCoursesLoading(false) }
  }, [])

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
        if (!u.is_admin) {
          navigate('/tigris-silvae/home', { replace: true })
          return
        }
        setMounted(true)
        fetchTokens()
        fetchMembers()
        fetchCourses()
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem('token')
        navigate('/tigris-silvae', { replace: true })
      })
    return () => { cancelled = true }
  }, [navigate, fetchTokens, fetchMembers, fetchCourses])

  const handleDeleteCourse = async (courseId) => {
    setDeletingCourse(courseId)
    try {
      await api.deleteCourse(courseId)
      setCourses(c => c.filter(x => x.id !== courseId))
    } catch (e) {
      alert(e.message)
    } finally {
      setDeletingCourse(null)
    }
  }

  const handleGenerateToken = async () => {
    const token = await api.generateToken()
    setTokens(t => [token, ...t])
  }

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDeleteToken = async (tokenId) => {
    setDeletingToken(tokenId)
    try {
      await api.deleteToken(tokenId)
      setTokens(t => t.filter(tk => tk.id !== tokenId))
    } finally {
      setDeletingToken(null)
    }
  }

  const handleRemoveMember = async (userId) => {
    setRemoving(userId)
    try {
      await api.removeMember(userId)
      setMembers(m => m.filter(u => u.id !== userId))
    } finally {
      setRemoving(null)
    }
  }

  const fadeIn = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
  })

  return (
    <main
      className="flex min-h-screen items-center justify-center relative"
      style={{ backgroundColor: '#F8F6F1', fontFamily: iowanStack }}
    >

      {/* Back button — top left */}
      <button
        onClick={() => navigate('/tigris-silvae/home')}
        className="fixed top-6 left-6 text-xs text-stone-400 tracking-widest uppercase hover:text-stone-700 transition-colors"
        style={{ fontFamily: latoStack, ...fadeIn(0) }}
      >
        ← Back
      </button>

      <div
        className="flex flex-col w-full max-w-sm px-6 sm:px-4 gap-8 py-20"
        style={{ fontFamily: latoStack }}
      >

        {/* Header */}
        <h1
          className="text-3xl font-normal tracking-wide text-stone-800 text-center"
          style={{ fontFamily: iowanStack, ...fadeIn(0.05) }}
        >
          Admin
        </h1>

        {/* ── Tokens ── */}
        <div className="flex flex-col gap-4" style={fadeIn(0.15)}>
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
                  <span className="text-xs font-mono text-stone-700 truncate min-w-0">
                    {t.token}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleCopy(t.token)}
                      className="text-xs text-stone-400 hover:text-stone-700 transition-colors tracking-widest uppercase"
                    >
                      {copied === t.token ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDeleteToken(t.id)}
                      disabled={deletingToken === t.id}
                      className="text-xs text-stone-400 hover:text-red-400 transition-colors tracking-widest uppercase disabled:opacity-40"
                    >
                      {deletingToken === t.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Members ── */}
        <div className="flex flex-col gap-4" style={fadeIn(0.25)}>
          <span className="text-xs text-stone-400 tracking-widest uppercase">Members</span>

          {membersLoading ? (
            <p className="text-xs text-stone-400 text-center">Loading…</p>
          ) : members.length === 0 ? (
            <p className="text-xs text-stone-400 text-center">No members yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-stone-200"
                >
                  <span className="text-xs text-stone-700 tracking-wide">{m.username}</span>
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    disabled={removing === m.id}
                    className="shrink-0 text-xs text-stone-400 hover:text-red-400 transition-colors tracking-widest uppercase disabled:opacity-40"
                  >
                    {removing === m.id ? '…' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Courses ── */}
        <div className="flex flex-col gap-4" style={fadeIn(0.35)}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 tracking-widest uppercase">Banen</span>
            <button
              onClick={() => setShowCourseEditor(true)}
              className="text-xs text-stone-500 border border-stone-300 px-3 py-1 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-colors tracking-widest uppercase"
            >
              Toevoegen
            </button>
          </div>

          {coursesLoading ? (
            <p className="text-xs text-stone-400 text-center">Loading…</p>
          ) : courses.length === 0 ? (
            <p className="text-xs text-stone-400 text-center">No courses yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {courses.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-stone-200"
                >
                  <span className="text-xs text-stone-700 tracking-wide truncate min-w-0">
                    {c.name} <span className="text-stone-400">· par {c.par_total}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteCourse(c.id)}
                    disabled={deletingCourse === c.id}
                    className="shrink-0 text-xs text-stone-400 hover:text-red-400 transition-colors tracking-widest uppercase disabled:opacity-40"
                  >
                    {deletingCourse === c.id ? '…' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {showCourseEditor && (
        <CourseEditorModal
          onClose={() => setShowCourseEditor(false)}
          onCreated={(course) => setCourses(c => [...c, course])}
        />
      )}
    </main>
  )
}
