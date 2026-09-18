'use client'
import { useState, useEffect } from 'react'
import { Planet } from '@/lib/types'

// Threat level thresholds
export const THREAT_WARN     = 50  // monster spawns
export const THREAT_DANGER   = 75  // danger zone
export const THREAT_CRITICAL = 90  // attack imminent
export const THREAT_MAX      = 100 // attacked

// Based on program: threat increases ~1 point per ~1800 seconds (30 min)
// So 50 threat = ~25 hours idle, 90 threat = ~45 hours idle
// Adjust this based on your actual program constants
const SECONDS_PER_THREAT_POINT = 12 // 12 seconds per point → attack in ~20 min idle

export interface AttackStatus {
  threatLevel: number        // current estimated threat (0-100)
  timeToWarn: number         // seconds until first warning (threat 50)
  timeToDanger: number       // seconds until danger (threat 75)
  timeToCritical: number     // seconds until critical (threat 90)
  timeToAttack: number       // seconds until max threat (threat 100)
  isUnderThreat: boolean     // threat >= 50
  isDanger: boolean          // threat >= 75
  isCritical: boolean        // threat >= 90
  isUnderAttack: boolean     // monster is present (monsterPower > 0)
  countdownLabel: string     // human readable countdown
  urgency: 'safe' | 'warn' | 'danger' | 'critical' | 'attack'
}

function pad(n: number) { return String(Math.floor(n)).padStart(2, '0') }
function formatCountdown(secs: number): string {
  if (secs <= 0) return '00:00:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function useAttackTimer(planet: Planet): AttackStatus {
  const calc = (): AttackStatus => {
    const now = Date.now() / 1000
    const elapsed = Math.max(0, now - planet.lastClaimTs)

    // Estimate current threat based on elapsed time + on-chain threat_level
    // On-chain threat_level is what was last written, elapsed adds to it
    const elapsedThreat = elapsed / SECONDS_PER_THREAT_POINT
    const currentThreat = Math.min(100, planet.threatLevel + elapsedThreat)

    const isUnderAttack = planet.monsterPower > 0

    // Time remaining calculations (from now)
    const secsToThreat = (target: number) => {
      const remaining = target - currentThreat
      if (remaining <= 0) return 0
      return remaining * SECONDS_PER_THREAT_POINT
    }

    const timeToWarn     = secsToThreat(THREAT_WARN)
    const timeToDanger   = secsToThreat(THREAT_DANGER)
    const timeToCritical = secsToThreat(THREAT_CRITICAL)
    const timeToAttack   = secsToThreat(THREAT_MAX)

    const isUnderThreat = currentThreat >= THREAT_WARN
    const isDanger      = currentThreat >= THREAT_DANGER
    const isCritical    = currentThreat >= THREAT_CRITICAL

    let urgency: AttackStatus['urgency'] = 'safe'
    let countdownLabel = ''

    if (isUnderAttack) {
      urgency = 'attack'
      countdownLabel = '⚔️ UNDER ATTACK — CLAIM NOW'
    } else if (isCritical) {
      urgency = 'critical'
      countdownLabel = `💀 ATTACK IN ${formatCountdown(timeToAttack)}`
    } else if (isDanger) {
      urgency = 'danger'
      countdownLabel = `🔴 DANGER — ${formatCountdown(timeToCritical)} to critical`
    } else if (isUnderThreat) {
      urgency = 'warn'
      countdownLabel = `⚠️ MONSTER SPOTTED — ${formatCountdown(timeToDanger)} to danger`
    } else {
      urgency = 'safe'
      countdownLabel = `✅ Safe — monster in ${formatCountdown(timeToWarn)}`
    }

    return {
      threatLevel: currentThreat,
      timeToWarn, timeToDanger, timeToCritical, timeToAttack,
      isUnderThreat, isDanger, isCritical, isUnderAttack,
      countdownLabel, urgency,
    }
  }

  const [status, setStatus] = useState<AttackStatus>(calc)
  useEffect(() => {
    const id = setInterval(() => setStatus(calc()), 1000)
    return () => clearInterval(id)
  }, [planet])

  return status
}

export function useAllPlanetsAlert(planets: Planet[]) {
  const [alerts, setAlerts] = useState<{planet: Planet, urgency: string, label: string}[]>([])

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now() / 1000
      const newAlerts = planets
        .map(p => {
          const elapsed = Math.max(0, now - p.lastClaimTs)
          const currentThreat = Math.min(100, p.threatLevel + elapsed / SECONDS_PER_THREAT_POINT)
          const isUnderAttack = p.monsterPower > 0
          if (isUnderAttack) return { planet: p, urgency: 'attack', label: `${p.planetType} UNDER ATTACK` }
          if (currentThreat >= THREAT_CRITICAL) return { planet: p, urgency: 'critical', label: `${p.planetType} — ATTACK IMMINENT` }
          if (currentThreat >= THREAT_DANGER) return { planet: p, urgency: 'danger', label: `${p.planetType} — DANGER ZONE` }
          if (currentThreat >= THREAT_WARN) return { planet: p, urgency: 'warn', label: `${p.planetType} — Monster Spotted` }
          return null
        })
        .filter(Boolean) as {planet: Planet, urgency: string, label: string}[]
      setAlerts(newAlerts)
    }, 2000)
    return () => clearInterval(id)
  }, [planets])

  return alerts
}