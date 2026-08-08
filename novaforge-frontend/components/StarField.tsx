'use client'
import { useEffect, useRef } from 'react'

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const stars: { x: number; y: number; r: number; a: number; phase: number; speed: number }[] = []
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.2,
        a: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.002 + 0.001,
      })
    }
    let t = 0
    let raf: number
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#060614'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Milky Way band
      const mw = ctx.createLinearGradient(0, canvas.height * 0.1, canvas.width, canvas.height * 0.4)
      mw.addColorStop(0, 'transparent')
      mw.addColorStop(0.3, 'rgba(124,58,237,0.04)')
      mw.addColorStop(0.5, 'rgba(167,139,250,0.06)')
      mw.addColorStop(0.7, 'rgba(96,165,250,0.04)')
      mw.addColorStop(1, 'transparent')
      ctx.fillStyle = mw
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Stars
      for (const s of stars) {
        const alpha = s.a * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        ctx.globalAlpha = alpha
        ctx.fillStyle = `hsl(${220 + Math.random() * 40},50%,${80 + Math.random() * 20}%)`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      // Nebula clouds
      for (let i = 0; i < 3; i++) {
        const nx = canvas.width * (0.2 + i * 0.3)
        const ny = canvas.height * (0.15 + i * 0.2)
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 200)
        grad.addColorStop(0, `rgba(${i===0?'124,58,237':i===1?'15,158,138':'96,165,250'},0.04)`)
        grad.addColorStop(1, 'transparent')
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 0.0005 + i)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(nx, ny, 200, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      t++
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}
