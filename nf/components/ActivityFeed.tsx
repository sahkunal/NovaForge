'use client'
import { useState, useEffect } from 'react'
import { Planet, PLANET_COLORS, MONSTER_EMOJIS } from '@/lib/types'

interface Event { id: number; msg: string; color: string; icon: string; time: Date }

interface Props { planets: Planet[] }

let eventId = 0

export default function ActivityFeed({ planets }: Props) {
  const [events, setEvents] = useState<Event[]>([])
  const [prevPlanets, setPrevPlanets] = useState<Planet[]>([])

  useEffect(() => {
    if (!planets.length) return
    const newEvents: Event[] = []

    for (const p of planets) {
      const prev = prevPlanets.find(x => x.publicKey === p.publicKey)
      if (!prev) {
        // New planet minted
        newEvents.push({ id: eventId++, msg: `New ${p.rarity} ${p.planetType} planet minted`, color: PLANET_COLORS[p.planetType].primary, icon: '🪐', time: new Date() })
      } else {
        if (!prev.colonized && p.colonized)
          newEvents.push({ id: eventId++, msg: `${p.planetType} planet colonized — resources flowing`, color: '#4ade80', icon: '🌐', time: new Date() })
        if (prev.monstersKilled < p.monstersKilled)
          newEvents.push({ id: eventId++, msg: `${MONSTER_EMOJIS[p.planetType]} Monster defeated! +${p.monstersKilled - prev.monstersKilled} kills`, color: '#f43f5e', icon: '⚔️', time: new Date() })
        if (!prev.inactive && p.inactive)
          newEvents.push({ id: eventId++, msg: `${p.planetType} planet went INACTIVE — repair needed`, color: '#f43f5e', icon: '💀', time: new Date() })
        if (prev.level < p.level)
          newEvents.push({ id: eventId++, msg: `${p.planetType} planet leveled up to Lv ${p.level}!`, color: '#a78bfa', icon: '▲', time: new Date() })
        if (!prev.listed && p.listed)
          newEvents.push({ id: eventId++, msg: `${p.planetType} planet listed on marketplace`, color: '#fbbf24', icon: '🏪', time: new Date() })
      }
    }

    if (newEvents.length > 0) {
      setEvents(prev => [...newEvents, ...prev].slice(0, 8))
    }
    setPrevPlanets(planets)
  }, [planets])

  if (!events.length) return null

  return (
    <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-1.5" style={{ width: 260 }}>
      <div style={{ fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155',letterSpacing:'0.12em',marginBottom:4 }}>ACTIVITY FEED</div>
      {events.slice(0,5).map(e => (
        <div key={e.id} className="rounded-xl px-3 py-2 flex items-center gap-2 animate-fade-in"
          style={{ background:'rgba(6,4,18,0.9)', border:`1px solid ${e.color}25`, backdropFilter:'blur(12px)' }}>
          <span style={{ fontSize:'13px', flexShrink:0 }}>{e.icon}</span>
          <span className="text-xs text-slate-300 leading-tight flex-1">{e.msg}</span>
          <span className="text-xs text-slate-600 font-mono flex-shrink-0" style={{ fontSize:'9px' }}>{e.time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      ))}
    </div>
  )
}