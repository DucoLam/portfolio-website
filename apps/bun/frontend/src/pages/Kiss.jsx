import { useState, useCallback, useRef } from 'react'

const LIFETIME = 3000  // ms before a kiss is removed
const NOTE_LIFE = 3600 // ms before a love-note is removed
const NOTE_CHANCE = 0.16
const MAX_ON_SCREEN = 80
const serifStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack  = "'Lato', sans-serif"

let _id = 0
const rand = (min, max) => min + Math.random() * (max - min)

export default function Kiss() {
  const [kisses, setKisses] = useState([])
  const [notes, setNotes]   = useState([])
  const [count, setCount]   = useState(0)
  const [touched, setTouched] = useState(false)
  const timers = useRef(new Set())

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => { fn(); timers.current.delete(t) }, ms)
    timers.current.add(t)
  }, [])

  const addKiss = useCallback((x, y) => {
    const id = _id++
    const kiss = { id, x, y, size: rand(7, 13), rot: rand(-28, 28), hue: rand(-14, 16) }
    setKisses(k => [...k.slice(-(MAX_ON_SCREEN - 1)), kiss])
    setCount(c => c + 1)
    later(() => setKisses(k => k.filter(p => p.id !== id)), LIFETIME)
  }, [later])

  const addNote = useCallback((x, y) => {
    const id = _id++
    setNotes(n => [...n, { id, x, y, rot: rand(-6, 6) }])
    later(() => setNotes(n => n.filter(p => p.id !== id)), NOTE_LIFE)
  }, [later])

  // Tap or spam (multi-touch fires once per finger) → a kiss lands somewhere random.
  const handlePointerDown = useCallback(() => {
    setTouched(true)
    if (Math.random() < NOTE_CHANCE) {
      const x = rand(30, 70), y = rand(20, 80)   // keep the text on-screen
      addNote(x, y)
      addKiss(x, y + 9)                            // a kiss right with the note
    } else {
      addKiss(rand(8, 92), rand(12, 88))
    }
  }, [addKiss, addNote])

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden', cursor: 'pointer',
        background: 'radial-gradient(circle at 50% 38%, #fff4f6 0%, #ffe1ea 55%, #ffd0de 100%)',
        userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{KEYFRAMES}</style>

      {kisses.map(k => (
        <div key={k.id} style={{
          position: 'absolute', left: `${k.x}%`, top: `${k.y}%`,
          width: `${k.size}vmin`, transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', willChange: 'transform, opacity',
        }}>
          <div style={{ '--r': `${k.rot}deg`, filter: `hue-rotate(${k.hue}deg) drop-shadow(0 0.4vmin 0.6vmin rgba(180,20,60,0.25))`, animation: `kiss-pop ${LIFETIME}ms ease forwards` }}>
            <Lips />
          </div>
        </div>
      ))}

      {notes.map(n => (
        <p key={n.id} style={{
          position: 'absolute', left: `${n.x}%`, top: `${n.y}%`,
          '--nr': `${n.rot}deg`,
          margin: 0, whiteSpace: 'nowrap', pointerEvents: 'none',
          color: '#c9184a', fontFamily: serifStack, fontWeight: 400,
          fontSize: 'clamp(1.2rem, 4.5vw, 2rem)',
          textShadow: '0 2px 16px rgba(201,24,74,0.25)',
          animation: `kiss-note ${NOTE_LIFE}ms ease forwards`,
        }}>
          I love you Lailaa!
        </p>
      ))}

      {/* Hint — fades after the first kiss */}
      <p style={{
        position: 'absolute', left: 0, right: 0, top: '46%', textAlign: 'center',
        color: '#c9184a', fontFamily: serifStack, fontSize: 'clamp(1.4rem, 5vw, 2.4rem)',
        letterSpacing: '0.05em', pointerEvents: 'none',
        opacity: touched ? 0 : 1, transition: 'opacity 0.6s ease',
        animation: touched ? 'none' : 'kiss-breathe 2.4s ease-in-out infinite',
      }}>
        kiss me
      </p>

      {/* Running tally */}
      <p style={{
        position: 'absolute', left: 0, right: 0, bottom: '6%', textAlign: 'center',
        color: '#c9184a', fontFamily: latoStack, fontSize: '0.8rem',
        letterSpacing: '0.25em', textTransform: 'uppercase', pointerEvents: 'none',
        opacity: count > 0 ? 0.55 : 0, transition: 'opacity 0.4s ease',
      }}>
        {count} {count === 1 ? 'kiss' : 'kisses'}
      </p>
    </div>
  )
}

function Lips() {
  return (
    <svg viewBox="0 0 100 70" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="kiss-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5577" />
          <stop offset="100%" stopColor="#c01040" />
        </linearGradient>
      </defs>
      {/* upper lip — cupid's bow */}
      <path fill="url(#kiss-grad)" d="M8,34 C12,22 22,14 30,18 C38,21 44,24 50,26 C56,24 62,21 70,18 C78,14 88,22 92,34 C80,31 66,30 50,31 C34,30 20,31 8,34 Z" />
      {/* lower lip */}
      <path fill="url(#kiss-grad)" d="M11,33 C26,35 40,37 50,36 C60,37 74,35 89,33 C87,50 70,60 50,60 C30,60 13,50 11,33 Z" />
      {/* gloss */}
      <ellipse cx="50" cy="46" rx="15" ry="3.6" fill="#fff" opacity="0.22" />
      <ellipse cx="34" cy="24" rx="5" ry="2" fill="#fff" opacity="0.25" transform="rotate(-12 34 24)" />
    </svg>
  )
}

const KEYFRAMES = `
@keyframes kiss-pop {
  0%   { opacity: 0; transform: rotate(var(--r)) scale(0.2)  translateY(0); }
  12%  { opacity: 1; transform: rotate(var(--r)) scale(1.15) translateY(0); }
  24%  { opacity: 1; transform: rotate(var(--r)) scale(1)    translateY(0); }
  68%  { opacity: 1; transform: rotate(var(--r)) scale(1)    translateY(-3px); }
  100% { opacity: 0; transform: rotate(var(--r)) scale(0.88) translateY(-16px); }
}
@keyframes kiss-note {
  0%   { opacity: 0; transform: translate(-50%, -50%) rotate(var(--nr)) scale(0.6); }
  14%  { opacity: 1; transform: translate(-50%, -50%) rotate(var(--nr)) scale(1.06); }
  26%  { opacity: 1; transform: translate(-50%, -50%) rotate(var(--nr)) scale(1); }
  72%  { opacity: 1; transform: translate(-50%, -56%) rotate(var(--nr)) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -74%) rotate(var(--nr)) scale(0.96); }
}
@keyframes kiss-breathe { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
`
