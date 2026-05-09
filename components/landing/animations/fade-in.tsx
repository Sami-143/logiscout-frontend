"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { type ReactNode } from "react"

type Direction = "up" | "down" | "left" | "right" | "none"

interface FadeInProps {
  children: ReactNode
  direction?: Direction
  /** Delay in seconds before the animation starts. */
  delay?: number
  /** Movement distance in pixels. */
  distance?: number
  /** Animation duration in seconds. */
  duration?: number
  /** Run only the first time the element scrolls into view. */
  once?: boolean
  /** Viewport amount required before the animation triggers (0-1). */
  amount?: number
  className?: string
  as?: keyof typeof motion
}

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return { y: distance }
    case "down":
      return { y: -distance }
    case "left":
      return { x: distance }
    case "right":
      return { x: -distance }
    default:
      return {}
  }
}

/**
 * Reveal-on-scroll wrapper. Honors `prefers-reduced-motion` by short-circuiting
 * to a no-op so the layout never depends on motion to be readable.
 */
export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  distance = 24,
  duration = 0.55,
  once = true,
  amount = 0.2,
  className,
  as = "div",
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()
  const Tag = motion[as] as typeof motion.div

  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>
  }

  const variants: Variants = {
    hidden: { opacity: 0, ...offsetFor(direction, distance) },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </Tag>
  )
}
