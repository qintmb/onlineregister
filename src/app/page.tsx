'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { MotionBackground } from '@/components/MotionBackground'
import { RegistrationForm } from '@/components/RegistrationForm'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden">
      <MotionBackground />
      
      {/* Logo & Title Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-4"
        >
          <Image
            src="/st_logo.png"
            alt="Logo PT Semen Tonasa"
            width={80}
            height={80}
            priority
            className="mx-auto drop-shadow-2xl"
          />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold font-sig-headline mb-1"
        >
          RAKER 2026
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg sm:text-xl font-sig-text mb-1"
        >
          PT SEMEN TONASA
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-sm sm:text-base font-sig-text"
        >
          Makassar, 11 - 12 Februari 2026
        </motion.p>
      </motion.div>

      {/* Registration Form */}
      <RegistrationForm />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-center text-white/30 text-xs"
      >
        © 2026 PT Semen Tonasa. All rights reserved.
      </motion.footer>
    </main>
  )
}
