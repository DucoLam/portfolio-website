import { useState } from 'react'
import { api } from '../utils/api'
import { palette, iowanStack, latoStack, stripeBg } from '../theme'

// Sensible defaults: par 4 everywhere, stroke index = hole number.
const defaultHoles = () =>
  Array.from({ length: 18 }, (_, i) => ({
    hole_number: i + 1,
    par: 4,
    stroke_index: i + 1,
    distance: '',
  }))

export default function CourseEditorModal({ onClose, onCreated }) {
  const [name, setName]   = useState('')
  const [holes, setHoles] = useState(defaultHoles)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const update = (idx, field, value) =>
    setHoles(hs => hs.map((h, i) => (i === idx ? { ...h, [field]: value } : h)))

  const parTotal = holes.reduce((s, h) => s + (parseInt(h.par, 10) || 0), 0)

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const course = await api.createCourse(
        name.trim(),
        holes.map(h => ({
          hole_number: h.hole_number,
          par: parseInt(h.par, 10),
          stroke_index: parseInt(h.stroke_index, 10),
          distance: h.distance === '' ? null : parseInt(h.distance, 10),
        })),
      )
      onCreated?.(course)
      onClose()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  const cell = {
    fontFamily: latoStack,
    backgroundColor: palette.bg,
    border: `1px solid ${palette.line}`,
    color: palette.ink,
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto py-6 px-4"
      style={{ backgroundColor: 'rgba(38,34,25,0.45)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-2xl rounded-sm shadow-xl" style={{ backgroundColor: palette.surface }} onClick={e => e.stopPropagation()}>
        <div className="h-1.5 w-full" style={stripeBg(palette.green)} />
        <div className="p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl tracking-wide" style={{ fontFamily: iowanStack, color: palette.ink }}>Nieuwe baan</h2>
            <button onClick={onClose} className="text-xs tracking-widest uppercase" style={{ fontFamily: latoStack, color: palette.muted }}>Sluiten</button>
          </div>

          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Naam van de baan"
            className="px-3 py-2 text-sm rounded-sm"
            style={cell}
          />

          {/* Holes — header + 18 rows */}
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-2 text-[11px] tracking-widest uppercase px-1" style={{ fontFamily: latoStack, color: palette.muted }}>
              <span>#</span><span>Par</span><span>SI</span><span>Meters</span>
            </div>
            <div className="max-h-[40vh] overflow-y-auto flex flex-col gap-1 pr-1">
              {holes.map((h, idx) => (
                <div key={h.hole_number} className="grid grid-cols-[2rem_1fr_1fr_1fr] gap-2 items-center">
                  <span className="text-sm text-center" style={{ fontFamily: iowanStack, color: palette.navy }}>{h.hole_number}</span>
                  <select value={h.par} onChange={e => update(idx, 'par', e.target.value)} className="px-2 py-1.5 text-sm rounded-sm" style={cell}>
                    {[3, 4, 5, 6].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="number" min="1" max="18" value={h.stroke_index} onChange={e => update(idx, 'stroke_index', e.target.value)} className="px-2 py-1.5 text-sm rounded-sm" style={cell} />
                  <input type="number" min="0" value={h.distance} onChange={e => update(idx, 'distance', e.target.value)} placeholder="—" className="px-2 py-1.5 text-sm rounded-sm" style={cell} />
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs tracking-widest uppercase text-center" style={{ fontFamily: latoStack, color: palette.muted }}>
            Totaal par: <span style={{ color: palette.ink }}>{parTotal}</span>
          </p>

          {error && <p className="text-sm text-center" style={{ fontFamily: latoStack, color: palette.bordeaux }}>{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full py-3 text-sm tracking-widest uppercase rounded-sm disabled:opacity-40"
            style={{ fontFamily: latoStack, backgroundColor: palette.green, color: palette.surface }}
          >
            {saving ? 'Bezig…' : 'Baan opslaan'}
          </button>
        </div>
      </div>
    </div>
  )
}
