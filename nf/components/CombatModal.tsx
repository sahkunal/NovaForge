'use client'
import{useState,useEffect}from 'react'
import{Planet,PLANET_COLORS,MONSTER_NAMES,MONSTER_EMOJIS}from '@/lib/types'
interface Props{planet:Planet;result:'win'|'lose'|null;onClose:()=>void;resourcesClaimed?:{iron:number;gold:number;uranium:number}}
export default function CombatModal({planet,result,onClose,resourcesClaimed}:Props){
  const[phase,setPhase]=useState<'fight'|'result'>('fight')
  const[defBar,setDefBar]=useState(100),[monBar,setMonBar]=useState(100)
  const col=PLANET_COLORS[planet.planetType]
  const fmt=(n:number)=>n>=1000?(n/1000).toFixed(1)+'K':Math.floor(n).toString()
  useEffect(()=>{
    const b=setInterval(()=>{if(result==='win'){setMonBar(p=>Math.max(0,p-10));setDefBar(p=>Math.max(30,p-3))}else{setMonBar(p=>Math.max(40,p-3));setDefBar(p=>Math.max(0,p-10))}},80)
    const t=setTimeout(()=>{clearInterval(b);setPhase('result')},2400)
    return()=>{clearInterval(b);clearTimeout(t)}
  },[result])
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(3,2,15,0.94)',backdropFilter:'blur(14px)'}}>
      <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden" style={{background:'rgba(8,5,22,0.98)',border:'1px solid rgba(244,63,94,0.35)',boxShadow:'0 0 80px rgba(244,63,94,0.3)'}}>
        {phase==='fight'?(
          <>
            <div className="h-0.5" style={{background:'linear-gradient(to right,transparent,#f43f5e,transparent)'}}/>
            <div className="p-5 text-center border-b border-red-500/20"><div style={{fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:900,color:'#f43f5e',letterSpacing:'0.15em'}}>⚔️ COMBAT</div><div className="text-xs text-slate-400 mt-1">{MONSTER_NAMES[planet.planetType]} is attacking!</div></div>
            <div className="p-6 space-y-5">
              <div><div className="flex justify-between text-xs mb-2"><span style={{color:col.primary,fontFamily:'Orbitron,monospace',fontSize:'10px'}}>🛡 YOUR DEFENSE</span><span className="text-white font-mono font-bold">{planet.militaryPower}</span></div><div className="h-4 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.07)'}}><div className="h-full rounded-full transition-all duration-100" style={{width:`${defBar}%`,background:`linear-gradient(to right,${col.primary},${col.secondary})`}}/></div></div>
              <div className="flex items-center justify-center gap-8"><div style={{fontSize:'48px',animation:'float 1.5s ease-in-out infinite'}}>{MONSTER_EMOJIS[planet.planetType]}</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'28px',color:'#f43f5e',fontWeight:900,textShadow:'0 0 20px rgba(244,63,94,0.8)'}}>VS</div><div style={{fontSize:'48px',animation:'float 1.5s ease-in-out infinite 0.5s'}}>🪐</div></div>
              <div><div className="flex justify-between text-xs mb-2"><span className="text-red-400" style={{fontFamily:'Orbitron,monospace',fontSize:'10px'}}>💀 {MONSTER_NAMES[planet.planetType].toUpperCase()}</span><span className="text-white font-mono font-bold">{planet.monsterPower}</span></div><div className="h-4 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.07)'}}><div className="h-full rounded-full transition-all duration-100" style={{width:`${monBar}%`,background:'linear-gradient(to right,#f43f5e,#7f1d1d)'}}/></div></div>
              <div className="text-center animate-pulse" style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569',letterSpacing:'0.25em'}}>COMBAT IN PROGRESS...</div>
            </div>
          </>
        ):result==='win'?(
          <div className="p-8 text-center space-y-4">
            <div style={{fontSize:'64px',animation:'float 2s ease-in-out infinite'}}>🏆</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'26px',fontWeight:900,color:'#4ade80',letterSpacing:'0.12em',textShadow:'0 0 30px rgba(74,222,128,0.8)'}}>VICTORY!</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#86efac'}}>MONSTER SLAIN</div>
            {resourcesClaimed&&(resourcesClaimed.iron+resourcesClaimed.gold+resourcesClaimed.uranium)>0&&(
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[{l:'⚡',v:resourcesClaimed.iron,c:'#f59e0b'},{l:'💧',v:resourcesClaimed.gold,c:'#60a5fa'},{l:'☢️',v:resourcesClaimed.uranium,c:'#4ade80'}].map(({l,v,c})=>(
                    <div key={l} className="rounded-xl p-3 text-center" style={{background:`${c}12`,border:`1px solid ${c}30`}}><div style={{fontSize:'20px'}}>{l}</div><div style={{color:c,fontFamily:'Orbitron,monospace',fontSize:'14px',fontWeight:700,marginTop:2}}>+{fmt(v)}</div></div>
                  ))}
                </div>
                <div className="rounded-xl p-2 flex items-center justify-center" style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.25)'}}><span style={{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#4ade80'}}>⚡ SPEED BOOST +20% FOR 1 HOUR</span></div>
              </div>
            )}
            <button onClick={onClose} className="w-full rounded-xl py-4" style={{background:'linear-gradient(135deg,#15803d,#14532d)',border:'1px solid rgba(74,222,128,0.3)',fontFamily:'Orbitron,monospace',fontSize:'12px',fontWeight:700,color:'#fff',cursor:'pointer',letterSpacing:'0.08em',boxShadow:'0 0 20px rgba(74,222,128,0.3)'}}>AWESOME! →</button>
          </div>
        ):(
          <div className="p-8 text-center space-y-4">
            <div style={{fontSize:'64px',animation:'float 2s ease-in-out infinite'}}>💀</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'22px',fontWeight:900,color:'#f43f5e',letterSpacing:'0.12em',textShadow:'0 0 30px rgba(244,63,94,0.8)'}}>DEFEAT</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#fda4af'}}>PLANET DAMAGED</div>
            <div className="rounded-xl p-4" style={{background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.25)'}}><div style={{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#f43f5e',marginBottom:8}}>REPAIR REQUIRED</div><div className="text-xs text-slate-400">Resources were looted. Repair your planet to continue generating.</div></div>
            <button onClick={onClose} className="w-full rounded-xl py-4" style={{background:'linear-gradient(135deg,#dc2626,#7f1d1d)',border:'1px solid rgba(244,63,94,0.3)',fontFamily:'Orbitron,monospace',fontSize:'12px',fontWeight:700,color:'#fff',cursor:'pointer',letterSpacing:'0.08em'}}>🔧 REPAIR PLANET</button>
          </div>
        )}
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}
