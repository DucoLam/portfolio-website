import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../utils/api'
import { useFadeIn } from '../hooks/useFadeIn'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

function VideoCard({ video, isAdmin, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(video.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Title above embed */}
      {video.title && (
        <p
          className="text-sm text-stone-700 leading-snug truncate"
          style={{ fontFamily: iowanStack }}
        >
          {video.title}
        </p>
      )}

      {/* Embed */}
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

      {/* Meta */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-stone-400" style={{ fontFamily: latoStack }}>
            {video.added_by_username}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 text-xs text-stone-300 hover:text-red-400 transition-colors tracking-widest uppercase disabled:opacity-40 mt-0.5"
            style={{ fontFamily: latoStack }}
          >
            {deleting ? '…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function TigrisSilvaeArchief() {
  const { user } = useOutletContext()
  const fadeIn = useFadeIn()

  const [videos, setVideos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(false)   // form open
  const [url, setUrl]             = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.listVideos()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => setLoading(false))
  }, [])

  const handleAdd = async () => {
    if (!url.trim()) return
    setError('')
    setSubmitting(true)
    try {
      const video = await api.addVideo(url.trim())
      setVideos(v => [video, ...v])
      setUrl('')
      setAdding(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (videoId) => {
    await api.deleteVideo(videoId)
    setVideos(v => v.filter(vid => vid.id !== videoId))
  }

  return (
    <main
      className="min-h-[calc(100vh-5rem)] px-6 sm:px-8 py-12"
      style={{ fontFamily: latoStack }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Header row */}
        <div className="flex items-center justify-between mb-10" style={fadeIn(0)}>
          <h2
            className="text-3xl font-normal text-stone-800"
            style={{ fontFamily: iowanStack }}
          >
            Archief
          </h2>

          <button
            onClick={() => { setAdding(a => !a); setError(''); setUrl('') }}
            className="text-sm text-stone-400 tracking-widest uppercase hover:text-stone-700 transition-colors"
          >
            {adding ? 'Annuleer' : '+ Voeg toe'}
          </button>
        </div>

        {/* Add video form — slides in */}
        <div
          style={{
            maxHeight: adding ? '8rem' : 0,
            opacity: adding ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.5s ease, opacity 0.4s ease',
            marginBottom: adding ? '2.5rem' : 0,
            transitionProperty: 'max-height, opacity, margin-bottom',
          }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 border-b border-stone-300 bg-transparent py-2 text-sm text-stone-800 outline-none focus:border-stone-600 transition-colors placeholder:text-stone-300"
              />
              <button
                onClick={handleAdd}
                disabled={submitting || !url.trim()}
                className="text-xs text-stone-500 border border-stone-300 px-4 py-2 hover:bg-stone-800 hover:text-stone-100 hover:border-stone-800 transition-colors tracking-widest uppercase disabled:opacity-40"
              >
                {submitting ? '…' : 'Voeg toe'}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-400 tracking-wide">{error}</p>
            )}
          </div>
        </div>

        {/* Video grid */}
        {loading ? (
          <p className="text-xs text-stone-400 tracking-widest uppercase" style={fadeIn(0.1)}>
            Laden…
          </p>
        ) : videos.length === 0 ? (
          <div style={fadeIn(0.1)}>
            <div className="w-8 border-t border-stone-200 mb-4" />
            <p className="text-xs text-stone-400 tracking-widest uppercase">
              Nog geen video's
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            style={fadeIn(0.1)}
          >
            {videos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                isAdmin={user?.is_admin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
