'use client'
import { useState, useEffect } from 'react'
import { Planet } from '@/lib/types'
interface LiveResources { iron:number; gold:number; uranium:number; threatLevel:number; pendingIron:number; pendingGold:number; pendingUranium:number }
export function useLiveTicker(planet: Planet): LiveResources {
  const calc = () => {
    if (!planet.colonized || planet.inactive) return { iron:planet.ironBalance, gold:planet.goldBalance, uranium:planet.uraniumBalance, threatLevel:planet.threatLevel, pendingIron:0, pendingGold:0, pendingUranium:0 }
    const elapsed = Math.max(0, Date.now()/1000 - planet.lastClaimTs)
    const boost   = 1 + (planet.productionBoost||0)/100
    const rate    = planet.productionRate * boost
    const typeMulti: Record<string,{i:number,g:number,u:number}> = {
      Mining:{i:1.5,g:1,u:1}, Luxury:{i:1,g:1.5,u:1}, Research:{i:1,g:1,u:1.5},
      Energy:{i:1,g:1,u:1.5}, Military:{i:0.5,g:0,u:0.5}
    }
    const m = typeMulti[planet.planetType]||{i:1,g:1,u:1}
    const pi=rate*m.i*elapsed, pg=rate*m.g*elapsed, pu=rate*m.u*elapsed
    return { iron:planet.ironBalance+pi, gold:planet.goldBalance+pg, uranium:planet.uraniumBalance+pu,
      threatLevel:planet.threatLevel, pendingIron:pi, pendingGold:pg, pendingUranium:pu }
  }
  const [live, setLive] = useState(calc)
  useEffect(()=>{ const id=setInterval(()=>setLive(calc()),1000); return ()=>clearInterval(id) },[planet])
  return live
}
