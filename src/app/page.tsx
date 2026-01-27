'use client'

import Image from 'next/image'
import { MotionBackground } from '@/components/MotionBackground'
import { RegistrationForm } from '@/components/RegistrationForm'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden">
      <MotionBackground />
      
      {/* Logo & Title Section - CSS animations instead of framer-motion */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="mb-3">
          <Image
            src="/st_logo.png"
            alt="Logo PT Semen Tonasa"
            width={80}
            height={80}
            priority
            className="mx-auto drop-shadow-2xl"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-sig-headline mb-1 leading-tight">
          RAKER 2026
        </h1>
        <h2 className="text-lg sm:text-xl font-sig-text mb-1 leading-tight">
          PT SEMEN TONASA
        </h2>        
        <p className="text-sm sm:text-base font-sig-text leading-tight">
          Makassar, 11 - 12 Februari 2026
        </p>
      </div>
      {/* Registration Form */}
      <RegistrationForm />

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-400 text-xs">
        © 2026 PT Semen Tonasa. All rights reserved.
      </footer>
    </main>
  )
}
