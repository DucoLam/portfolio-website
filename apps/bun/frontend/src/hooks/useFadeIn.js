import { useEffect, useState } from 'react'

export function useFadeIn(initialDelay = 50) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), initialDelay)
    return () => clearTimeout(t)
  }, [initialDelay])

  return (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  })
}
