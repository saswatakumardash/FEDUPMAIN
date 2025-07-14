"use client"

import { useEffect, useRef } from "react"

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    const dpr = window.devicePixelRatio || 1
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Minimal starfield
    const STAR_COUNT = 80
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 0.8 + 0.7,
      alpha: Math.random() * 0.5 + 0.5,
      twinkle: Math.random() * 0.02 + 0.01,
    }))

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height)
      for (const star of stars) {
        star.alpha += (Math.random() - 0.5) * star.twinkle
        star.alpha = Math.max(0.2, Math.min(1, star.alpha))
        ctx.save()
        ctx.globalAlpha = star.alpha
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI)
        ctx.fillStyle = "#fff"
        ctx.shadowColor = "#fff"
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.restore()
      }
      animationFrameId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
