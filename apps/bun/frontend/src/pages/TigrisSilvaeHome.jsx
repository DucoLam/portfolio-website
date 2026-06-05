import { useOutletContext } from 'react-router-dom'
import { useFadeIn } from '../hooks/useFadeIn'

const iowanStack = '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
const latoStack = "'Lato', sans-serif"

export default function TigrisSilvaeHome() {
  const { user } = useOutletContext()
  const fadeIn = useFadeIn()

  return (
    <main
      className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center"
      style={{ fontFamily: iowanStack }}
    >
      <div className="flex flex-col items-center w-full max-w-sm px-6 sm:px-4 gap-5 text-center">

        <h1
          className="text-4xl sm:text-6xl md:text-8xl font-normal tracking-wide text-stone-800 whitespace-nowrap"
          style={fadeIn(0)}
        >
          Tigris Silvae
        </h1>

        <p
          className="text-sm text-stone-500 tracking-widest uppercase"
          style={{ fontFamily: latoStack, ...fadeIn(0.15) }}
        >
          Welkom, {user?.username}
        </p>

        <div className="w-12 border-t border-stone-300" style={fadeIn(0.3)} />

        <p
          className="text-sm text-stone-400 leading-relaxed"
          style={{ fontFamily: latoStack, ...fadeIn(0.45) }}
        >
          Fijn dat je er bent.
        </p>

      </div>
    </main>
  )
}
