"use client"

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import { useEffect } from "react"

interface AnimatedNumberProps {
  from?: number
  to: number
  duration?: number
  className?: string
}

export function AnimatedNumber({
  from = 0,
  to,
  duration = 5,
  className,
}: AnimatedNumberProps) {
  const count = useMotionValue(from)
  // 소수점 → 정수 반올림
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, to, { duration })
    return () => {
      controls.stop()
    }
  }, [count, to, duration])

  return (
    <motion.span className={className}>
      {rounded}
    </motion.span>
  )
}
