'use client'
import { useEffect, useRef } from 'react'
import { PlanetType, Rarity, PLANET_COLORS, RARITY_COLORS } from '@/lib/types'

interface Props {
  planetType: PlanetType
  rarity: Rarity
  size?: number
  animated?: boolean
  hasRing?: boolean
  className?: string
}

export default function PlanetCanvas({ planetType, rarity, size = 80, animated = true, hasRing = false, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = size * 2
    canvas.height = size * 2
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    const cx = size, cy = size, r = size * 0.78
    const colors = PLANET_COLORS[planetType]
    const rarityColor = RARITY_COLORS[rarity]
    let angle = 0
    let raf: number

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Glow aura
      const aura = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.5)
      aura.addColorStop(0, colors.glow)
      aura.addColorStop(1, 'transparent')
      ctx.fillStyle = aura
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Planet body
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.15, colors.primary)
      grad.addColorStop(0.6, colors.secondary)
      grad.addColorStop(1, '#000010')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Surface texture — swirl lines
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.clip()
      for (let i = 0; i < 4; i++) {
        const y = cy - r + (r * 2 / 4) * i + (r * 0.15)
        const wave = Math.sin(angle + i) * 8
        ctx.beginPath()
        ctx.moveTo(cx - r, y + wave)
        ctx.bezierCurveTo(cx - r * 0.5, y + wave + 12, cx + r * 0.5, y - wave - 8, cx + r, y + wave)
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + i * 0.02})`
        ctx.lineWidth = 6
        ctx.stroke()
      }
      // Atmosphere edge
      const atmo = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r)
      atmo.addColorStop(0, 'transparent')
      atmo.addColorStop(1, `rgba(255,255,255,0.1)`)
      ctx.fillStyle = atmo
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Ring
      if (hasRing) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, 0.28)
        ctx.beginPath()
        ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(200,180,100,0.5)`
        ctx.lineWidth = 8
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(200,180,100,0.2)`
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.restore()
      }

      // Rarity ring
      if (rarity !== 'Common') {
        ctx.beginPath()
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2)
        ctx.strokeStyle = rarityColor
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.6
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      if (animated) { angle += 0.005; raf = requestAnimationFrame(draw) }
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [planetType, rarity, size, animated, hasRing])

  return <canvas ref={canvasRef} className={className} />
}
