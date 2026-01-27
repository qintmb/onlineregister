'use client'

// Simplified, lightweight background - no heavy blur or complex animations
export function MotionBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Static gradient - GPU accelerated, very light */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50" />
      
      {/* Subtle decorative circles - CSS only, no JS animations */}
      <div 
        className="absolute top-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-100/50"
        style={{ transform: 'translateZ(0)' }} // Force GPU layer
      />
      <div 
        className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/50"
        style={{ transform: 'translateZ(0)' }}
      />
    </div>
  )
}
