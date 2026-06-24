// Tigris Silvae — club palette.
// Sleek-classy: soft off-white, club-blazer navy / Rolex green / bordeaux,
// a champagne-gold hairline accent, and repp-tie stripes as the motif.

export const palette = {
  bg:       '#F4F1EA', // soft off-white page
  surface:  '#FBFAF6', // card surface
  navy:     '#1B2A4A',
  green:    '#0A5C36', // rolex green
  bordeaux: '#6E1A2B',
  gold:     '#B08D57', // champagne hairline
  ink:      '#262219', // near-black text
  muted:    '#8A8478',
  line:     '#E5E0D4',
}

export const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
export const latoStack  = "'Lato', sans-serif"

// The four leaderboards. `lowerBetter` drives the value formatting & sort hint.
export const METRICS = [
  { key: 'net_best', label: 'Net',        sub: 'Beste ronde',   color: palette.navy,     lowerBetter: true,  unit: '' },
  { key: 'net_avg',  label: 'Net Gem.',   sub: 'Gemiddeld',     color: palette.green,    lowerBetter: true,  unit: '' },
  { key: 'stbl_best',label: 'Stableford', sub: 'Beste ronde',   color: palette.bordeaux, lowerBetter: false, unit: ' pt' },
  { key: 'stbl_avg', label: 'Stbl. Gem.', sub: 'Gemiddeld',     color: palette.gold,     lowerBetter: false, unit: ' pt' },
]

// Repp-tie diagonal stripe — pass the accent colour for the active metric.
export function stripeBg(color, { angle = 135, on = 3, off = 9 } = {}) {
  return {
    backgroundImage: `repeating-linear-gradient(${angle}deg, ${color} 0, ${color} ${on}px, transparent ${on}px, transparent ${on + off}px)`,
  }
}
