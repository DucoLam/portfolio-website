import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../utils/api'
import { useFadeIn } from '../hooks/useFadeIn'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

const TABS = [
  { id: 'videos', label: "Video's" },
  { id: 'fotos',  label: "Foto's"  },
]

// ── Video card ────────────────────────────────────────────────────
function VideoCard({ video, isAdmin, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try { await onDelete(video.id) } finally { setDeleting(false) }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2 min-w-0">
        {video.title && (
          <p className="text-sm font-bold text-stone-700 leading-snug truncate" style={{ fontFamily: iowanStack }}>
            {video.title}
          </p>
        )}
        <p className="text-xs text-stone-400 italic shrink-0" style={{ fontFamily: latoStack }}>
          {new Date(video.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: '16/9', backgroundColor: '#e7e5e4' }}>
        <iframe
          src={`https://www.youtube.com/embed/${video.youtube_id}`}
          title={video.title || video.youtube_id}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-400" style={{ fontFamily: latoStack }}>
          {video.added_by_username}
        </p>
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-stone-300 hover:text-red-400 transition-colors tracking-widest uppercase disabled:opacity-40"
            style={{ fontFamily: latoStack }}
          >
            {deleting ? '…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Photo card ────────────────────────────────────────────────────
function PhotoCard({ photo }) {
  return (
    <a href={photo.full_url} target="_blank" rel="noopener noreferrer" className="block group">
      <div
        className="relative w-full overflow-hidden rounded-sm"
        style={{ aspectRatio: '1/1', backgroundColor: '#e7e5e4' }}
      >
        <img
          src={photo.thumb_url}
          alt={photo.filename}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </a>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function TigrisSilvaeArchief() {
  const { user } = useOutletContext()
  const fadeIn   = useFadeIn()
  const [view, setView] = useState('videos')

  // Tab sliding indicator
  const tabRefs = useRef({})
  const tabBarRef = useRef(null)
  const [tabInd, setTabInd] = useState({ left: 0, width: 0, ready: false, animate: false })

  useEffect(() => {
    const el = tabRefs.current[view]
    const bar = tabBarRef.current
    if (!el || !bar) return
    const barRect = bar.getBoundingClientRect()
    const elRect  = el.getBoundingClientRect()
    setTabInd(prev => ({
      left:    elRect.left - barRect.left,
      width:   elRect.width,
      ready:   true,
      animate: prev.ready,
    }))
  }, [view])

  // Videos state
  const [videos, setVideos]         = useState([])
  const [videosLoading, setVL]      = useState(true)
  const [adding, setAdding]         = useState(false)
  const [url, setUrl]               = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError]     = useState('')

  useEffect(() => {
    api.listVideos()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setVL(false))
  }, [])

  const handleAddVideo = async () => {
    if (!url.trim()) return
    setAddError('')
    setSubmitting(true)
    try {
      const video = await api.addVideo(url.trim())
      setVideos(v => [video, ...v])
      setUrl('')
      setAdding(false)
    } catch (e) {
      setAddError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteVideo = async (id) => {
    await api.deleteVideo(id)
    setVideos(v => v.filter(vid => vid.id !== id))
  }

  // Photos state
  const [photos, setPhotos]    = useState([])
  const [photosLoading, setPL] = useState(false)
  const [photosFetched, setPF] = useState(false)

  // Lazy-load photos only when tab is first visited
  useEffect(() => {
    if (view === 'fotos' && !photosFetched) {
      setPL(true)
      api.listPhotos()
        .then(setPhotos)
        .catch(() => setPhotos([]))
        .finally(() => { setPL(false); setPF(true) })
    }
  }, [view, photosFetched])

  return (
    <main
      className="min-h-[calc(100vh-5rem)] px-6 sm:px-8 py-12"
      style={{ fontFamily: latoStack }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between mb-8" style={fadeIn(0)}>
          <h2 className="text-3xl font-normal text-stone-800" style={{ fontFamily: iowanStack }}>
            Archief
          </h2>

          {/* Action button — only on videos tab */}
          <div style={{ opacity: view === 'videos' ? 1 : 0, transition: 'opacity 0.25s ease', pointerEvents: view === 'videos' ? 'auto' : 'none' }}>
            <button
              onClick={() => { setAdding(a => !a); setAddError(''); setUrl('') }}
              className="text-sm text-stone-400 tracking-widest uppercase hover:text-stone-700 transition-colors"
            >
              {adding ? 'Annuleer' : '+ Voeg toe'}
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          ref={tabBarRef}
          className="relative flex gap-8 mb-8 border-b border-stone-200 pb-px"
          style={fadeIn(0.05)}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              ref={el => { tabRefs.current[tab.id] = el }}
              onClick={() => setView(tab.id)}
              className={`text-sm tracking-widest uppercase pb-3 transition-colors ${
                view === tab.id ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Sliding tab indicator */}
          {tabInd.ready && (
            <div
              style={{
                position: 'absolute',
                bottom: -1,
                left: tabInd.left,
                width: tabInd.width,
                height: 2,
                backgroundColor: '#44403c',
                transition: tabInd.animate
                  ? 'left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1)'
                  : 'none',
              }}
            />
          )}
        </div>

        {/* ── Sliding panels ── */}
        <div style={{ overflowX: 'hidden', ...fadeIn(0.1) }}>
          <div
            style={{
              display: 'flex',
              width: '200%',
              alignItems: 'flex-start',
              transform: view === 'fotos' ? 'translateX(-50%)' : 'translateX(0)',
              transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
            }}
          >

            {/* ── Video panel ── */}
            <div style={{ width: '50%', paddingRight: '4%' }}>

              {/* Add form */}
              <div style={{
                maxHeight: adding ? '8rem' : 0,
                opacity: adding ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.5s ease, opacity 0.4s ease',
                marginBottom: adding ? '2rem' : 0,
              }}>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddVideo()}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 border-b border-stone-300 bg-transparent py-2 text-sm text-stone-800 outline-none focus:border-stone-600 transition-colors placeholder:text-stone-300"
                    />
                    <button
                      onClick={handleAddVideo}
                      disabled={submitting || !url.trim()}
                      className="text-xs text-stone-500 border border-stone-300 px-4 py-2 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-colors tracking-widest uppercase disabled:opacity-40"
                    >
                      {submitting ? '…' : 'Voeg toe'}
                    </button>
                  </div>
                  {addError && <p className="text-xs text-red-400">{addError}</p>}
                </div>
              </div>

              {videosLoading ? (
                <p className="text-xs text-stone-400 tracking-widest uppercase">Laden…</p>
              ) : videos.length === 0 ? (
                <div>
                  <div className="w-8 border-t border-stone-200 mb-4" />
                  <p className="text-xs text-stone-400 tracking-widest uppercase">Nog geen video's</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videos.map(video => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      isAdmin={user?.is_admin}
                      onDelete={handleDeleteVideo}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Photos panel ── */}
            <div style={{ width: '50%', paddingLeft: '4%' }}>
              {photosLoading ? (
                <p className="text-xs text-stone-400 tracking-widest uppercase">Laden…</p>
              ) : photos.length === 0 && photosFetched ? (
                <div>
                  <div className="w-8 border-t border-stone-200 mb-4" />
                  <p className="text-xs text-stone-400 tracking-widest uppercase">Geen foto's beschikbaar</p>
                </div>
              ) : photos.length === 0 ? null : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {photos.map(photo => (
                    <PhotoCard key={photo.id} photo={photo} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
