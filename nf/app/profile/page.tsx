'use client'
import{useState,useEffect}from 'react'
import dynamic from 'next/dynamic'
import{useNovaWallet}from '@/lib/hooks/useWallet'
import{usePlanets}from '@/lib/hooks/usePlanets'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import EntryScreen from '@/components/EntryScreen'
import PlanetCanvas from '@/components/PlanetCanvas'
import{Planet,formatNumber,PLANET_COLORS}from '@/lib/types'
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
function PlanetRow({planet}:{planet:Planet}){
  const c=PLANET_COLORS[planet.planetType]
  return(
    <div className="rounded-xl p-3 flex items-center gap-3" style={{background:'rgba(8,6,22,0.85)',border:'1px solid rgba(124,58,237,0.15)'}}>
      <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={42}/>
      <div className="flex-1 min-w-0">
        <div className="flex gap-1 mb-1 flex-wrap"><span className="badge" style={{color:c.primary,background:`${c.glow}20`,borderColor:`${c.primary}40`,fontSize:'8px'}}>{planet.planetType}</span><span className="badge badge-gray" style={{fontSize:'8px'}}>Lv {planet.level}</span>{planet.colonized&&<span className="badge badge-green" style={{fontSize:'8px'}}>Active</span>}{planet.listed&&<span className="badge badge-amber" style={{fontSize:'8px'}}>Listed</span>}{planet.inactive&&<span className="badge badge-red" style={{fontSize:'8px'}}>Inactive</span>}</div>
        <div className="text-xs text-slate-600 font-mono truncate">{planet.publicKey.slice(0,20)}...</div>
      </div>
      <div className="text-right flex-shrink-0"><div className="text-xs text-slate-600">Iron</div><div className="text-xs text-white font-mono font-semibold">{formatNumber(planet.ironBalance)}</div></div>
      <div className="text-right flex-shrink-0"><div className="text-xs text-slate-600">Kills</div><div className="text-sm text-green-400 font-mono font-semibold">{planet.monstersKilled}</div></div>
    </div>
  )
}
export default function Profile(){
  const[mounted,setMounted]=useState(false)
  const{connected,publicKey}=useNovaWallet()
  const{planets,loading,refetch}=usePlanets(connected?publicKey:null)
  useEffect(()=>{setMounted(true)},[])
  if(!mounted) return null
  if(!connected) return <EntryScreen/>
  const tp=planets.reduce((a,p)=>a+p.power,0),tm=planets.reduce((a,p)=>a+p.militaryPower,0),tk=planets.reduce((a,p)=>a+p.monstersKilled,0),listed=planets.filter(p=>p.listed)
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:48}}>
        <div className="p-6 max-w-4xl">
          <div className="rounded-2xl p-6 mb-6 flex items-center gap-6" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.2)'}}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{background:'linear-gradient(135deg,#7c3aed,#0f9e8a)',boxShadow:'0 0 30px rgba(124,58,237,0.5)'}}>⬡</div>
            <div className="flex-1 min-w-0"><div style={{fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:700,color:'#e2e8f0',letterSpacing:'0.08em'}}>COMMANDER</div><div className="text-slate-500 text-sm font-mono mt-1 truncate">{publicKey}</div><div className="flex gap-2 mt-2 flex-wrap"><span className="badge badge-purple">{planets.length} Planets</span><span className="badge badge-green">{tk} Kills</span><span className="badge badge-teal">{planets.filter(p=>p.colonized).length} Active</span></div></div>
            <div className="grid grid-cols-2 gap-5 text-right flex-shrink-0">
              {[{l:'Total Power',v:formatNumber(tp),c:'#a78bfa'},{l:'Military',v:formatNumber(tm),c:'#f43f5e'}].map(({l,v,c})=>(
                <div key={l}><div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155'}}>{l}</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'14px',fontWeight:700,color:c}}>{v}</div></div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center justify-between"><h3 style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#a78bfa',letterSpacing:'0.1em'}}>OWNED PLANETS</h3><button onClick={refetch} className="btn-ghost" style={{padding:'4px 10px',fontSize:'9px'}}>↻</button></div>
              {loading&&<div className="text-center py-8 text-slate-600 text-sm">Fetching from devnet...</div>}
              {!loading&&planets.length===0&&<div className="rounded-2xl p-6 text-center" style={{background:'rgba(8,6,22,0.85)',border:'1px solid rgba(124,58,237,0.12)'}}><p className="text-slate-500 text-sm">No planets yet</p><a href="/dashboard" className="text-purple-400 text-xs hover:text-purple-300 transition-colors mt-2 block">→ Mint your first planet</a></div>}
              {planets.map(p=><PlanetRow key={p.publicKey} planet={p}/>)}
              {listed.length>0&&<><h3 className="pt-2" style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#fbbf24',letterSpacing:'0.1em'}}>ACTIVE LISTINGS</h3>{listed.map(planet=>(
                <div key={planet.publicKey} className="rounded-xl p-3 flex items-center gap-3" style={{background:'rgba(8,6,22,0.85)',border:'1px solid rgba(245,158,11,0.2)'}}>
                  <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={42}/>
                  <div className="flex-1"><div className="flex gap-1 mb-1"><span className="badge badge-amber" style={{fontSize:'8px'}}>For Sale</span></div><div className="text-xs text-slate-600 font-mono">{planet.publicKey.slice(0,18)}...</div></div>
                  <div className="text-right"><div style={{fontFamily:'Orbitron,monospace',fontSize:'18px',fontWeight:700,color:'#fff'}}>{(planet.price/1e9).toFixed(2)} ◎</div></div>
                </div>
              ))}</>}
            </div>
            <div className="space-y-4">
              <h3 style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#5eead4',letterSpacing:'0.1em'}}>STATS</h3>
              <div className="rounded-2xl p-4 space-y-3" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.15)'}}>
                {[{l:'Total Planets',v:planets.length,c:'#a78bfa'},{l:'Colonized',v:planets.filter(p=>p.colonized).length,c:'#4ade80'},{l:'Listed',v:listed.length,c:'#fbbf24'},{l:'Inactive',v:planets.filter(p=>p.inactive).length,c:'#f43f5e'},{l:'Total Kills',v:tk,c:'#f97316'},{l:'Max Level',v:planets.length?Math.max(...planets.map(p=>p.level)):0,c:'#a78bfa'}].map(({l,v,c})=>(
                  <div key={l} className="flex justify-between items-center border-b pb-2" style={{borderColor:'rgba(124,58,237,0.08)'}}><span className="text-xs text-slate-500">{l}</span><span style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:c}}>{v}</span></div>
                ))}
              </div>
              <div className="rounded-2xl p-4" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.12)'}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#334155',letterSpacing:'0.12em',marginBottom:12}}>ON-CHAIN RESOURCES</div>
                {[{l:'⚡ Iron',v:planets.reduce((a,p)=>a+p.ironBalance,0),c:'#f59e0b'},{l:'💧 Gold',v:planets.reduce((a,p)=>a+p.goldBalance,0),c:'#60a5fa'},{l:'☢️ Uranium',v:planets.reduce((a,p)=>a+p.uraniumBalance,0),c:'#4ade80'}].map(({l,v,c})=>(
                  <div key={l} className="flex justify-between items-center mb-2"><span className="text-xs text-slate-500">{l}</span><span style={{fontFamily:'Orbitron,monospace',fontSize:'12px',fontWeight:700,color:c}}>{formatNumber(v)}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
