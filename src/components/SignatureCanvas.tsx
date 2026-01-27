'use client'

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Eraser, Pencil, Lock } from 'lucide-react'

export interface SignatureCanvasHandle {
  resetSignature: () => void
}

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void
  disabled?: boolean
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(({ onSignatureChange, disabled = false }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  
  // Refs for drawing state to avoid closure staleness in event listeners
  const drawingState = useRef({
    isDrawing: false,
    lastX: 0,
    lastY: 0
  })

  // Initialize and handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      
      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // Make it visually fill the positioned parent
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Scale all drawing operations by the dpr, so you don't have to worry about the difference.
        ctx.scale(dpr, dpr)
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }

    // Initial resize
    resizeCanvas()

    // Observe container resize
    const resizeObserver = new ResizeObserver(() => {
     // Optional: Debounce this if needed, but usually fine for layout shifts
      resizeCanvas()
    })
    
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useImperativeHandle(ref, () => ({
    resetSignature: () => {
      clearCanvas()
    }
  }))

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
       // Touch event
       if (e.touches.length > 0) {
         clientX = e.touches[0].clientX
         clientY = e.touches[0].clientY
       } else {
         return { x: drawingState.current.lastX, y: drawingState.current.lastY }
       }
    } else {
      // Mouse event
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    return {
      x: clientX! - rect.left,
      y: clientY! - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    // Prevent scrolling when touching the canvas to draw
    if (e.cancelable && e.type.startsWith('touch')) e.preventDefault()
    
    const { x, y } = getCoordinates(e)
    
    drawingState.current.isDrawing = true
    drawingState.current.lastX = x
    drawingState.current.lastY = y
    
    setIsDrawing(true)
    
    // Draw a single dot
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
        ctx.beginPath()
        ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2)
        ctx.fillStyle = ctx.strokeStyle
        ctx.fill()
        ctx.beginPath() // Start new path for movement
        ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !drawingState.current.isDrawing) return
    if (e.cancelable && e.type.startsWith('touch')) e.preventDefault()
    
    const { x, y } = getCoordinates(e)
    const { lastX, lastY } = drawingState.current
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Request Animation Frame optimization implied by browser's event handling + canvas speed,
    // but we can draw smooth curves directly here.
    
    // Quadratic curve for smoother lines
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    // Use average point for quadratic curve which makes it smoother
    // const midX = (lastX + x) / 2
    // const midY = (lastY + y) / 2
    // ctx.quadraticCurveTo(lastX, lastY, midX, midY)
    
    // Simple line for responsiveness (quadratic can lag slightly purely on math)
    ctx.lineTo(x, y)
    ctx.stroke()
    
    drawingState.current.lastX = x
    drawingState.current.lastY = y

    if (!hasSignature) {
      setHasSignature(true)
    }
  }

  const endDrawing = () => {
    if (drawingState.current.isDrawing) {
      drawingState.current.isDrawing = false
      setIsDrawing(false)
      saveSignature()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Clear with consideration of the scale
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      
      setHasSignature(false)
      onSignatureChange(null)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      // We need to create a new canvas to normalize the output size 
      // or just export what we have.
      // Exporting directly from the scaled canvas is usually fine, 
      // but let's ensure white background.
      
      const newCanvas = document.createElement('canvas')
      newCanvas.width = canvas.width
      newCanvas.height = canvas.height
      const ctx = newCanvas.getContext('2d')
      
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
        ctx.drawImage(canvas, 0, 0)
        
        // Quality 0.6 is good enough for signatures and smaller size
        const dataUrl = newCanvas.toDataURL('image/jpeg', 0.6)
        onSignatureChange(dataUrl)
      }
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className={`text-[10px] font-bold tracking-wider uppercase ${disabled ? 'text-slate-300' : 'text-slate-500'}`}>
          TANDA TANGAN
        </label>
        {hasSignature && !disabled && (
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
      
      <div 
        ref={containerRef}
        className={`relative rounded-xl overflow-hidden glass-input p-0 h-40 group select-none ${
           disabled 
             ? 'bg-slate-100 cursor-not-allowed opacity-75' 
             : 'bg-white/90 cursor-crosshair touch-none'
        }`}
      >
        {/* Placeholder / overlay */}
        {(!hasSignature || disabled) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            {disabled ? (
              <>
                <Lock className="text-slate-400 mb-1" size={20} />
                <span className="text-[10px] text-slate-400 font-medium">Pilih nama untuk ttd</span>
              </>
            ) : (
              <>
                <Pencil className="text-black mb-1" size={20} />
                <span className="text-[10px] text-black font-medium">Tanda tangan di sini</span>
              </>
            )}
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
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
