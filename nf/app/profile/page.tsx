'use client'
import{useState,useEffect}from'react'
import dynamic from'next/dynamic'
import{useNovaWallet}from'@/lib/hooks/useWallet'
import{usePlanets}from'@/lib/hooks/usePlanets'
import{PLANET_COLORS,RARITY_COLORS,formatNumber}from'@/lib/types'
import NavigationBar from'@/components/NavigationBar'
import TopBar from'@/components/TopBar'
import EntryScreen from'@/components/EntryScreen'
import PlanetCanvas from'@/components/PlanetCanvas'
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
export default function Profile(){
  const[mounted,setMounted]=useState(false)
  const{connected,publicKey,balance}=useNovaWallet()
  const{planets}=usePlanets(connected?publicKey:null)
  useEffect(()=>{setMounted(true)},[])
  if(!mounted)return null
  if(!connected)return<EntryScreen/>
  const stats={totalPlanets:planets.length,colonized:planets.filter(p=>p.colonized&&!p.inactive).length,totalKills:planets.reduce((a,p)=>a+p.monstersKilled,0),totalPower:planets.reduce((a,p)=>a+p.power,0),totalMil:planets.reduce((a,p)=>a+p.militaryPower,0),maxLevel:planets.reduce((a,p)=>Math.max(a,p.level),0),iron:planets.reduce((a,p)=>a+p.ironBalance,0),gold:planets.reduce((a,p)=>a+p.goldBalance,0),uranium:planets.reduce((a,p)=>a+p.uraniumBalance,0)}
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:48}}>
        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="mb-6" style={{fontFamily:'Orbitron,monospace',fontSize:'20px',fontWeight:900,color:'#e2e8f0',letterSpacing:'0.1em'}}>👤 COMMANDER PROFILE</h1>
          {/* ID card */}
          <div className="rounded-2xl p-6 mb-6" style={{background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.25)'}}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{background:'rgba(124,58,237,0.2)',border:'1px solid rgba(124,58,237,0.4)'}}>⬡</div>
              <div><div style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#7c3aed',letterSpacing:'0.1em',marginBottom:4}}>COMMANDER ID</div><div className="text-lg text-white font-mono font-bold break-all">{publicKey?.slice(0,20)}...</div><div className="text-xs text-slate-500 mt-1 font-mono">{publicKey}</div></div>
              <div className="ml-auto text-right"><div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569',marginBottom:4}}>SOL BALANCE</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'24px',fontWeight:700,color:'#a78bfa'}}>{balance.toFixed(3)}<span style={{fontSize:'14px',color:'#7c3aed'}}> ◎</span></div></div>
            </div>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">{[{l:'Total Planets',v:stats.totalPlanets,c:'#a78bfa',i:'🪐'},{l:'Active',v:stats.colonized,c:'#4ade80',i:'🌐'},{l:'Monster Kills',v:stats.totalKills,c:'#f97316',i:'⚔️'},{l:'Total Power',v:formatNumber(stats.totalPower),c:'#60a5fa',i:'⚡'},{l:'Military',v:formatNumber(stats.totalMil),c:'#f43f5e',i:'🛡'},{l:'Highest Level',v:stats.maxLevel,c:'#fbbf24',i:'▲'}].map(({l,v,c,i})=><div key={l} className="rounded-2xl p-4 text-center" style={{background:'rgba(8,6,22,0.9)',border:`1px solid ${c}20`}}><div style={{fontSize:'24px',marginBottom:8}}>{i}</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'20px',fontWeight:700,color:c,marginBottom:4}}>{v}</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155',letterSpacing:'0.1em'}}>{l}</div></div>)}</div>
          {/* Resources */}
          <div className="rounded-2xl p-4 mb-6" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.15)'}}><div style={{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#334155',letterSpacing:'0.12em',marginBottom:12}}>TOTAL RESOURCES ON-CHAIN</div><div className="grid grid-cols-3 gap-3">{[{i:'⚡',l:'Iron',v:stats.iron,c:'#f59e0b'},{i:'💧',l:'Gold',v:stats.gold,c:'#60a5fa'},{i:'☢️',l:'Uranium',v:stats.uranium,c:'#4ade80'}].map(({i,l,v,c})=><div key={l} className="text-center p-3 rounded-xl" style={{background:`${c}08`,border:`1px solid ${c}20`}}><div style={{fontSize:'20px'}}>{i}</div><div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'18px',fontWeight:700,color:c,marginTop:4}}>{formatNumber(v)}</div><div className="text-xs text-slate-500 mt-0.5">{l}</div></div>)}</div></div>
          {/* Planets list */}
          {planets.length>0&&<div><div style={{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#334155',letterSpacing:'0.12em',marginBottom:12}}>YOUR PLANETS</div><div className="grid gap-3" style={{gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))'}}>{planets.map(p=>{const col=PLANET_COLORS[p.planetType],rc=RARITY_COLORS[p.rarity];return(<div key={p.publicKey} className="rounded-2xl p-3" style={{background:'rgba(8,6,22,0.9)',border:`1px solid ${col.primary}25`}}><div className="flex items-center gap-2 mb-2"><PlanetCanvas planetType={p.planetType} rarity={p.rarity} size={36}/><div><div style={{color:col.primary,fontFamily:'Orbitron,monospace',fontSize:'10px'}}>{p.planetType}</div><div style={{color:rc,fontFamily:'Orbitron,monospace',fontSize:'8px'}}>{p.rarity} · Lv{p.level}</div></div></div><div className="flex justify-between text-xs"><span className="text-slate-500">Kills</span><span style={{color:'#f97316'}}>{p.monstersKilled}</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Power</span><span style={{color:'#a78bfa'}}>{formatNumber(p.power)}</span></div><div className="flex justify-between text-xs mt-1"><span/><span className={`badge ${p.inactive?'badge-red':p.colonized?'badge-green':'badge-gray'}`} style={{fontSize:'7px'}}>{p.inactive?'INACTIVE':p.colonized?'ACTIVE':'IDLE'}</span></div></div>)})}</div></div>}
        </div>
      </div>
    </div>
  )
}
