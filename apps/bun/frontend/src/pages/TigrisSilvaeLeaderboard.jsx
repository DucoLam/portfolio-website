import { useEffect, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFadeIn } from '../hooks/useFadeIn'
import { api } from '../utils/api'
import { palette, iowanStack, latoStack, stripeBg, METRICS } from '../theme'
import SubmitRoundModal from '../components/SubmitRoundModal'

export default function TigrisSilvaeLeaderboard() {
  const fadeIn = useFadeIn()
  const ctx = useOutletContext() || {}
  const me = ctx.user || {}

  const [metricIdx, setMetricIdx] = useState(0)
  const [scope, setScope]         = useState('season') // season | all
  const [courseFilter, setCourseFilter] = useState('') // '' = all courses

  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [players, setPlayers] = useState([])
  const [pending, setPending] = useState([])

  const [showSubmit, setShowSubmit] = useState(false)
  const [showAttest, setShowAttest] = useState(false)

  const metric = METRICS[metricIdx]

  const loadBoard = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await api.leaderboard(metric.key, scope, courseFilter || undefined))
    } finally {
      setLoading(false)
    }
  }, [metric.key, scope, courseFilter])

  // Reference data — once
  useEffect(() => {
    api.listCourses().then(setCourses).catch(() => {})
    api.listPlayers().then(setPlayers).catch(() => {})
    api.pendingRounds().then(setPending).catch(() => {})
  }, [])

  // Board — on filter change
  useEffect(() => { loadBoard() }, [loadBoard])

  const fmt = (v) => {
    const n = Math.round(v * 10) / 10
    return (Number.isInteger(n) ? n : n.toFixed(1)) + metric.unit
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] py-12 px-4" style={{ fontFamily: iowanStack }}>
      <div className="mx-auto w-full max-w-2xl flex flex-col items-center gap-7">

        {/* Header */}
        <div className="flex flex-col items-center gap-3" style={fadeIn(0)}>
          <h2 className="text-4xl sm:text-5xl font-normal tracking-wide" style={{ color: palette.ink }}>
            Leaderboard
          </h2>
          <div className="h-1 w-24 rounded-full" style={stripeBg(metric.color)} />
        </div>

        {/* 4-way sliding selector */}
        <div className="relative w-full rounded-full p-1" style={{ ...fadeIn(0.1), backgroundColor: palette.bg, border: `1px solid ${palette.line}` }}>
          <div
            className="absolute top-1 bottom-1 rounded-full"
            style={{
              left: `calc(${metricIdx * 25}% + 4px)`,
              width: 'calc(25% - 8px)',
              backgroundColor: metric.color,
              transition: 'left 0.32s cubic-bezier(0.4,0,0.2,1), background-color 0.32s ease',
            }}
          />
          <div className="relative grid grid-cols-4">
            {METRICS.map((m, i) => (
              <button
                key={m.key}
                onClick={() => setMetricIdx(i)}
                className="flex flex-col items-center py-2 px-1 rounded-full"
                style={{ fontFamily: latoStack, color: i === metricIdx ? palette.surface : palette.muted }}
              >
                <span className="text-xs sm:text-sm tracking-wide whitespace-nowrap">{m.label}</span>
                <span className="text-[10px] opacity-80 hidden sm:block">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scope + course filters */}
        <div className="flex items-center justify-between w-full" style={{ ...fadeIn(0.15), fontFamily: latoStack }}>
          <div className="flex items-center gap-1 text-xs tracking-widest uppercase">
            {[['season', 'Seizoen'], ['all', 'Aller tijden']].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setScope(k)}
                className="px-3 py-1 rounded-full transition-colors"
                style={{ color: scope === k ? palette.surface : palette.muted, backgroundColor: scope === k ? palette.ink : 'transparent' }}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="text-xs px-2 py-1 rounded-sm tracking-wide"
            style={{ fontFamily: latoStack, color: palette.ink, backgroundColor: palette.surface, border: `1px solid ${palette.line}` }}
          >
            <option value="">Alle banen</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Board */}
        <div className="w-full rounded-sm overflow-hidden" style={{ ...fadeIn(0.2), backgroundColor: palette.surface, border: `1px solid ${palette.line}` }}>
          <div className="h-1.5 w-full" style={stripeBg(metric.color)} />
          <div
            className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 px-5 py-3 text-[11px] tracking-widest uppercase"
            style={{ fontFamily: latoStack, color: palette.muted, borderBottom: `1px solid ${palette.line}` }}
          >
            <span>#</span><span>Speler</span><span className="text-right">{metric.label}</span><span className="text-right">Ronden</span>
          </div>

          {loading ? (
            <p className="text-center py-10 text-sm" style={{ fontFamily: latoStack, color: palette.muted }}>Laden…</p>
          ) : rows.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ fontFamily: latoStack, color: palette.muted }}>
              Nog geen bevestigde ronden.
            </p>
          ) : (
            rows.map(row => {
              const isMe = row.player_username === me.username
              return (
                <div
                  key={row.player_username}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 items-center px-5 py-3"
                  style={{ fontFamily: latoStack, borderBottom: `1px solid ${palette.line}`, backgroundColor: isMe ? palette.bg : 'transparent' }}
                >
                  <RankChip rank={row.rank} color={metric.color} />
                  <span className="text-sm truncate" style={{ color: palette.ink, fontWeight: isMe ? 600 : 400 }}>
                    {row.player_username}
                  </span>
                  <span className="text-right text-base" style={{ color: metric.color }}>{fmt(row.value)}</span>
                  <span className="text-right text-xs" style={{ color: palette.muted }}>{row.rounds_count}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full" style={{ ...fadeIn(0.25), fontFamily: latoStack }}>
          <button
            onClick={() => setShowSubmit(true)}
            className="flex-1 py-3 text-sm tracking-widest uppercase rounded-sm"
            style={{ backgroundColor: palette.navy, color: palette.surface }}
          >
            Score inleveren
          </button>
          {pending.length > 0 && (
            <button
              onClick={() => setShowAttest(true)}
              className="py-3 px-5 text-sm tracking-widest uppercase rounded-sm"
              style={{ color: palette.bordeaux, border: `1px solid ${palette.bordeaux}` }}
            >
              Te bevestigen ({pending.length})
            </button>
          )}
        </div>
      </div>

      {showSubmit && (
        <SubmitRoundModal
          courses={courses}
          players={players}
          currentUsername={me.username}
          defaultHandicap={me.handicap}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => loadBoard()}
        />
      )}

      {showAttest && (
        <AttestModal
          pending={pending}
          onClose={() => setShowAttest(false)}
          onResolved={(id) => {
            setPending(p => p.filter(r => r.id !== id))
            loadBoard()
          }}
        />
      )}
    </main>
  )
}

function RankChip({ rank, color }) {
  const top3 = rank <= 3
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
      style={{
        fontFamily: latoStack,
        color: top3 ? palette.surface : palette.muted,
        backgroundColor: top3 ? color : 'transparent',
        border: top3 ? 'none' : `1px solid ${palette.line}`,
      }}
    >
      {rank}
    </span>
  )
}

function AttestModal({ pending, onClose, onResolved }) {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  const act = async (id, action) => {
    setBusy(id + action)
    setError(null)
    try {
      await api.attestRound(id, action)
      onResolved(id)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto py-6 px-4"
      style={{ backgroundColor: 'rgba(38,34,25,0.45)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-lg rounded-sm shadow-xl" style={{ backgroundColor: palette.surface }} onClick={e => e.stopPropagation()}>
        <div className="h-1.5 w-full" style={stripeBg(palette.bordeaux)} />
        <div className="p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl tracking-wide" style={{ fontFamily: iowanStack, color: palette.ink }}>Te bevestigen</h2>
            <button onClick={onClose} className="text-xs tracking-widest uppercase" style={{ fontFamily: latoStack, color: palette.muted }}>Sluiten</button>
          </div>
          <p className="text-sm" style={{ fontFamily: latoStack, color: palette.muted }}>
            Je bent als marker opgegeven. Bevestig of betwist deze ronden.
          </p>

          {error && <p className="text-sm" style={{ fontFamily: latoStack, color: palette.bordeaux }}>{error}</p>}

          {pending.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ fontFamily: latoStack, color: palette.muted }}>Niets meer te bevestigen.</p>
          ) : pending.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-3" style={{ fontFamily: latoStack, borderTop: `1px solid ${palette.line}` }}>
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: palette.ink }}>{r.player_username}</p>
                <p className="text-xs" style={{ color: palette.muted }}>
                  {r.course_name} · {r.played_on} · bruto {r.gross_total} · netto {Math.round(r.net_total * 10) / 10} · {r.stableford_total} pt
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => act(r.id, 'confirm')}
                  disabled={busy}
                  className="px-3 py-1.5 text-xs tracking-widest uppercase rounded-sm disabled:opacity-40"
                  style={{ backgroundColor: palette.green, color: palette.surface }}
                >
                  {busy === r.id + 'confirm' ? '…' : 'Bevestig'}
                </button>
                <button
                  onClick={() => act(r.id, 'dispute')}
                  disabled={busy}
                  className="px-3 py-1.5 text-xs tracking-widest uppercase rounded-sm disabled:opacity-40"
                  style={{ color: palette.bordeaux, border: `1px solid ${palette.bordeaux}` }}
                >
                  {busy === r.id + 'dispute' ? '…' : 'Betwist'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
