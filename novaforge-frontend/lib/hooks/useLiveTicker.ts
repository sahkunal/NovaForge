'use client'
import { useState, useEffect } from 'react'
import { Planet } from '@/lib/types'

export interface LiveResources {
  iron: number
  gold: number
  uranium: number
  pendingIron: number
  pendingGold: number
  pendingUranium: number
  hoursUnclaimed: number
  threatLevel: number
}

export function useLiveTicker(planet: Planet): LiveResources {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!planet.colonized || planet.inactive) return
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [planet.colonized, planet.inactive])

  const now = Date.now() / 1000
  const elapsed = Math.max(0, now - planet.lastClaimTs)
  const hours = elapsed / 3600
  const maxStorage = planet.productionRate * 72 * 3600

  const typeMultiplier = (resource: 'iron' | 'gold' | 'uranium') => {
    if (resource === 'iron'    && planet.planetType === 'Mining')   return 1.5
    if (resource === 'gold'    && planet.planetType === 'Luxury')   return 1.5
    if (resource === 'uranium' && (planet.planetType === 'Energy' || planet.planetType === 'Research')) return 1.5
    if (resource === 'iron'    && planet.planetType === 'Military') return 0.5
    if (resource === 'uranium' && planet.planetType === 'Military') return 0.5
    if (resource === 'gold'    && planet.planetType === 'Military') return 0
    return 1
  }

  const boostMul = planet.productionBoost > 0 && now < planet.boostExpiry
    ? 1 + planet.productionBoost / 100 : 1

  const gen = (res: 'iron' | 'gold' | 'uranium') =>
    Math.min(planet.productionRate * elapsed * typeMultiplier(res) * boostMul, maxStorage)

  const pendingIron    = planet.colonized && !planet.inactive ? gen('iron')    : 0
  const pendingGold    = planet.colonized && !planet.inactive ? gen('gold')    : 0
  const pendingUranium = planet.colonized && !planet.inactive ? gen('uranium') : 0

  const threatLevel = Math.min(Math.floor(hours), 100)

  return {
    iron:    Math.min(planet.ironBalance    + pendingIron,    maxStorage),
    gold:    Math.min(planet.goldBalance    + pendingGold,    maxStorage),
    uranium: Math.min(planet.uraniumBalance + pendingUranium, maxStorage),
    pendingIron, pendingGold, pendingUranium,
    hoursUnclaimed: hours,
    threatLevel,
  }
}
