'use client'
import{useEffect,useState}from 'react'
interface Props{iron:number;gold:number;uranium:number;onDone:()=>void}
export default function ClaimPopup({iron,gold,uranium,onDone}:Props){
  const[visible,setVisible]=useState(true)
  useEffect(()=>{const t=setTimeout(()=>{setVisible(false);setTimeout(onDone,500)},3200);return()=>clearTimeout(t)},[onDone])
  const fmt=(n:number)=>n>=1000?(n/1000).toFixed(1)+'K':Math.floor(n).toString()
  return(
    <div className={`fixed top-14 right-5 z-50 transition-all duration-500 ${visible?'opacity-100 translate-y-0':'opacity-0 -translate-y-4'}`}>
      <div className="rounded-2xl overflow-hidden" style={{background:'rgba(6,4,18,0.97)',border:'1px solid rgba(74,222,128,0.5)',boxShadow:'0 0 40px rgba(74,222,128,0.25)',minWidth:220}}>
        <div className="h-0.5" style={{background:'linear-gradient(to right,transparent,#4ade80,transparent)'}}/>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/><span style={{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#4ade80',letterSpacing:'0.1em',fontWeight:700}}>RESOURCES CLAIMED</span></div>
          {[{l:'⚡ Iron',v:iron,c:'#f59e0b'},{l:'💧 Gold',v:gold,c:'#60a5fa'},{l:'☢️ Uranium',v:uranium,c:'#4ade80'}].filter(r=>r.v>0).map(({l,v,c})=>(
            <div key={l} className="flex items-center justify-between mb-2"><span className="text-xs text-slate-400">{l}</span><span className="text-base font-bold font-mono" style={{color:c}}>+{fmt(v)}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}
