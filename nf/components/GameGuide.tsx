'use client'
import{useState}from'react'
import{Planet}from'@/lib/types'
import{X,ChevronRight,ChevronLeft}from'lucide-react'
interface Props{planets:Planet[];onClose:()=>void}
const STEPS=[
  {emoji:'🪐',title:'You own a Planet NFT',color:'#7c3aed',lines:['Your planet is a real NFT on Solana devnet.','Click "Mint Planet" to create more — each earns resources independently.','More planets = more income = more power.'],action:null},
  {emoji:'🌐',title:'Step 1 — Colonize your planet',color:'#4ade80',lines:['Click any planet card → side panel opens on the right.','Click "🌐 Colonize" → approve in Phantom.','This starts the resource clock on-chain. Resources tick every second.'],action:'Click a planet card → Colonize'},
  {emoji:'⚡',title:'Step 2 — Watch resources grow',color:'#f59e0b',lines:['After colonizing, your planet card shows a live timer: 00:00:00','Iron ⚡, Gold 💧, Uranium ☢️ accumulate every second.','The longer you wait, the more you earn — but danger increases.'],action:'Watch the timer count up on your planet card'},
  {emoji:'⚠️',title:'Step 3 — Claim before monster attacks',color:'#fbbf24',lines:['After ~50 hours idle, a monster approaches your planet.','Red banner appears + countdown on the card.','Click "⚡ Claim Resources" → approve in Phantom → resources land on-chain.'],action:'Click planet → "⚡ Claim Resources" → approve'},
  {emoji:'⚔️',title:'Step 4 — Fight if monster attacks',color:'#f43f5e',lines:['If you wait too long, button changes to "⚔️ BATTLE & CLAIM".','Claiming triggers a fight: your Military Power vs Monster Power.','Win → resources + 20% boost. Lose → planet inactive, needs repair.'],action:'Upgrade Military first if your power is too low'},
  {emoji:'▲',title:'Step 5 — Spend resources to upgrade',color:'#a78bfa',lines:['Click planet → "▲ Upgrade Planet / Military" button.','Upgrade Planet = earn more per second (up to Level 10).','Upgrade Military = survive monster attacks without losing resources.'],action:'Click planet → "▲ Upgrade Planet / Military"'},
  {emoji:'🏪',title:'Step 6 — Sell your planet for SOL',color:'#5eead4',lines:['First Uncolonize your planet.','Click "🏪 List for Sale" → set a SOL price → approve.','Other players buy it on the Marketplace. High-level planet = real SOL value.'],action:'Uncolonize → List for Sale → set price'},
]
export default function GameGuide({planets,onClose}:Props){
  const[step,setStep]=useState(0)
  const cur=STEPS[step],isLast=step===STEPS.length-1
  return(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:'rgba(3,2,15,0.8)',backdropFilter:'blur(8px)'}}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{background:'rgba(8,6,22,0.99)',border:'1px solid rgba(124,58,237,0.3)',boxShadow:'0 0 60px rgba(124,58,237,0.15)'}}>
        <div className="h-1 w-full" style={{background:'rgba(255,255,255,0.05)'}}><div className="h-full transition-all duration-500" style={{width:`${((step+1)/STEPS.length)*100}%`,background:`linear-gradient(to right,#7c3aed,${cur.color})`}}/></div>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{borderColor:'rgba(124,58,237,0.15)'}}><span style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569',letterSpacing:'0.15em'}}>HOW TO PLAY · {step+1}/{STEPS.length}</span><button onClick={onClose}><X size={16} className="text-slate-600 hover:text-slate-400"/></button></div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-5"><div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{background:`${cur.color}18`,border:`1px solid ${cur.color}40`}}>{cur.emoji}</div><h2 style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#e2e8f0',lineHeight:1.4}}>{cur.title}</h2></div>
          <div className="space-y-3 mb-4">{cur.lines.map((line,i)=><div key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{background:cur.color}}/><p className="text-sm text-slate-300 leading-relaxed">{line}</p></div>)}</div>
          {cur.action&&<div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-3" style={{background:`${cur.color}10`,border:`1px solid ${cur.color}30`}}><span style={{fontSize:'14px'}}>👉</span><div><div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:cur.color,letterSpacing:'0.12em',marginBottom:4}}>DO THIS NOW</div><p className="text-sm text-slate-200">{cur.action}</p></div></div>}
          {planets.length>0&&step>=1&&step<=4&&<div className="rounded-xl px-4 py-3 mb-4" style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)'}}><div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155',letterSpacing:'0.12em',marginBottom:8}}>YOUR PLANETS</div>{planets.map(p=><div key={p.publicKey} className="flex items-center gap-3 text-xs mb-2 last:mb-0"><div className={`w-2 h-2 rounded-full ${p.colonized?'bg-green-400':'bg-slate-600'}`}/><span className="text-slate-400 font-mono">{p.publicKey.slice(0,12)}...</span><span className="ml-auto font-mono" style={{color:p.colonized?'#4ade80':'#475569'}}>{p.inactive?'💀 Inactive':p.colonized?'🌐 Active ✓':'⬜ Uncolonized'}</span></div>)}</div>}
        </div>
        <div className="flex gap-3 px-5 pb-4">
          <button onClick={()=>setStep(s=>s-1)} disabled={step===0} className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs transition-all disabled:opacity-30 cursor-pointer" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#94a3b8',fontFamily:'Orbitron,monospace',fontSize:'10px'}}><ChevronLeft size={14}/>PREV</button>
          <button onClick={isLast?onClose:()=>setStep(s=>s+1)} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer" style={{background:`linear-gradient(135deg,#7c3aed,${cur.color})`,border:'none',color:'#fff',fontFamily:'Orbitron,monospace',fontSize:'11px',letterSpacing:'0.06em'}}>{isLast?"GOT IT — LET'S PLAY":<>{STEPS[step+1].emoji} NEXT<ChevronRight size={14}/></>}</button>
        </div>
        <div className="flex justify-center gap-1.5 pb-4">{STEPS.map((_,i)=><button key={i} onClick={()=>setStep(i)} className="rounded-full transition-all cursor-pointer" style={{width:i===step?20:6,height:6,background:i===step?cur.color:'rgba(255,255,255,0.1)'}}/> )}</div>
      </div>
    </div>
  )
}
