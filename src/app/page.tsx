"use client";

import Image from "next/image";
import { MotionBackground } from "@/components/MotionBackground";
import { RegistrationForm } from "@/components/RegistrationForm";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden">
      <MotionBackground />

      {/* Logo & Title Section - CSS animations instead of framer-motion */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="mb-3">
          <Image
            src="/st_logo.webp"
            alt="SEMEN TONASA"
            width={120}
            height={120}
            priority
            className="mx-auto drop-shadow-2xl"
          />
        </div>
        <p className="font-heading font-bold text-sig-heading text-center leading-tight tracking-wider">
          DIGITAL ABSENSI
        </p>
        <p className="font-heading font-bold text-sig-heading text-center leading-tight tracking-wider">
          RAPAT BOD - BAND 1
        </p>
        <p className="font-sig-text text-slate-600 text-sm mt-2 text-center">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      {/* Registration Form */}
      <RegistrationForm />

      {/* Footer */}
      <footer className="mt-8 text-center text-slate-400 text-[9px]">
        © 2026 PT Semen Tonasa. All rights reserved.
      </footer>
    </main>
  );
}
