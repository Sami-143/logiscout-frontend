"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { type ReactNode } from "react"

interface StaggerContainerProps {
  children: ReactNode
  /** Stagger between children, in seconds. */
  staggerChildren?: number
  /** Delay before the first child runs. */
  delayChildren?: number
  /** Trigger only on first scroll-in. */
  once?: boolean
  /** Viewport amount required before the animation triggers (0-1). */
  amount?: number
  className?: string
}

interface StaggerItemProps {
  children: ReactNode
  /** Distance to translate from in pixels. */
  distance?: number
  className?: string
}

/**
 * Coordinates a sequence of <StaggerItem>s. Place items as direct children
 * for the stagger to apply.
 */
export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  once = true,
  amount = 0.2,
  className,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  distance = 20,
  className,
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const variants: Variants = {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  )
}
