import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useFadeIn } from '../hooks/useFadeIn'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

const MONTHS_NL = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
]
const DAYS_NL = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

function parseDate(iso) {
  // iso is either "YYYY-MM-DD" (all-day) or a full datetime ISO string
  return new Date(iso)
}

function formatTime(iso) {
  const d = parseDate(iso)
  return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

// Group events by "MMMM YYYY"
function groupByMonth(events) {
  const groups = []
  let current = null

  for (const ev of events) {
    const d = parseDate(ev.start)
    const key = `${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`
    if (!current || current.label !== key) {
      current = { label: key, events: [] }
      groups.push(current)
    }
    current.events.push(ev)
  }
  return groups
}

function EventRow({ ev }) {
  const start = parseDate(ev.start)
  const day   = start.getDate()
  const dow   = DAYS_NL[start.getDay()]

  const timeStr = ev.all_day
    ? 'Hele dag'
    : formatTime(ev.start)

  const meta = [timeStr, ev.location].filter(Boolean).join(' · ')

  return (
    <div className="grid gap-x-6" style={{ gridTemplateColumns: '3rem 1fr' }}>
      {/* Date column */}
      <div className="text-right pt-0.5" style={{ fontFamily: iowanStack }}>
        <div className="text-2xl font-normal text-stone-700 leading-none">{day}</div>
        <div className="text-xs text-stone-400 tracking-widest uppercase mt-1">{dow}</div>
      </div>

      {/* Event column */}
      <div className="border-l border-stone-200 pl-6 pb-6">
        <div className="text-sm text-stone-800 leading-snug" style={{ fontFamily: iowanStack }}>
          {ev.title}
        </div>
        {meta && (
          <div className="text-xs text-stone-400 mt-1 tracking-wide" style={{ fontFamily: latoStack }}>
            {meta}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TigrisSilvaeAgenda() {
  const fadeIn = useFadeIn()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.listEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const groups = groupByMonth(events)

  return (
    <main
      className="min-h-[calc(100vh-3.5rem)] flex justify-center px-6 py-16"
      style={{ fontFamily: latoStack }}
    >
      <div className="w-full max-w-sm">

        {/* Page title */}
        <h2
          className="text-3xl font-normal text-stone-800 mb-10"
          style={{ fontFamily: iowanStack, ...fadeIn(0) }}
        >
          Agenda
        </h2>

        {loading ? (
          <p className="text-xs text-stone-400 tracking-widest uppercase" style={fadeIn(0.1)}>
            Laden…
          </p>
        ) : events.length === 0 ? (
          <div style={fadeIn(0.1)}>
            <div className="w-8 border-t border-stone-200 mb-4" />
            <p className="text-xs text-stone-400 tracking-widest uppercase">
              Geen aankomende evenementen
            </p>
          </div>
        ) : (
          <div style={fadeIn(0.1)}>
            {groups.map((group, gi) => (
              <div key={group.label} className={gi > 0 ? 'mt-10' : ''}>
                {/* Month header */}
                <p className="text-xs text-stone-400 tracking-widest uppercase mb-6" style={{ fontFamily: latoStack }}>
                  {group.label}
                </p>

                {/* Events */}
                {group.events.map(ev => (
                  <EventRow key={ev.id} ev={ev} />
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
