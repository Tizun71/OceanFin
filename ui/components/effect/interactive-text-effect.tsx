"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface Pointer {
  x?: number
  y?: number
}

interface TextBox {
  str: string
  x?: number
  y?: number
  w?: number
  h?: number
}

export interface ParticleTextEffectProps {
  text?: string
  colors?: string[]
  className?: string
  animationForce?: number
  particleDensity?: number
  enableFloating?: boolean // added floating effect prop
  floatingSpeed?: number // added floating speed control
}

const ParticleTextEffect: React.FC<ParticleTextEffectProps> = ({
  text = "OCEAN FIN",
  colors = ["0f172a", "1e3a8a", "1e40af", "0369a1", "0891b2", "06b6d4", "22d3ee", "67e8f9", "a7f3d0", "2dd4bf"],
  className = "fontFamily: monospace;",
  animationForce = 80,
  particleDensity = 4,
  enableFloating = true, // enabled by default
  floatingSpeed = 10, // default floating speed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const particlesRef = useRef<ParticleClass[]>([])
  const pointerRef = useRef<Pointer>({})
  const hasPointerRef = useRef<boolean>(false)
  const interactionRadiusRef = useRef<number>(100)
  const timeRef = useRef<number>(0) // added time tracking for floating

  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 200,
  })

  const [textBox] = useState<TextBox>({ str: text })

  const rand = (max = 1, min = 0, dec = 0): number => {
    return +(min + Math.random() * (max - min)).toFixed(dec)
  }

  class ParticleClass {
    ox: number
    oy: number
    cx: number
    cy: number
    or: number
    cr: number
    pv: number
    ov: number
    f: number
    rgb: number[]
    baseY: number // store base Y for floating calculation

    constructor(x: number, y: number, rgb: number[] = [rand(128), rand(128), rand(128)]) {
      this.ox = x
      this.oy = y
      this.cx = x
      this.cy = y
      this.baseY = y // initialize baseY
      this.or = rand(5, 1)
      this.cr = this.or
      this.pv = 0
      this.ov = 0
      this.f = rand(animationForce + 15, animationForce - 15)
      this.rgb = rgb.map((c) => Math.max(0, c + rand(13, -13)))
    }

    draw() {
      const ctx = ctxRef.current
      if (!ctx) return
      ctx.fillStyle = `rgb(${this.rgb.join(",")})`
      ctx.beginPath()
      ctx.arc(this.cx, this.cy, this.cr, 0, 2 * Math.PI)
      ctx.fill()
    }

    move(interactionRadius: number, hasPointer: boolean, time: number) {
      let moved = false

      if (enableFloating) {
        const floatAmount = Math.sin(time * floatingSpeed * 0.002 + this.oy * 0.01) * 8
        this.oy = this.baseY + floatAmount
      }

      if (hasPointer && pointerRef.current.x !== undefined && pointerRef.current.y !== undefined) {
        const dx = this.cx - pointerRef.current.x
        const dy = this.cy - pointerRef.current.y
        const dist = Math.hypot(dx, dy)
        if (dist < interactionRadius && dist > 0) {
          const force = Math.min(this.f, ((interactionRadius - dist) / dist) * 2)
          this.cx += (dx / dist) * force
          this.cy += (dy / dist) * force
          moved = true
        }
      }

      const odx = this.ox - this.cx
      const ody = this.oy - this.cy
      const od = Math.hypot(odx, ody)

      if (od > 1) {
        const restore = Math.min(od * 0.1, 3)
        this.cx += (odx / od) * restore
        this.cy += (ody / od) * restore
        moved = true
      }

      this.draw()
      return moved
    }
  }

  const dottify = () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas || !textBox.x || !textBox.y || !textBox.w || !textBox.h) return

    const data = ctx.getImageData(textBox.x, textBox.y, textBox.w, textBox.h).data
    const pixels = data
      .reduce((arr: any[], _, i, d) => {
        if (i % 4 === 0) {
          arr.push({
            x: (i / 4) % textBox.w!,
            y: Math.floor(i / 4 / textBox.w!),
            rgb: d.slice(i, i + 4),
          })
        }
        return arr
      }, [])
      .filter((p) => p.rgb[3] && !(p.x % particleDensity) && !(p.y % particleDensity))

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    pixels.forEach((p, i) => {
      particlesRef.current[i] = new ParticleClass(textBox.x! + p.x, textBox.y! + p.y, p.rgb.slice(0, 3))
      particlesRef.current[i].draw()
    })

    particlesRef.current.splice(pixels.length, particlesRef.current.length)
  }

  const write = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    textBox.str = text

    const maxFontSize = Math.floor(canvas.width / (textBox.str.length * 0.6))
    const fontSize = Math.min(maxFontSize, canvas.height * 0.8)
    textBox.h = fontSize

    interactionRadiusRef.current = Math.max(50, textBox.h * 1.5)

    ctx.font = `900 ${fontSize}px monospace, sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    textBox.w = Math.round(ctx.measureText(textBox.str).width)
    textBox.x = 0.5 * (canvas.width - textBox.w)
    textBox.y = 0.5 * (canvas.height - textBox.h)

    const gradient = ctx.createLinearGradient(textBox.x, textBox.y, textBox.x + textBox.w, textBox.y + textBox.h)
    const N = colors.length - 1
    colors.forEach((c, i) => gradient.addColorStop(i / N, `#${c}`))
    ctx.fillStyle = gradient

    ctx.fillText(textBox.str, 0.5 * canvas.width, 0.5 * canvas.height)
    dottify()
  }

  const animate = () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    timeRef.current += 1 // increment time for floating animation
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particlesRef.current.forEach((p) => p.move(interactionRadiusRef.current, hasPointerRef.current, timeRef.current))
    animationIdRef.current = requestAnimationFrame(animate)
  }

  const initialize = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    const container = containerRef.current
    if (!canvas || !ctx || !container) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    write()
  }

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    initialize()
  }, [text, colors, animationForce, particleDensity, canvasSize])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctxRef.current = ctx
    initialize()

    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    }
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    pointerRef.current.x = (e.clientX - rect.left) * scaleX
    pointerRef.current.y = (e.clientY - rect.top) * scaleY
    hasPointerRef.current = true

    if (!animationIdRef.current) animate()
  }

  const handlePointerLeave = () => {
    hasPointerRef.current = false
    pointerRef.current.x = undefined
    pointerRef.current.y = undefined

    if (!animationIdRef.current) animate()
  }

  const handlePointerEnter = () => {
    hasPointerRef.current = true
  }

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-none"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={handlePointerEnter}
      />
    </div>
  )
}

export { ParticleTextEffect }
