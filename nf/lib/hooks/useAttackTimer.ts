'use client'
import { useState, useEffect } from 'react'
import { Planet } from '@/lib/types'

// MATCHES PROGRAM: threat_level = hours_elapsed, attack at 50 hours
// claim_resources.rs: let hours_unclaimed = (elapsed / 3600).min(100) as u8;
export const THREAT_WARN     = 50   // monster spawns (50 hours idle)
export const THREAT_DANGER   = 75   // danger zone
export const THREAT_CRITICAL = 90   // attack imminent
export const THREAT_MAX      = 100  // max threat
export const SECS_PER_POINT  = 3600 // 1 hour per threat point

export interface AttackStatus {
  threatLevel: number
  timeToWarn: number
  timeToDanger: number
  timeToCritical: number
  timeToAttack: number
  isUnderThreat: boolean
  isDanger: boolean
  isCritical: boolean
  isUnderAttack: boolean
  countdownLabel: string
  urgency: 'safe'|'warn'|'danger'|'critical'|'attack'
}

function pad(n: number){ return String(Math.floor(n)).padStart(2,'0') }
function fmtCountdown(secs: number): string {
  if(secs<=0) return '00:00:00'
  const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=Math.floor(secs%60)
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function useAttackTimer(planet: Planet): AttackStatus {
  const calc = (): AttackStatus => {
    const now = Date.now()/1000
    const elapsed = Math.max(0, now - planet.lastClaimTs)
    // Program sets threat = elapsed_hours, capped at 100
    const currentThreat = Math.min(100, elapsed / SECS_PER_POINT)
    const isUnderAttack = planet.monsterPower > 0

    const secsTo = (target: number) => {
      const remaining = target - currentThreat
      if(remaining<=0) return 0
      return remaining * SECS_PER_POINT
    }

    const timeToWarn     = secsTo(THREAT_WARN)
    const timeToDanger   = secsTo(THREAT_DANGER)
    const timeToCritical = secsTo(THREAT_CRITICAL)
    const timeToAttack   = secsTo(THREAT_MAX)

    const isUnderThreat = currentThreat >= THREAT_WARN
    const isDanger      = currentThreat >= THREAT_DANGER
    const isCritical    = currentThreat >= THREAT_CRITICAL

    let urgency: AttackStatus['urgency'] = 'safe'
    let countdownLabel = ''

    if(isUnderAttack){
      urgency='attack'; countdownLabel='⚔️ UNDER ATTACK — CLAIM NOW'
    } else if(isCritical){
      urgency='critical'; countdownLabel=`💀 ATTACK IN ${fmtCountdown(timeToAttack)}`
    } else if(isDanger){
      urgency='danger'; countdownLabel=`🔴 DANGER — ${fmtCountdown(timeToCritical)} to critical`
    } else if(isUnderThreat){
      urgency='warn'; countdownLabel=`⚠️ MONSTER SPOTTED — ${fmtCountdown(timeToDanger)} to danger`
    } else {
      urgency='safe'; countdownLabel=`✅ Safe — monster in ${fmtCountdown(timeToWarn)}`
    }

    return { threatLevel:currentThreat, timeToWarn, timeToDanger, timeToCritical, timeToAttack, isUnderThreat, isDanger, isCritical, isUnderAttack, countdownLabel, urgency }
  }

  const [status,setStatus]=useState<AttackStatus>(calc)
  useEffect(()=>{ const id=setInterval(()=>setStatus(calc()),1000); return()=>clearInterval(id) },[planet])
  return status
}

export function useAllPlanetsAlert(planets: Planet[]) {
  const [alerts,setAlerts]=useState<{planet:Planet;urgency:string;label:string}[]>([])
  useEffect(()=>{
    const id=setInterval(()=>{
      const now=Date.now()/1000
      const newAlerts=planets.map(p=>{
        const elapsed=Math.max(0,now-p.lastClaimTs)
        const threat=Math.min(100,elapsed/SECS_PER_POINT)
        const isUnderAttack=p.monsterPower>0
        if(isUnderAttack) return{planet:p,urgency:'attack',label:`${p.planetType} UNDER ATTACK`}
        if(threat>=THREAT_CRITICAL) return{planet:p,urgency:'critical',label:`${p.planetType} — ATTACK IMMINENT`}
        if(threat>=THREAT_DANGER) return{planet:p,urgency:'danger',label:`${p.planetType} — DANGER ZONE`}
        if(threat>=THREAT_WARN) return{planet:p,urgency:'warn',label:`${p.planetType} — Monster Spotted`}
        return null
      }).filter(Boolean) as {planet:Planet;urgency:string;label:string}[]
      setAlerts(newAlerts)
    },5000)
    return()=>clearInterval(id)
  },[planets])
  return alerts
}