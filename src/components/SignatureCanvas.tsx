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
  const [hasSignature, setHasSignature] = useState(false)
  
  // Refs for performance - avoid React state updates during drawing
  const drawingState = useRef({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    hasSignature: false,
    scaled: false
  })
  
  // RAF for throttling draw calls
  const rafId = useRef<number | null>(null)
  const lastEvent = useRef<React.MouseEvent | React.TouchEvent | null>(null)

  // Initialize canvas ONCE on mount - no ResizeObserver for mobile performance
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Only set up canvas once
    if (drawingState.current.scaled) return

    const rect = container.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance
    
    // Set actual size in memory
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    // Make it visually fill the parent
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Scale ONCE
      ctx.scale(dpr, dpr)
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      drawingState.current.scaled = true
    }
  }, [])

  useImperativeHandle(ref, () => ({
    resetSignature: () => {
      clearCanvas()
    }
  }))

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        return { x: drawingState.current.lastX, y: drawingState.current.lastY }
      }
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    if (e.cancelable && 'touches' in e) e.preventDefault()
    
    const { x, y } = getCoordinates(e)
    
    drawingState.current.isDrawing = true
    drawingState.current.lastX = x
    drawingState.current.lastY = y
    
    // Draw initial dot
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fillStyle = ctx.strokeStyle as string
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  // Actual draw function called by RAF
  const actuallyDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e)
    const { lastX, lastY } = drawingState.current
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()
    
    drawingState.current.lastX = x
    drawingState.current.lastY = y
    
    // Use ref, not state, during drawing
    drawingState.current.hasSignature = true
  }

  // Throttled draw using RAF - max 60fps
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !drawingState.current.isDrawing) return
    if (e.cancelable && 'touches' in e) e.preventDefault()
    
    lastEvent.current = e
    
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        if (lastEvent.current) {
          actuallyDraw(lastEvent.current)
        }
        rafId.current = null
      })
    }
  }

  const endDrawing = () => {
    if (drawingState.current.isDrawing) {
      drawingState.current.isDrawing = false
      
      // Cancel any pending RAF
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
      
      // NOW update React state (only once at end)
      if (drawingState.current.hasSignature && !hasSignature) {
        setHasSignature(true)
      }
      
      saveSignature()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      
      drawingState.current.hasSignature = false
      setHasSignature(false)
      onSignatureChange(null)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (canvas && drawingState.current.hasSignature) {
      const newCanvas = document.createElement('canvas')
      newCanvas.width = canvas.width
      newCanvas.height = canvas.height
      const ctx = newCanvas.getContext('2d')
      
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
        ctx.drawImage(canvas, 0, 0)
        
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
             : 'bg-white cursor-crosshair'
        }`}
        style={{ touchAction: disabled ? 'auto' : 'none' }}
      >
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
