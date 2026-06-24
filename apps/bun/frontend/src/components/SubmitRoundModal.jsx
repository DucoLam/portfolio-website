import { useMemo, useState } from 'react'
import { api } from '../utils/api'
import { palette, iowanStack, latoStack, stripeBg } from '../theme'

// Mirror of backend src/scoring.py for instant live totals.
const strokesReceived = (si, hc) => {
  const h = Math.round(hc || 0)
  const base = Math.floor(h / 18)
  const rem = ((h % 18) + 18) % 18
  return base + (si <= rem ? 1 : 0)
}
const stablefordPoints = (par, net) => Math.max(0, par - net + 2)

const today = () => new Date().toISOString().slice(0, 10)

export default function SubmitRoundModal({ courses, players, currentUsername, defaultHandicap, onClose, onSubmitted }) {
  const [courseId, setCourseId]   = useState(courses[0]?.id ?? '')
  const [playedOn, setPlayedOn]   = useState(today())
  const [handicap, setHandicap]   = useState(defaultHandicap ?? '')
  const [markerId, setMarkerId]   = useState('')
  const [strokes, setStrokes]     = useState({})       // { [holeNumber]: '5' }
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)

  const course = useMemo(
    () => courses.find(c => String(c.id) === String(courseId)),
    [courses, courseId],
  )
  const holes = useMemo(
    () => (course ? [...course.holes].sort((a, b) => a.hole_number - b.hole_number) : []),
    [course],
  )

  const markerOptions = players.filter(p => p.username !== currentUsername)

  // ── Live totals ──
  const totals = useMemo(() => {
    let gross = 0, stbl = 0, filled = 0
    const hc = parseFloat(handicap)
    for (const h of holes) {
      const s = parseInt(strokes[h.hole_number], 10)
      if (!Number.isFinite(s)) continue
      filled += 1
      gross += s
      if (Number.isFinite(hc)) {
        const net = s - strokesReceived(h.stroke_index, hc)
        stbl += stablefordPoints(h.par, net)
      }
    }
    const net = Number.isFinite(hc) ? gross - hc : null
    return { gross, net, stbl, filled, allIn: filled === 18 }
  }, [holes, strokes, handicap])

  const canSubmit = course && markerId && totals.allIn &&
    Number.isFinite(parseFloat(handicap)) && !submitting

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const round = await api.submitRound({
        course_id: Number(courseId),
        played_on: playedOn,
        handicap: parseFloat(handicap),
        marker_id: Number(markerId),
        holes: holes.map(h => ({ hole_number: h.hole_number, strokes: parseInt(strokes[h.hole_number], 10) })),
      })
      onSubmitted?.(round)
      onClose()
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  const fieldStyle = {
    fontFamily: latoStack,
    backgroundColor: palette.surface,
    border: `1px solid ${palette.line}`,
    color: palette.ink,
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto py-6 px-4"
      style={{ backgroundColor: 'rgba(38,34,25,0.45)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-sm shadow-xl"
        style={{ backgroundColor: palette.surface }}
        onClick={e => e.stopPropagation()}
      >
        {/* Repp-tie stripe header */}
        <div className="h-1.5 w-full" style={stripeBg(palette.navy)} />

        <div className="p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl tracking-wide" style={{ fontFamily: iowanStack, color: palette.ink }}>
              Score inleveren
            </h2>
            <button
              onClick={onClose}
              className="text-xs tracking-widest uppercase"
              style={{ fontFamily: latoStack, color: palette.muted }}
            >
              Sluiten
            </button>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ fontFamily: latoStack }}>
            <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] tracking-widest uppercase" style={{ color: palette.muted }}>Baan</span>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} className="px-2 py-2 text-sm rounded-sm" style={fieldStyle}>
                {courses.length === 0 && <option value="">Geen banen</option>}
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] tracking-widest uppercase" style={{ color: palette.muted }}>Datum</span>
              <input type="date" value={playedOn} onChange={e => setPlayedOn(e.target.value)} className="px-2 py-2 text-sm rounded-sm" style={fieldStyle} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] tracking-widest uppercase" style={{ color: palette.muted }}>Handicap</span>
              <input type="number" step="0.1" value={handicap} onChange={e => setHandicap(e.target.value)} placeholder="bv. 18" className="px-2 py-2 text-sm rounded-sm" style={fieldStyle} />
            </label>
            <label className="flex flex-col gap-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] tracking-widest uppercase" style={{ color: palette.muted }}>Marker</span>
              <select value={markerId} onChange={e => setMarkerId(e.target.value)} className="px-2 py-2 text-sm rounded-sm" style={fieldStyle}>
                <option value="">Kies…</option>
                {markerOptions.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
              </select>
            </label>
          </div>

          {/* Hole grid */}
          {course ? (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {holes.map(h => (
                <div key={h.hole_number} className="flex flex-col items-center rounded-sm py-2" style={{ border: `1px solid ${palette.line}` }}>
                  <span className="text-xs tracking-wide" style={{ fontFamily: iowanStack, color: palette.navy }}>
                    {h.hole_number}
                  </span>
                  <span className="text-[10px]" style={{ fontFamily: latoStack, color: palette.muted }}>
                    P{h.par} · SI{h.stroke_index}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="20"
                    value={strokes[h.hole_number] ?? ''}
                    onChange={e => setStrokes(s => ({ ...s, [h.hole_number]: e.target.value }))}
                    className="mt-1 w-12 text-center text-lg rounded-sm"
                    style={{ fontFamily: latoStack, color: palette.ink, border: `1px solid ${palette.line}`, backgroundColor: palette.bg }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center" style={{ fontFamily: latoStack, color: palette.muted }}>
              Voeg eerst een baan toe (Admin).
            </p>
          )}

          {/* Live totals */}
          <div className="flex items-center justify-center gap-6 py-1" style={{ fontFamily: latoStack }}>
            <Total label="Bruto" value={totals.gross || '—'} color={palette.ink} />
            <Total label="Netto" value={totals.net == null ? '—' : Math.round(totals.net * 10) / 10} color={palette.green} />
            <Total label="Stableford" value={totals.stbl || '—'} color={palette.bordeaux} />
            <Total label="Holes" value={`${totals.filled}/18`} color={palette.muted} />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ fontFamily: latoStack, color: palette.bordeaux }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 text-sm tracking-widest uppercase rounded-sm transition-opacity disabled:opacity-40"
            style={{ fontFamily: latoStack, backgroundColor: palette.navy, color: palette.surface }}
          >
            {submitting ? 'Bezig…' : 'Inleveren ter bevestiging'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Total({ label, value, color }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg" style={{ color }}>{value}</span>
      <span className="text-[10px] tracking-widest uppercase" style={{ color: palette.muted }}>{label}</span>
    </div>
  )
}
