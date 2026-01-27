'use client'

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Eraser, Pencil } from 'lucide-react'

export interface SignatureCanvasHandle {
  resetSignature: () => void
}

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(({ onSignatureChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }, [])

  useImperativeHandle(ref, () => ({
    resetSignature: () => {
      clearCanvas()
    }
  }))

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to stop scrolling on mobile while drawing
    // e.preventDefault() // Need to be careful with passive events in React 18
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    
    if (!hasSignature) {
      setHasSignature(true)
    }
  }

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveSignature()
    }
  }

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
      onSignatureChange(null)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      // Export as JPEG with white background
      const newCanvas = document.createElement('canvas')
      newCanvas.width = canvas.width
      newCanvas.height = canvas.height
      const ctx = newCanvas.getContext('2d')
      
      if (ctx) {
        // Fill white background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
        // Draw original canvas
        ctx.drawImage(canvas, 0, 0)
        
        const dataUrl = newCanvas.toDataURL('image/jpeg', 0.8)
        onSignatureChange(dataUrl)
      }
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">TANDA TANGAN</label>
        {hasSignature && (
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-[10px] text-red-600 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded transition-colors"
          >
            <Eraser size={12} />
            Hapus
          </button>
        )}
      </div>
      
      <div className="relative rounded-xl overflow-hidden glass-input p-0 h-40 group cursor-crosshair bg-white/90">
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <Pencil className="text-black mb-1" size={20} />
            <span className="text-[10px] text-black font-medium">Tanda tangan di sini</span>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
    </div>
  )
})

SignatureCanvas.displayName = 'SignatureCanvas'
