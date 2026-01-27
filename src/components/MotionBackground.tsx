'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function MotionBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-10 bg-slate-50 overflow-hidden">
      {/* Soft Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50" />
      
      {/* Animated Orbs - Lighter colors */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.2, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200 blur-[80px]"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.2, 0.3],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-200 blur-[80px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-sky-200 blur-[60px]"
      />
    </div>
  )
}
