"use client"

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion"
import { useEffect, useRef } from "react"

interface AnimatedCounterProps {
  /**
   * Numeric target. If you want to display non-numeric content like "<1s" or
   * "5 min", pass `value={1}` and let `prefix` / `suffix` carry the rest.
   */
  value: number
  prefix?: string
  suffix?: string
  /** Number of decimal places to render. */
  decimals?: number
  /** Duration in seconds. */
  duration?: number
  className?: string
}

/**
 * Counts up from 0 to `value` once the element scrolls into view.
 * Reduced-motion users see the final value immediately with no animation.
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, { once: true, amount: 0.4 })
  const prefersReducedMotion = useReducedMotion()

  const motionValue = useMotionValue(prefersReducedMotion ? value : 0)
  const display = useTransform(motionValue, (latest) =>
    `${prefix}${latest.toFixed(decimals)}${suffix}`,
  )

  useEffect(() => {
    if (!isInView) return
    if (prefersReducedMotion) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => controls.stop()
  }, [isInView, value, duration, motionValue, prefersReducedMotion])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
