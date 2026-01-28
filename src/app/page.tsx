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
            src="/raker_logo.svg"
            alt="RAKER LOGO"
            width={230}
            height={230}
            priority
            className="mx-auto drop-shadow-2xl"
          />
        </div>     
        <p className="text-[10px] sm:text-base font-sig-text leading-tight">
          Makassar, 11 - 12 Februari 2026
        </p>
      </div>
      {/* Registration Form */}
      <RegistrationForm />

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-400 text-[9px]">
        © 2026 PT Semen Tonasa. All rights reserved.
      </footer>
    </main>
  )
}
