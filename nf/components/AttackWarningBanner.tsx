'use client'
import{useState,useEffect}from'react'
import{Planet}from'@/lib/types'
import{useAllPlanetsAlert}from'@/lib/hooks/useAttackTimer'
import{useRouter}from'next/navigation'
import{sounds}from'@/lib/utils/sounds'
interface Props{planets:Planet[]}
export default function AttackWarningBanner({planets}:Props){
  const alerts=useAllPlanetsAlert(planets)
  const[dismissed,setDismissed]=useState<string[]>([])
  const[current,setCurrent]=useState(0)
  const[prevCount,setPrevCount]=useState(0)
  const router=useRouter()
  const visible=alerts.filter(a=>!dismissed.includes(a.planet.publicKey))
  useEffect(()=>{if(visible.length>prevCount){const top=visible[0];if(top?.urgency==='attack')sounds.attack();else if(top?.urgency==='critical')sounds.alert()};setPrevCount(visible.length)},[visible.length])
  useEffect(()=>{if(visible.length<=1)return;const id=setInterval(()=>setCurrent(c=>(c+1)%visible.length),4000);return()=>clearInterval(id)},[visible.length])
  if(!visible.length)return null
  const alert=visible[Math.min(current,visible.length-1)]
  const isAttack=alert.urgency==='attack',isCritical=alert.urgency==='critical'
  const textColor=isAttack?'#f43f5e':isCritical?'#f87171':alert.urgency==='danger'?'#f97316':'#fbbf24'
  const bgColor=isAttack?'rgba(244,63,94,0.18)':isCritical?'rgba(244,63,94,0.12)':alert.urgency==='danger'?'rgba(249,115,22,0.1)':'rgba(251,191,36,0.08)'
  const borderColor=isAttack?'#f43f5e':isCritical?'rgba(244,63,94,0.7)':alert.urgency==='danger'?'rgba(249,115,22,0.6)':'rgba(251,191,36,0.5)'
  return(
    <div className="fixed top-12 left-64 right-0 z-45 px-4 pointer-events-none" style={{zIndex:45}}>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-b-xl pointer-events-auto ${isAttack?'invasion-pulse':''}`} style={{background:bgColor,border:`1px solid ${borderColor}`,borderTop:'none'}}>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{background:textColor,boxShadow:`0 0 8px ${textColor}`}}/>
        <span style={{fontSize:'18px'}}><span style={{color:'#d5ff72',fontSize:'11px',fontFamily:'JetBrains Mono,monospace'}}>HOSTILE</span></span>
        <div className="flex-1 min-w-0">
          <span style={{fontFamily:'Orbitron,monospace',fontSize:'11px',fontWeight:700,color:textColor,letterSpacing:'0.08em'}}>{isAttack?'BREACH // UNDER ATTACK ':isCritical?'CRITICAL // ATTACK IMMINENT ':alert.urgency==='danger'?'DANGER // HOSTILE APPROACH ':'WARNING // HOSTILE CONTACT '}</span>
          <span className="text-xs text-slate-300">{alert.label}</span>
        </div>
        {visible.length>1&&<span className="text-xs text-slate-500 flex-shrink-0">{current+1}/{visible.length}</span>}
        <button onClick={()=>router.push('/dashboard')} className="flex-shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105" style={{background:textColor,color:'#000',fontFamily:'Orbitron,monospace',fontSize:'9px',letterSpacing:'0.05em',cursor:'pointer'}}>{isAttack?'FIGHT NOW':'VIEW PLANET'}</button>
        <button onClick={()=>setDismissed(d=>[...d,alert.planet.publicKey])} className="flex-shrink-0 text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none cursor-pointer">×</button>
      </div>
      <div className="h-0.5" style={{background:'rgba(255,255,255,0.05)'}}><div className="h-full transition-all duration-1000" style={{width:`${alert.urgency==='attack'?100:alert.urgency==='critical'?90:alert.urgency==='danger'?75:50}%`,background:`linear-gradient(to right,${textColor}88,${textColor})`,boxShadow:`0 0 8px ${textColor}`}}/></div>
    </div>
  )
}
