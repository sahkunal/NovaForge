'use client'
import{Planet}from'@/lib/types'
import{useAttackTimer,fmtCountdown}from'@/lib/hooks/useAttackTimer'
interface Props{planet:Planet;compact?:boolean}
export default function AttackCountdown({planet,compact=false}:Props){
  const s=useAttackTimer(planet)
  const C={safe:{text:'#4ade80',bg:'rgba(74,222,128,0.08)',border:'rgba(74,222,128,0.2)'},warn:{text:'#fbbf24',bg:'rgba(251,191,36,0.08)',border:'rgba(251,191,36,0.25)'},danger:{text:'#f97316',bg:'rgba(249,115,22,0.1)',border:'rgba(249,115,22,0.3)'},critical:{text:'#f43f5e',bg:'rgba(244,63,94,0.12)',border:'rgba(244,63,94,0.4)'},attack:{text:'#f43f5e',bg:'rgba(244,63,94,0.18)',border:'rgba(244,63,94,0.6)'}}
  const c=C[s.urgency]
  if(compact)return(
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{background:c.bg,border:`1px solid ${c.border}`}}>
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:c.text,boxShadow:`0 0 6px ${c.text}`,animation:s.urgency!=='safe'?'pulse 1s infinite':'none'}}/>
      <span className="font-mono text-xs" style={{color:c.text,fontFamily:'JetBrains Mono,monospace',fontSize:'11px',fontWeight:600}}>
        {s.isUnderAttack?'ATTACK!':s.isCritical?`T-${fmtCountdown(s.timeToAttack)}`:s.isDanger?`T-${fmtCountdown(s.timeToCritical)}`:s.isUnderThreat?`T-${fmtCountdown(s.timeToDanger)}`:`T-${fmtCountdown(s.timeToWarn)}`}
      </span>
    </div>
  )
  return(
    <div className="rounded-xl overflow-hidden" style={{border:`1px solid ${c.border}`,background:c.bg}}>
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{borderColor:c.border}}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{background:c.text,boxShadow:`0 0 8px ${c.text}`}}/>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:c.text,letterSpacing:'0.12em',fontWeight:700}}>
          {s.urgency==='attack'?'UNDER ATTACK':s.urgency==='critical'?'ATTACK IMMINENT':s.urgency==='danger'?'DANGER ZONE':s.urgency==='warn'?'MONSTER SPOTTED':'PLANET SECURE'}
        </span>
      </div>
      <div className="px-3 py-3">
        {s.isUnderAttack?(
          <div className="text-center"><div style={{fontSize:'28px',marginBottom:4,color:'#d5ff72'}}>BREACH</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#f43f5e',letterSpacing:'0.08em'}}>HOSTILE FORCE ENGAGED</div><div className="text-xs text-slate-400 mt-1">Hostile wing has breached the orbital perimeter</div></div>
        ):(
          <div className="space-y-1.5">
            {s.urgency==='safe'&&<div className="flex justify-between items-center px-2 py-1.5 rounded-lg"><span className="text-xs text-slate-400">Monster arrives in</span><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'14px',fontWeight:700,color:c.text}}>{fmtCountdown(s.timeToWarn)}</span></div>}
            {(s.urgency==='warn'||s.urgency==='danger')&&<div className="flex justify-between items-center px-2 py-1.5 rounded-lg" style={{background:'rgba(249,115,22,0.08)'}}><span className="text-xs text-slate-400">Enters danger</span><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'14px',fontWeight:700,color:'#f97316'}}>{fmtCountdown(s.timeToDanger)}</span></div>}
            {(s.urgency==='warn'||s.urgency==='danger'||s.urgency==='critical')&&<div className="flex justify-between items-center px-2 py-1.5 rounded-lg" style={{background:s.urgency==='critical'?'rgba(244,63,94,0.1)':'transparent',animation:s.urgency==='critical'?'pulse 1s infinite':'none'}}><span className="text-xs text-slate-400">Attack in</span><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'14px',fontWeight:700,color:'#f43f5e'}}>{fmtCountdown(s.timeToAttack)}</span></div>}
          </div>
        )}
      </div>
      <div className="px-3 pb-3">
        <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Threat Level</span><span style={{color:c.text,fontFamily:'JetBrains Mono,monospace',fontWeight:600}}>{Math.floor(s.threatLevel)}/100</span></div>
        <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}><div className="h-full rounded-full transition-all duration-500" style={{width:`${s.threatLevel}%`,background:`linear-gradient(to right,#4ade80,#fbbf24 50%,#f43f5e)`,boxShadow:s.urgency!=='safe'?`0 0 8px ${c.text}`:'none'}}/></div>
        <div className="flex justify-between text-xs mt-1" style={{color:'#334155',fontFamily:'Orbitron,monospace',fontSize:'7px'}}><span>SAFE</span><span>WARN</span><span>DANGER</span><span>CRITICAL</span></div>
      </div>
    </div>
  )
}
