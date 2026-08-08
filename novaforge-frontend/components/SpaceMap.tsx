'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { MOCK_PLANETS, PLANET_COLORS, RARITY_COLORS, Planet, getThreatLevel, MONSTER_EMOJIS } from '@/lib/types'

interface Props { onSelectPlanet: (p: Planet) => void; selectedId?: string }

interface MonsterState {
  planetIdx: number
  x: number; y: number
  targetX: number; targetY: number
  emoji: string
  tier: number
  impactFlash: boolean
  alive: boolean
}

export default function SpaceMap({ onSelectPlanet, selectedId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const monstersRef = useRef<MonsterState[]>([])
  const anglesRef = useRef(MOCK_PLANETS.map((_, i) => (i / MOCK_PLANETS.length) * Math.PI * 2))
  const [hoverId, setHoverId] = useState<string | null>(null)

  const getOrbits = useCallback(() =>
    MOCK_PLANETS.map((_, i) => ({
      r: 120 + i * 90,
      speed: 0.0003 + i * 0.00008,
      tilt: 0.38 + i * 0.05,
    })), [])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0
    const orbits = getOrbits()

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const stars = Array.from({ length: 320 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.2,
      a: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }))

    const getSun = () => ({ x: canvas.width * 0.5, y: canvas.height * 0.5 })

    const getPlanetPos = (i: number) => {
      const sun = getSun()
      const o = orbits[i]
      const a = anglesRef.current[i]
      return { x: sun.x + Math.cos(a) * o.r, y: sun.y + Math.sin(a) * o.r * o.tilt }
    }

    // Spawn monsters for at-risk planets
    const spawnMonsters = () => {
      MOCK_PLANETS.forEach((planet, i) => {
        const threat = getThreatLevel(planet.threatLevel)
        const alreadySpawned = monstersRef.current.some(m => m.planetIdx === i && m.alive)
        if ((threat === 'warn' || threat === 'danger' || threat === 'critical') && !alreadySpawned) {
          const pos = getPlanetPos(i)
          const angle = Math.random() * Math.PI * 2
          const dist = 180 + Math.random() * 120
          monstersRef.current.push({
            planetIdx: i,
            x: pos.x + Math.cos(angle) * dist,
            y: pos.y + Math.sin(angle) * dist,
            targetX: pos.x, targetY: pos.y,
            emoji: MONSTER_EMOJIS[planet.planetType],
            tier: planet.monsterTier || 1,
            impactFlash: false,
            alive: true,
          })
        }
      })
    }

    spawnMonsters()

    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // BG
      ctx.fillStyle = '#060614'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Milky way gradient
      const mw = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.6)
      mw.addColorStop(0, 'transparent')
      mw.addColorStop(0.35, 'rgba(124,58,237,0.035)')
      mw.addColorStop(0.55, 'rgba(96,165,250,0.025)')
      mw.addColorStop(1, 'transparent')
      ctx.fillStyle = mw
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Stars
      for (const s of stars) {
        ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(t * 0.0018 + s.phase))
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      const sun = getSun()

      // Nebula blobs
      [[0.25, 0.2, '#7c3aed', 180], [0.75, 0.65, '#0f9e8a', 140], [0.5, 0.85, '#7c3aed', 120]].forEach(([fx, fy, c, r]) => {
        const g = ctx.createRadialGradient(sun.x * (fx as number) * 2, sun.y * (fy as number) * 2, 0,
          sun.x * (fx as number) * 2, sun.y * (fy as number) * 2, r as number)
        g.addColorStop(0, `${c}09`)
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(canvas.width * (fx as number), canvas.height * (fy as number), r as number, 0, Math.PI * 2)
        ctx.fill()
      })

      // Sun glow
      for (const [r, a, c] of [[180, 0.025, '#f59e0b'], [110, 0.06, '#fbbf24'], [65, 0.12, '#fde68a'], [32, 0.45, '#fff7aa'], [20, 1, '#fff']]) {
        const g = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, r as number)
        g.addColorStop(0, c as string)
        g.addColorStop(1, 'transparent')
        ctx.globalAlpha = a as number
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(sun.x, sun.y, r as number, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Sun rays
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 0.0005
        ctx.beginPath()
        ctx.moveTo(sun.x + Math.cos(a) * 24, sun.y + Math.sin(a) * 24)
        ctx.lineTo(sun.x + Math.cos(a) * 48, sun.y + Math.sin(a) * 48)
        ctx.strokeStyle = 'rgba(251,191,36,0.2)'
        ctx.lineWidth = 2; ctx.stroke()
      }

      // Advance planet angles
      orbits.forEach((o, i) => { anglesRef.current[i] += o.speed })

      // Orbits
      orbits.forEach((o, i) => {
        const isSelected = MOCK_PLANETS[i]?.publicKey === selectedId
        ctx.save()
        ctx.translate(sun.x, sun.y)
        ctx.scale(1, o.tilt)
        ctx.beginPath()
        ctx.arc(0, 0, o.r, 0, Math.PI * 2)
        ctx.strokeStyle = isSelected ? 'rgba(124,58,237,0.25)' : 'rgba(124,58,237,0.08)'
        ctx.lineWidth = isSelected ? 1.5 : 0.5
        ctx.setLineDash([4, 8]); ctx.stroke(); ctx.setLineDash([])
        ctx.restore()
      })

      // Monsters — move toward planet
      monstersRef.current.forEach(m => {
        if (!m.alive) return
        const pos = getPlanetPos(m.planetIdx)
        m.targetX = pos.x; m.targetY = pos.y

        const dx = m.targetX - m.x, dy = m.targetY - m.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const speed = m.tier === 3 ? 0.6 : m.tier === 2 ? 0.4 : 0.25

        if (dist > 30) {
          m.x += (dx / dist) * speed
          m.y += (dy / dist) * speed
        } else {
          // Impact!
          m.impactFlash = true
          setTimeout(() => { m.impactFlash = false }, 300)
          // Reset to far position so it keeps circling
          const angle = Math.random() * Math.PI * 2
          const d = 150 + Math.random() * 100
          m.x = pos.x + Math.cos(angle) * d
          m.y = pos.y + Math.sin(angle) * d
        }

        // Monster glow aura
        const tierColor = m.tier === 3 ? '#f43f5e' : m.tier === 2 ? '#f97316' : '#fbbf24'
        const aura = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 28)
        aura.addColorStop(0, `${tierColor}40`)
        aura.addColorStop(1, 'transparent')
        ctx.fillStyle = aura
        ctx.beginPath()
        ctx.arc(m.x, m.y, 28, 0, Math.PI * 2)
        ctx.fill()

        // Pulsing ring around monster
        ctx.beginPath()
        ctx.arc(m.x, m.y, 18 + Math.sin(t * 0.15) * 4, 0, Math.PI * 2)
        ctx.strokeStyle = `${tierColor}60`
        ctx.lineWidth = 1.5; ctx.stroke()

        // Monster emoji
        ctx.font = `${16 + m.tier * 2}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(m.emoji, m.x, m.y)

        // Tier label
        ctx.font = '8px Orbitron, monospace'
        ctx.fillStyle = tierColor
        ctx.fillText(['','Scout','Raider','Warlord'][m.tier], m.x, m.y + 20)

        // Impact flash on planet
        if (m.impactFlash) {
          const ppos = getPlanetPos(m.planetIdx)
          const flash = ctx.createRadialGradient(ppos.x, ppos.y, 0, ppos.x, ppos.y, 50)
          flash.addColorStop(0, 'rgba(244,63,94,0.8)')
          flash.addColorStop(1, 'transparent')
          ctx.fillStyle = flash
          ctx.beginPath()
          ctx.arc(ppos.x, ppos.y, 50, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Planets
      MOCK_PLANETS.forEach((planet, i) => {
        const pos = getPlanetPos(i)
        const colors = PLANET_COLORS[planet.planetType]
        const rarityColor = RARITY_COLORS[planet.rarity]
        const threat = getThreatLevel(planet.threatLevel)
        const r = 14 + planet.level * 2.5
        const isSelected = planet.publicKey === selectedId
        const isHovered = planet.publicKey === hoverId

        // Threat pulse ring
        if (threat === 'critical') {
          ctx.globalAlpha = 0.4 + 0.4 * Math.sin(t * 0.12)
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, r + 14 + Math.sin(t * 0.1) * 5, 0, Math.PI * 2)
          ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.5; ctx.stroke()
          ctx.globalAlpha = 1
        } else if (threat === 'danger') {
          ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 0.07)
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, r + 9, 0, Math.PI * 2)
          ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1; ctx.stroke()
          ctx.globalAlpha = 1
        } else if (threat === 'warn') {
          ctx.globalAlpha = 0.15 + 0.15 * Math.sin(t * 0.05)
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, r + 7, 0, Math.PI * 2)
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1; ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Planet glow
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 2.5)
        glow.addColorStop(0, colors.glow)
        glow.addColorStop(1, 'transparent')
        ctx.globalAlpha = isSelected || isHovered ? 0.8 : 0.45
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, r * 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1

        // Ring (Legendary/Military)
        if (planet.rarity === 'Legendary' || planet.planetType === 'Military') {
          ctx.save()
          ctx.translate(pos.x, pos.y); ctx.scale(1, 0.3)
          ctx.beginPath()
          ctx.arc(0, 0, r + 7, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(200,180,100,0.55)'; ctx.lineWidth = 5; ctx.stroke()
          ctx.restore()
        }

        // Planet body
        const grad = ctx.createRadialGradient(pos.x - r * 0.3, pos.y - r * 0.3, 1, pos.x, pos.y, r)
        grad.addColorStop(0, '#ffffff')
        grad.addColorStop(0.18, colors.primary)
        grad.addColorStop(1, colors.secondary)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
        ctx.fillStyle = grad; ctx.fill()

        // Inactive overlay
        if (planet.inactive) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fill()
          ctx.font = '10px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('💀', pos.x, pos.y)
        }

        // Selection/hover ring
        if (isSelected || isHovered) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI * 2)
          ctx.strokeStyle = isSelected ? '#7c3aed' : colors.primary
          ctx.lineWidth = isSelected ? 2.5 : 1.5; ctx.stroke()
          if (isSelected) {
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, r + 10, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(124,58,237,0.35)'; ctx.lineWidth = 1; ctx.stroke()
          }
        }

        // Rarity ring
        if (planet.rarity !== 'Common') {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, r + 2, 0, Math.PI * 2)
          ctx.strokeStyle = rarityColor; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6; ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Colonized dot
        if (planet.colonized) {
          ctx.beginPath()
          ctx.arc(pos.x + r * 0.72, pos.y - r * 0.72, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = '#4ade80'; ctx.fill()
        }

        // Label on hover/select
        if (isSelected || isHovered) {
          const label = planet.planetType.toUpperCase()
          const lw = ctx.measureText(label).width + 16
          ctx.fillStyle = 'rgba(10,9,32,0.85)'
          ctx.beginPath()
          ctx.roundRect(pos.x - lw/2, pos.y + r + 7, lw, 18, 4)
          ctx.fill()
          ctx.fillStyle = isSelected ? '#a78bfa' : colors.primary
          ctx.font = '8px Orbitron, monospace'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(label, pos.x, pos.y + r + 16)
        }
      })

      t++
      raf = requestAnimationFrame(drawFrame)
    }

    drawFrame()

    // Interaction
    const getHit = (mx: number, my: number) =>
      MOCK_PLANETS.find((planet, i) => {
        const pos = getPlanetPos(i)
        const r = 14 + planet.level * 2.5 + 10
        return Math.hypot(mx - pos.x, my - pos.y) < r
      })

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const hit = getHit(e.clientX - rect.left, e.clientY - rect.top)
      if (hit) onSelectPlanet(hit)
    }
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const hit = getHit(e.clientX - rect.left, e.clientY - rect.top)
      setHoverId(hit?.publicKey ?? null)
      canvas.style.cursor = hit ? 'pointer' : 'default'
    }

    canvas.addEventListener('click', onClick)
    canvas.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('mousemove', onMove)
    }
  }, [onSelectPlanet, selectedId, hoverId, getOrbits])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/>
}
