import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for scroll-triggered and entrance reveal animations.
 * @param {number} threshold - Intersection threshold (default 0.1)
 * @param {boolean} triggerOnce - Whether to unobserve after first intersection (default true)
 * @returns {[React.RefObject, boolean]} [ref, isRevealed]
 */
export function useReveal(threshold = 0.1, triggerOnce = true) {
  const ref = useRef(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          if (triggerOnce) {
            observer.unobserve(el)
          }
        } else if (!triggerOnce) {
          setIsRevealed(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, triggerOnce])

  return [ref, isRevealed]
}

export default useReveal
