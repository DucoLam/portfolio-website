import { useState, useCallback } from 'react'

// ── Tuning ───────────────────────────────────────────────────────────
const START   = 5      // heart size in vmin at the start of each scene
const GROWTH  = 1.55   // size multiplier per click
const FILL    = 52     // vmin: heart "outgrows" a scene at this size → zoom out
const EARTH   = 42     // vmin: Earth's on-screen size in the space scene

const SCENES = [
  { key: 'street',  caption: 'A quiet street' },
  { key: 'city',    caption: 'Over the city' },
  { key: 'country', caption: 'Across the country' },
  { key: 'space',   caption: 'Out among the stars' },
]
const ACCENT = ['#ffb27a', '#9fb6ff', '#a8d98a', '#8fa8ff']

const latoStack  = "'Lato', sans-serif"
const serifStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'

export default function ILoveLailaa() {
  const [stage, setStage]     = useState(0)
  const [size, setSize]       = useState(START)
  const [clicks, setClicks]   = useState(0)
  const [zooming, setZooming] = useState(false)
  const [done, setDone]       = useState(false)
  const [touched, setTouched] = useState(false)

  const scene = SCENES[stage].key

  const grow = useCallback(() => {
    if (done) return
    setTouched(true)
    setClicks(c => c + 1)
    const next = size * GROWTH

    if (scene === 'space') {
      if (next > EARTH) { setSize(EARTH * 1.3); setDone(true) }
      else setSize(next)
      return
    }
    if (next > FILL) {
      setZooming(true)
      setStage(s => s + 1)
      setSize(START)
      setTimeout(() => setZooming(false), 1000)
    } else {
      setSize(next)
    }
  }, [size, scene, done])

  const replay = () => { setDone(false); setStage(0); setSize(START); setClicks(0); setTouched(false) }

  // heart glow intensifies as it grows
  const glow = 1.2 + (size / FILL) * 3.5

  return (
    <div
      onClick={grow}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        cursor: done ? 'default' : 'pointer',
        backgroundColor: '#05060f',
        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* ── Scenes (cinematic cross-fade) ── */}
      {SCENES.map((s, i) => (
        <div
          key={s.key}
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            opacity: i === stage ? 1 : 0,
            transform: i === stage ? 'scale(1)' : `scale(${i < stage ? 0.82 : 1.14})`,
            transition: 'opacity 1s ease, transform 1.1s cubic-bezier(0.65,0,0.35,1)',
            pointerEvents: 'none',
          }}
        >
          <Scene which={s.key} />
        </div>
      ))}

      {/* Earth behind the heart in space */}
      {scene === 'space' && !done && (
        <Earth
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: `${EARTH}vmin`, height: `${EARTH}vmin`,
            transform: 'translate(-50%, -50%)',
            animation: 'ill-earthspin 90s linear infinite, ill-fadein 1.2s ease both',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* soft light pool behind the heart */}
      {!done && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: `${size * 2.4}vmin`, height: `${size * 2.4}vmin`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,120,150,0.35) 0%, rgba(255,120,150,0) 65%)',
          transition: 'width 0.6s ease, height 0.6s ease',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── The heart ── */}
      {!done && (
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: `${size}vmin`,
            transform: 'translate(-50%, -50%)',
            transition: zooming
              ? 'width 0.95s cubic-bezier(0.22,1,0.36,1)'
              : 'width 0.45s cubic-bezier(0.34,1.56,0.64,1)',
            filter: `drop-shadow(0 0 ${glow}vmin rgba(255,80,120,0.6))`,
            willChange: 'width',
          }}
        >
          <Heart key={clicks} pulse />
        </div>
      )}

      {/* ── HUD: scene caption + stage dots ── */}
      {!done && (
        <>
          <p key={stage} style={{
            position: 'absolute', top: '8%', left: 0, right: 0, textAlign: 'center',
            color: 'rgba(255,255,255,0.92)', fontFamily: serifStack,
            fontSize: 'clamp(1.1rem, 3vw, 1.7rem)', letterSpacing: '0.04em',
            textShadow: '0 2px 18px rgba(0,0,0,0.5)',
            animation: 'ill-caption 1s ease both', pointerEvents: 'none',
          }}>
            {SCENES[stage].caption}
          </p>
          <div style={{
            position: 'absolute', bottom: '6%', left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: '0.7rem', pointerEvents: 'none',
          }}>
            {SCENES.map((s, i) => (
              <span key={s.key} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: i === stage ? ACCENT[i] : 'rgba(255,255,255,0.28)',
                boxShadow: i === stage ? `0 0 10px ${ACCENT[i]}` : 'none',
                transform: i === stage ? 'scale(1.25)' : 'scale(1)',
                transition: 'all 0.5s ease',
              }} />
            ))}
          </div>
        </>
      )}

      {/* First-tap hint */}
      {!touched && !done && (
        <p style={{
          position: 'absolute', left: 0, right: 0, bottom: '13%', textAlign: 'center',
          color: 'rgba(255,255,255,0.85)', fontFamily: latoStack, fontSize: '0.8rem',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          animation: 'ill-breathe 2.2s ease-in-out infinite', pointerEvents: 'none',
        }}>
          tap the heart
        </p>
      )}

      {done && <Finale onReplay={replay} />}
    </div>
  )
}

// ── Final overlay ──────────────────────────────────────────────────────
function Finale({ onReplay }) {
  const floats = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 5.3 + 3) % 100}%`,
    delay: `${(i % 9) * 0.5}s`,
    dur: `${6 + (i % 6)}s`,
    size: `${1.6 + (i % 5)}vmin`,
    blur: i % 3 === 0 ? '0.4vmin' : '0',
    op: 0.35 + (i % 4) * 0.18,
  }))
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 42%, #36101f 0%, #0b0a1a 60%, #05060f 100%)',
      animation: 'ill-fadein 1s ease both', overflow: 'hidden',
    }}>
      {/* drifting starfield for depth */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}><SpaceScene /></div>

      {/* floating hearts */}
      {floats.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: '-8vmin', left: f.left, width: f.size,
          opacity: f.op, filter: `blur(${f.blur})`,
          animation: `ill-float ${f.dur} linear ${f.delay} infinite`,
        }}><Heart /></div>
      ))}

      <div style={{ width: '24vmin', animation: 'ill-throb 1.8s ease-in-out infinite', filter: 'drop-shadow(0 0 5vmin rgba(255,80,120,0.75))' }}>
        <Heart />
      </div>

      <h1 style={{
        marginTop: '5vmin', maxWidth: '90%', textAlign: 'center', color: '#fff',
        fontFamily: serifStack, lineHeight: 1.3, fontWeight: 400,
        fontSize: 'clamp(1.7rem, 5.2vw, 3.1rem)',
        textShadow: '0 2px 40px rgba(255,90,122,0.5)',
        animation: 'ill-rise 1.2s ease 0.4s both',
      }}>
        That&rsquo;s how much I love you, Lailaa&nbsp;
        <span style={{ color: '#ff7a93' }}>&lt;3</span>
      </h1>

      <button
        onClick={(e) => { e.stopPropagation(); onReplay() }}
        style={{
          marginTop: '5vmin', padding: '0.65rem 1.8rem', background: 'transparent',
          color: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.32)',
          borderRadius: '999px', fontFamily: latoStack, fontSize: '0.72rem',
          letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer',
          animation: 'ill-rise 1.2s ease 0.75s both', transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.32)' }}
      >
        again
      </button>
    </div>
  )
}

// ── Heart ──────────────────────────────────────────────────────────────
function Heart({ pulse = false }) {
  return (
    <svg viewBox="0 0 32 29.6" style={{
      width: '100%', height: 'auto', display: 'block',
      animation: pulse ? 'ill-pop 0.42s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
    }}>
      <defs>
        <linearGradient id="hg" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#ff9db1" />
          <stop offset="48%" stopColor="#ef436a" />
          <stop offset="100%" stopColor="#a8123a" />
        </linearGradient>
        <clipPath id="hclip">
          <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4 c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12,16-21.2C32,3.8,28.2,0,23.6,0z" />
        </clipPath>
      </defs>
      <path clipPath="url(#hclip)" fill="url(#hg)"
        d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4 c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12,16-21.2C32,3.8,28.2,0,23.6,0z" />
      {/* glossy highlight */}
      <ellipse clipPath="url(#hclip)" cx="10" cy="7" rx="6" ry="4" fill="#fff" opacity="0.4" transform="rotate(-20 10 7)" />
      <ellipse clipPath="url(#hclip)" cx="22" cy="6" rx="3" ry="2" fill="#fff" opacity="0.22" />
    </svg>
  )
}

// ── Scenes ───────────────────────────────────────────────────────────
function Scene({ which }) {
  if (which === 'street')  return <StreetScene />
  if (which === 'city')    return <CityScene />
  if (which === 'country') return <CountryScene />
  return <SpaceScene />
}
const sceneSvg = { width: '100%', height: '100%', display: 'block' }

function StreetScene() {
  // A row of dusk-lit canal townhouses along a quiet street.
  const GROUND = 80
  const facade = ['#6e4a4a', '#8a6f42', '#566048', '#49536a', '#7a5a50', '#5e4a58', '#8a7150']
  const roofs  = ['#3b2b2b', '#4a3c22', '#2f3626', '#2a3140', '#43302a', '#342833', '#463722']
  const parts = []
  let x = -6, i = 0
  while (x < 104) {
    const w = 10 + (i * 5) % 6
    const topY = 46 + (i * 23) % 20
    const fc = facade[i % facade.length]
    const rc = roofs[i % roofs.length]
    parts.push(<rect key={`b${i}`} x={x} y={topY} width={w - 0.6} height={GROUND - topY} fill={fc} />)
    // alternate gabled roof / stepped parapet (Dutch canal-house feel)
    if (i % 2 === 0)
      parts.push(<polygon key={`r${i}`} points={`${x - 0.6},${topY} ${x + w / 2 - 0.3},${topY - 6} ${x + w - 1},${topY}`} fill={rc} />)
    else
      parts.push(<polygon key={`r${i}`} points={`${x - 0.6},${topY} ${x - 0.6},${topY - 3} ${x + 2},${topY - 3} ${x + 2},${topY - 5} ${x + w - 3},${topY - 5} ${x + w - 3},${topY - 3} ${x + w - 1},${topY - 3} ${x + w - 1},${topY}`} fill={rc} />)
    // lit windows
    const cols = w > 13 ? 3 : 2
    const rows = Math.max(2, Math.floor((GROUND - topY) / 7))
    for (let r2 = 0; r2 < rows; r2++) {
      const wy = topY + 3.5 + r2 * ((GROUND - topY - 5) / rows)
      if (wy > GROUND - 5.5) break
      for (let c = 0; c < cols; c++) {
        const ww = (w - 3) / cols * 0.62
        const wx = x + 1.6 + c * ((w - 3) / cols)
        const lit = ((i * 3 + r2 * 2 + c) * 7) % 3 !== 0
        parts.push(<rect key={`w${i}-${r2}-${c}`} x={wx} y={wy} width={ww} height="2.6" rx="0.3"
          fill={lit ? '#ffcf87' : '#211b2b'} opacity={lit ? 0.95 : 0.85} />)
      }
    }
    // door
    parts.push(<rect key={`d${i}`} x={x + w / 2 - 1.1} y={GROUND - 4.5} width="2.2" height="4.5" rx="0.4" fill="#1f1825" />)
    parts.push(<rect key={`dl${i}`} x={x + w / 2 - 1.1} y={GROUND - 4.5} width="0.7" height="4.5" fill="#ffcf87" opacity="0.45" />)
    x += w; i++
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={sceneSvg}>
      <defs>
        <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d1640" /><stop offset="48%" stopColor="#5b365f" />
          <stop offset="80%" stopColor="#c66a4f" /><stop offset="100%" stopColor="#f3a86a" />
        </linearGradient>
        <radialGradient id="st-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdf6df" /><stop offset="55%" stopColor="#fdf6df" /><stop offset="100%" stopColor="rgba(253,246,223,0)" />
        </radialGradient>
        <linearGradient id="st-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a4350" /><stop offset="100%" stopColor="#16121c" />
        </linearGradient>
        <radialGradient id="st-vig" cx="50%" cy="46%" r="68%">
          <stop offset="58%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
        <filter id="st-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width="100" height="100" fill="url(#st-sky)" />
      {/* moon + early stars + soft clouds */}
      <circle cx="76" cy="17" r="9" fill="url(#st-moon)" filter="url(#st-blur)" />
      <circle cx="76" cy="17" r="4.5" fill="#fdf8e6" />
      {[[12, 12], [30, 8], [88, 28], [60, 14], [22, 24], [50, 6]].map(([sx, sy], k) =>
        <circle key={k} cx={sx} cy={sy} r="0.4" fill="#fff" opacity="0.7" />)}
      <ellipse cx="35" cy="30" rx="14" ry="3" fill="#d98a76" opacity="0.35" filter="url(#st-blur)" />
      <ellipse cx="68" cy="40" rx="11" ry="2.6" fill="#e6a07e" opacity="0.3" filter="url(#st-blur)" />
      {/* tree silhouette */}
      <rect x="8.4" y="70" width="1.3" height="10" fill="#15101a" />
      <circle cx="9" cy="68" r="5.2" fill="#1d2a1a" filter="url(#st-blur)" />
      {/* houses */}
      {parts}
      {/* street + sidewalk */}
      <rect x="0" y={GROUND} width="100" height={100 - GROUND} fill="url(#st-road)" />
      <rect x="0" y={GROUND} width="100" height="1.4" fill="#5a5360" opacity="0.8" />
      <rect x="0" y="90" width="100" height="0.5" fill="#ffd86b" opacity="0.25" />
      {/* lamp posts with bloom, in front of the houses */}
      {[20, 52, 84].map((lx, k) => (
        <g key={k}>
          <rect x={lx} y="60" width="0.7" height={GROUND - 60} fill="#15121c" />
          <circle cx={lx + 0.35} cy="59.5" r="2.6" fill="#ffe6a8" filter="url(#st-blur)" opacity="0.9" />
          <circle cx={lx + 0.35} cy="59.5" r="0.9" fill="#fff6df" />
          <ellipse cx={lx + 0.35} cy={GROUND + 6} rx="3" ry="1.4" fill="#ffd58a" opacity="0.18" filter="url(#st-blur)" />
        </g>
      ))}
      <rect width="100" height="100" fill="url(#st-vig)" />
    </svg>
  )
}

function CityScene() {
  // three parallax skyline layers — atmospheric perspective
  const layer = (baseY, fill, winOp, seed, step) => {
    const out = []; let x = -3, i = seed
    while (x < 103) {
      const w = 5 + (i * 7) % 9, h = (baseY === 58 ? 10 : baseY === 66 ? 18 : 26) + (i * 13) % (baseY === 58 ? 16 : 30)
      const top = 100 - baseY - h + baseY
      const y = baseY - h
      out.push(<rect key={`${seed}-${i}`} x={x} y={Math.max(y, 2)} width={w - 0.8} height={100 - Math.max(y, 2)} fill={fill} />)
      if (winOp > 0)
        for (let wy = Math.max(y, 2) + 3; wy < 96; wy += 5)
          for (let wx = x + 1.3; wx < x + w - 2; wx += 3.2)
            out.push(<rect key={`${seed}-${i}-${wx}-${wy}`} x={wx} y={wy} width="1.3" height="2" fill="#ffd98a" opacity={((wx + wy) | 0) % 3 ? winOp : winOp * 0.3} />)
      x += w; i++
    }
    return out
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={sceneSvg}>
      <defs>
        <linearGradient id="ci-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1330" /><stop offset="55%" stopColor="#27324f" /><stop offset="100%" stopColor="#4a4a6b" />
        </linearGradient>
        <radialGradient id="ci-moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdf6df" /><stop offset="55%" stopColor="#fdf6df" /><stop offset="100%" stopColor="rgba(253,246,223,0)" />
        </radialGradient>
        <radialGradient id="ci-vig" cx="50%" cy="55%" r="70%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
        </radialGradient>
        <filter id="ci-blur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <rect width="100" height="100" fill="url(#ci-sky)" />
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 41) % 100} cy={(i * 17) % 45} r="0.3" fill="#fff" opacity={0.3 + (i % 4) * 0.12} />)}
      <circle cx="76" cy="18" r="10" fill="url(#ci-moon)" filter="url(#ci-blur)" />
      <circle cx="76" cy="18" r="5" fill="#fdf8e6" />
      {layer(58, '#36436b', 0.4, 3, 6)}{/* far, hazy */}
      {layer(66, '#222c4d', 0.6, 7, 6)}{/* mid */}
      {layer(78, '#141a33', 0.85, 2, 6)}{/* near */}
      <rect width="100" height="100" fill="url(#ci-vig)" />
    </svg>
  )
}

function CountryScene() {
  // Aerial patchwork farmland. Fields tile the whole frame with slanted seams.
  const fields = [
    'M-5,-5 L35,-5 L40,30 L-5,32 Z', 'M35,-5 L70,-5 L72,28 L40,30 Z', 'M70,-5 L105,-5 L105,30 L72,28 Z',
    'M-5,32 L40,30 L44,56 L-5,54 Z', 'M40,30 L72,28 L74,58 L44,56 Z', 'M72,28 L105,30 L105,56 L74,58 Z',
    'M-5,54 L44,56 L46,80 L-5,82 Z', 'M44,56 L74,58 L78,82 L46,80 Z', 'M74,58 L105,56 L105,82 L78,82 Z',
    'M-5,82 L46,80 L50,105 L-5,105 Z', 'M46,80 L78,82 L80,105 L50,105 Z', 'M78,82 L105,82 L105,105 L80,105 Z',
  ]
  const cols = ['#8fb463', '#c7b65f', '#a7c777', '#7ba65d', '#d2c074', '#9abf6e',
                '#b9a24f', '#86ad5f', '#cdbb63', '#94b86a', '#c2cf80', '#7fa055']

  // Organic village clustered at the road junction (~52,60) — not a grid.
  const vx = 52, vy = 60
  const homes = [[0, 0], [2.2, -1.2], [-2, 1], [1.4, 2.2], [-2.6, -1.4], [3.2, 1], [-1, 3], [2.6, -3],
                 [-3.6, 1.8], [0.6, -3.4], [4, -0.6], [-1.6, -2.8], [3.6, 2.6], [-3.2, -0.2]]
  const homeCol = ['#b5705a', '#9c6048', '#8a8a86', '#a86a52', '#7d5648']

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={sceneSvg}>
      <defs>
        <radialGradient id="co-vig" cx="50%" cy="50%" r="62%">
          <stop offset="58%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(20,30,10,0.42)" />
        </radialGradient>
        <filter id="co-blur"><feGaussianBlur stdDeviation="1.4" /></filter>
        <filter id="co-cloud"><feGaussianBlur stdDeviation="2.4" /></filter>
      </defs>
      {/* fields + hedgerows */}
      {fields.map((d, i) => <path key={i} d={d} fill={cols[i]} stroke="#5e7d40" strokeWidth="0.45" opacity="0.97" />)}

      {/* forest clusters — overlapping blobs */}
      {[[20, 30, 5], [74, 22, 6], [30, 90, 5], [88, 80, 5], [13, 64, 4]].map(([cx, cy, s], i) => (
        <g key={i} filter="url(#co-blur)" opacity="0.92">
          {[[0, 0, 1], [-s * 0.6, s * 0.35, 0.8], [s * 0.6, s * 0.25, 0.8], [0, -s * 0.5, 0.7], [s * 0.35, s * 0.55, 0.65]].map(([dx, dy, r], k) =>
            <ellipse key={k} cx={cx + dx} cy={cy + dy} rx={s * r} ry={s * r * 0.82} fill={k % 2 ? '#46723a' : '#3d6633'} />)}
        </g>
      ))}

      {/* river, edge to edge, with a lighter centerline */}
      <path d="M-5,40 C20,46 26,62 48,66 C72,71 80,92 105,98" stroke="#6fb0d8" strokeWidth="2.8" fill="none" opacity="0.85" strokeLinecap="round" />
      <path d="M-5,40 C20,46 26,62 48,66 C72,71 80,92 105,98" stroke="#c6e6f4" strokeWidth="0.9" fill="none" opacity="0.7" />

      {/* connected road network meeting at the village */}
      {['M50,-5 C49,18 54,40 52,60', 'M105,38 C82,46 64,52 52,60', 'M-5,98 C22,86 40,70 52,60'].map((d, i) => (
        <path key={i} d={d} stroke="#d8cba0" strokeWidth="1.1" fill="none" opacity="0.85" />
      ))}

      {/* village — scattered houses + a small church */}
      {homes.map(([dx, dy], i) => (
        <g key={i}>
          <rect x={vx + dx} y={vy + dy} width="1.7" height="1.5" fill={homeCol[i % homeCol.length]} />
          <polygon points={`${vx + dx - 0.2},${vy + dy} ${vx + dx + 0.85},${vy + dy - 0.9} ${vx + dx + 1.9},${vy + dy}`} fill="#6e3d2e" />
        </g>
      ))}
      <rect x={vx - 0.6} y={vy - 1.4} width="1.6" height="3.2" fill="#dcd6c6" />
      <polygon points={`${vx - 0.9},${vy - 1.4} ${vx + 0.2},${vy - 3.4} ${vx + 1.3},${vy - 1.4}`} fill="#7a4a3a" />

      {/* high-altitude clouds + shadows */}
      {[[28, 16, 9], [70, 40, 11], [40, 70, 8]].map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x + 3} cy={y + 6} rx={r} ry={r * 0.5} fill="rgba(30,40,20,0.18)" filter="url(#co-cloud)" />
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.55} fill="#fff" opacity="0.9" filter="url(#co-cloud)" />
        </g>
      ))}
      <rect width="100" height="100" fill="url(#co-vig)" />
    </svg>
  )
}

function SpaceScene() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    cx: (i * 39.7) % 100, cy: (i * 73.3) % 100,
    r: i % 11 === 0 ? 0.6 : i % 5 === 0 ? 0.4 : 0.25,
    o: 0.35 + ((i * 7) % 6) / 9, tw: i % 7 === 0,
  }))
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={sceneSvg}>
      <defs>
        <radialGradient id="sp-bg" cx="50%" cy="42%" r="80%">
          <stop offset="0%" stopColor="#161d3d" /><stop offset="55%" stopColor="#0a0c1f" /><stop offset="100%" stopColor="#04050d" />
        </radialGradient>
        <linearGradient id="sp-milky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(140,150,220,0)" /><stop offset="50%" stopColor="rgba(170,150,210,0.22)" /><stop offset="100%" stopColor="rgba(140,150,220,0)" />
        </linearGradient>
        <filter id="sp-blur"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width="100" height="100" fill="url(#sp-bg)" />
      <rect x="-20" y="20" width="140" height="34" fill="url(#sp-milky)" filter="url(#sp-blur)" transform="rotate(-24 50 50)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fff" opacity={s.o}
          style={s.tw ? { animation: `ill-twinkle ${2 + (i % 4)}s ease-in-out ${(i % 5) * 0.4}s infinite` } : undefined} />
      ))}
    </svg>
  )
}

function Earth({ style }) {
  return (
    <svg viewBox="0 0 100 100" style={style}>
      <defs>
        <radialGradient id="ea-ocean" cx="40%" cy="36%" r="72%">
          <stop offset="0%" stopColor="#7cc1f0" /><stop offset="55%" stopColor="#2f7bbf" /><stop offset="100%" stopColor="#0e3a6b" />
        </radialGradient>
        <radialGradient id="ea-atmo" cx="50%" cy="50%" r="50%">
          <stop offset="80%" stopColor="rgba(130,200,255,0)" /><stop offset="93%" stopColor="rgba(130,200,255,0.5)" /><stop offset="100%" stopColor="rgba(130,200,255,0)" />
        </radialGradient>
        <radialGradient id="ea-term" cx="32%" cy="32%" r="80%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(2,6,20,0.72)" />
        </radialGradient>
        <radialGradient id="ea-glint" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <clipPath id="ea-clip"><circle cx="50" cy="50" r="42" /></clipPath>
        <filter id="ea-cloud"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>
      <circle cx="50" cy="50" r="49" fill="url(#ea-atmo)" />
      <circle cx="50" cy="50" r="42" fill="url(#ea-ocean)" />
      <g clipPath="url(#ea-clip)">
        <g fill="#3f9a55" opacity="0.95">
          <path d="M22,28 q12,-8 20,1 q9,8 -1,16 q-4,7 -14,6 q-12,-2 -13,-12 q-1,-8 8,-11 Z" />
          <path d="M55,20 q14,-2 17,9 q3,12 -9,16 q-6,2 -10,-2 q-7,-7 -3,-16 q2,-5 5,-7 Z" />
          <path d="M42,58 q10,-3 14,6 q3,9 -6,14 q-8,4 -14,-3 q-6,-8 0,-14 q3,-2 6,-3 Z" />
          <path d="M70,55 q9,1 10,9 q1,9 -8,11 q-8,1 -9,-7 q-1,-9 7,-13 Z" />
        </g>
        {/* clouds */}
        <g fill="#fff" opacity="0.8" filter="url(#ea-cloud)">
          <ellipse cx="35" cy="44" rx="14" ry="4" transform="rotate(-18 35 44)" />
          <ellipse cx="62" cy="38" rx="11" ry="3.4" transform="rotate(12 62 38)" />
          <ellipse cx="52" cy="68" rx="13" ry="4" transform="rotate(-8 52 68)" />
        </g>
        {/* night side + glint */}
        <circle cx="50" cy="50" r="42" fill="url(#ea-term)" />
        <ellipse cx="34" cy="30" rx="10" ry="7" fill="url(#ea-glint)" transform="rotate(-25 34 30)" />
      </g>
    </svg>
  )
}

const KEYFRAMES = `
@keyframes ill-pop { 0%{transform:scale(0.88)} 60%{transform:scale(1.07)} 100%{transform:scale(1)} }
@keyframes ill-breathe { 0%,100%{opacity:0.35} 50%{opacity:0.95} }
@keyframes ill-fadein { from{opacity:0} to{opacity:1} }
@keyframes ill-rise { from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:translateY(0)} }
@keyframes ill-throb { 0%,100%{transform:scale(1)} 50%{transform:scale(1.13)} }
@keyframes ill-float { 0%{transform:translateY(0) scale(1)} 12%{opacity:1} 100%{transform:translateY(-118vh) scale(0.55); opacity:0} }
@keyframes ill-twinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
@keyframes ill-caption { 0%{opacity:0; transform:translateY(-10px); letter-spacing:0.2em} 100%{opacity:1; transform:translateY(0); letter-spacing:0.04em} }
@keyframes ill-earthspin { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(8deg)} }
`
