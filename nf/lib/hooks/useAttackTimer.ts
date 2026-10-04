'use client'
import{useState,useEffect}from'react'
import{Planet}from'@/lib/types'
// Program: threat = elapsed_hours, attack at 50h
export const SECS_PER_POINT=3600
export const THREAT_WARN=50,THREAT_DANGER=75,THREAT_CRITICAL=90
export interface AttackStatus{threatLevel:number;timeToWarn:number;timeToDanger:number;timeToCritical:number;timeToAttack:number;isUnderThreat:boolean;isDanger:boolean;isCritical:boolean;isUnderAttack:boolean;urgency:'safe'|'warn'|'danger'|'critical'|'attack'}
function pad(n:number){return String(Math.floor(n)).padStart(2,'0')}
export function fmtCountdown(s:number){if(s<=0)return'00:00:00';const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=Math.floor(s%60);return`${pad(h)}:${pad(m)}:${pad(sc)}`}
export function useAttackTimer(planet:Planet):AttackStatus{
  const calc=():AttackStatus=>{
    const elapsed=Math.max(0,Date.now()/1000-planet.lastClaimTs)
    const cur=Math.min(100,elapsed/SECS_PER_POINT)
    const isUnderAttack=cur>=100&&planet.monsterPower>0
    const secsTo=(t:number)=>Math.max(0,(t-cur)*SECS_PER_POINT)
    return{threatLevel:cur,timeToWarn:secsTo(THREAT_WARN),timeToDanger:secsTo(THREAT_DANGER),timeToCritical:secsTo(THREAT_CRITICAL),timeToAttack:secsTo(100),isUnderThreat:cur>=THREAT_WARN,isDanger:cur>=THREAT_DANGER,isCritical:cur>=THREAT_CRITICAL,isUnderAttack,urgency:isUnderAttack?'attack':cur>=THREAT_CRITICAL?'critical':cur>=THREAT_DANGER?'danger':cur>=THREAT_WARN?'warn':'safe'}
  }
  const[s,setS]=useState<AttackStatus>(calc)
  useEffect(()=>{const id=setInterval(()=>setS(calc()),1000);return()=>clearInterval(id)},[planet])
  return s
}
export function useAllPlanetsAlert(planets:Planet[]){
  const[alerts,setAlerts]=useState<{planet:Planet;urgency:string;label:string}[]>([])
  useEffect(()=>{
    const id=setInterval(()=>{
      const now=Date.now()/1000
      setAlerts(planets.map(p=>{
        const cur=Math.min(100,Math.max(0,now-p.lastClaimTs)/SECS_PER_POINT)
        if(cur>=100&&p.monsterPower>0)return{planet:p,urgency:'attack',label:`${p.planetType} UNDER ATTACK`}
        if(cur>=THREAT_CRITICAL)return{planet:p,urgency:'critical',label:`${p.planetType} — ATTACK IMMINENT`}
        if(cur>=THREAT_DANGER)return{planet:p,urgency:'danger',label:`${p.planetType} — DANGER ZONE`}
        if(cur>=THREAT_WARN)return{planet:p,urgency:'warn',label:`${p.planetType} — Monster Spotted`}
        return null
      }).filter(Boolean) as any[])
    },5000)
    return()=>clearInterval(id)
  },[planets])
  return alerts
}
