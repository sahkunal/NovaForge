'use client'
import { useEffect, useRef } from 'react'
import { PlanetType, Rarity, PLANET_COLORS, RARITY_COLORS } from '@/lib/types'

interface Props {
  planetType: PlanetType
  rarity: Rarity
  size?: number
  hasRing?: boolean
  animate?: boolean
  inactive?: boolean
}

export default function PlanetViewer3D({ planetType, rarity, size = 80, hasRing = false, animate = true, inactive = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = size * 2
    canvas.height = size * 2
    const cx = size, cy = size, r = size * 0.72
    let angle = 0

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const colors = PLANET_COLORS[planetType]

      if (inactive) {
        ctx.filter = 'grayscale(0.8) brightness(0.5)'
      }

      // Outer glow
      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.6)
      glowGrad.addColorStop(0, colors.glow.replace('0.5', '0.25'))
      glowGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2)
      ctx.fill()

      // Planet body
      const bodyGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r)
      bodyGrad.addColorStop(0, '#ffffff')
      bodyGrad.addColorStop(0.15, colors.primary)
      bodyGrad.addColorStop(0.6, colors.secondary)
      bodyGrad.addColorStop(1, '#000')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fillStyle = bodyGrad
      ctx.fill()

      // Surface detail bands
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.clip()
      for (let i = 0; i < 4; i++) {
        const by = cy - r + (i * r * 0.5) + Math.sin(angle * 0.3 + i) * 4
        const bh = r * 0.12
        ctx.globalAlpha = 0.12
        ctx.fillStyle = i % 2 === 0 ? colors.primary : '#000'
        ctx.fillRect(cx - r, by, r * 2, bh)
      }
      // Atmosphere shimmer
      ctx.globalAlpha = 0.15 + 0.05 * Math.sin(angle * 0.02)
      const atmGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r)
      atmGrad.addColorStop(0, 'rgba(255,255,255,0.4)')
      atmGrad.addColorStop(0.4, 'transparent')
      ctx.fillStyle = atmGrad
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
      ctx.globalAlpha = 1
      ctx.restore()

      // Atmosphere rim
      const rimGrad = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.05)
      rimGrad.addColorStop(0, 'transparent')
      rimGrad.addColorStop(0.5, colors.glow.replace('0.5', '0.2'))
      rimGrad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2)
      ctx.fillStyle = rimGrad
      ctx.fill()

      // Ring
      if (hasRing) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.scale(1, 0.3)
        ctx.beginPath()
        ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2)
        ctx.strokeStyle = colors.glow.replace('0.5', '0.5')
        ctx.lineWidth = r * 0.18
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, r * 1.75, 0, Math.PI * 2)
        ctx.strokeStyle = colors.glow.replace('0.5', '0.2')
        ctx.lineWidth = r * 0.1
        ctx.stroke()
        ctx.restore()
      }

      // Rarity glow ring
      const rarityColor = RARITY_COLORS[rarity]
      ctx.beginPath()
      ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
      ctx.strokeStyle = rarityColor + '60'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.filter = 'none'

      if (animate) {
        angle++
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [planetType, rarity, size, hasRing, animate, inactive])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={animate ? 'animate-float' : ''}
    />
  )
}
