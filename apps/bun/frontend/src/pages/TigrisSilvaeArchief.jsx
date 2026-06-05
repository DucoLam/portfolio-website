import { useFadeIn } from '../hooks/useFadeIn'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

export default function TigrisSilvaeArchief() {
  const fadeIn = useFadeIn()

  return (
    <main
      className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center"
      style={{ fontFamily: iowanStack }}
    >
      <div className="flex flex-col items-center w-full max-w-sm px-6 sm:px-4 gap-5 text-center">

        <h2
          className="text-4xl sm:text-5xl font-normal tracking-wide text-stone-800"
          style={fadeIn(0)}
        >
          Archief
        </h2>

        <div className="w-12 border-t border-stone-300" style={fadeIn(0.15)} />

        <p
          className="text-sm text-stone-400"
          style={{ fontFamily: latoStack, ...fadeIn(0.3) }}
        >
          Binnenkort beschikbaar.
        </p>

      </div>
    </main>
  )
}
