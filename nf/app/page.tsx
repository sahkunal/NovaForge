'use client'
import{useState,useCallback,useEffect}from 'react'
import dynamic from 'next/dynamic'
import{Planet}from '@/lib/types'
import{useNovaWallet}from '@/lib/hooks/useWallet'
import{usePlanets}from '@/lib/hooks/usePlanets'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import PlanetDetailPanel from '@/components/PlanetDetailPanel'
import AttackWarningBanner from '@/components/AttackWarningBanner'
const SplashScreen=dynamic(()=>import('@/components/SplashScreen'),{ssr:false})
const EntryScreen=dynamic(()=>import('@/components/EntryScreen'),{ssr:false})
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
const SpaceMap=dynamic(()=>import('@/components/SpaceMap'),{ssr:false})
export default function Home(){
  const[mounted,setMounted]=useState(false)
  const[splashDone,setSplashDone]=useState(false)
  const[selected,setSelected]=useState<Planet|null>(null)
  const{connected,publicKey}=useNovaWallet()
  const{planets,loading,refetch}=usePlanets(connected?publicKey:null)
  useEffect(()=>{setMounted(true)},[])
  const handleSelect=useCallback((p:Planet)=>setSelected(prev=>prev?.publicKey===p.publicKey?null:p),[])
  if(!mounted) return null
  if(!splashDone) return <SplashScreen onDone={()=>setSplashDone(true)}/>
  if(!connected) return <EntryScreen/>
  const atRisk=planets.filter(p=>p.threatLevel>=50).length,kills=planets.reduce((a,p)=>a+p.monstersKilled,0)
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <AttackWarningBanner planets={planets}/>
      <div className="absolute inset-0" style={{left:64,top:48}}>
        <div className="relative w-full h-full">
          <SpaceMap planets={planets} onSelectPlanet={handleSelect} selectedId={selected?.publicKey}/>
          <div className="absolute top-4 left-4 rounded-xl px-4 py-2.5 flex items-center gap-4" style={{background:'rgba(6,4,18,0.88)',border:'1px solid rgba(124,58,237,0.2)',backdropFilter:'blur(16px)'}}>
            <div className="flex items-center gap-2"><span style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#6d28d9',letterSpacing:'0.12em'}}>PLANETS</span><span className="text-white font-bold font-mono">{loading?'—':planets.length}<span className="text-slate-600">/10</span></span></div>
            <div className="w-px h-4 bg-purple-500/20"/>
            <div className="flex items-center gap-2"><span style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#4ade80',letterSpacing:'0.12em'}}>KILLS</span><span className="text-white font-bold font-mono">{kills}</span></div>
            {atRisk>0&&<><div className="w-px h-4 bg-purple-500/20"/><div className="flex items-center gap-2 animate-pulse"><span style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#f43f5e'}}>⚠ AT RISK</span><span className="text-red-400 font-bold font-mono">{atRisk}</span></div></>}
            <div className="w-px h-4 bg-purple-500/20"/>
            <button onClick={refetch} className="text-slate-600 hover:text-white transition-colors text-sm">↻</button>
          </div>
          {!loading&&planets.length===0&&(
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
              <div style={{fontSize:'72px',animation:'float 4s ease-in-out infinite'}}>🪐</div>
              <div className="text-center pointer-events-auto">
                <p style={{fontFamily:'Orbitron,monospace',fontSize:'18px',color:'#e2e8f0',fontWeight:700,letterSpacing:'0.1em',marginBottom:8}}>YOUR EMPIRE AWAITS</p>
                <p className="text-slate-400 text-sm mb-6">Mint your first planet to begin</p>
                <a href="/dashboard" className="btn-primary" style={{padding:'12px 32px',fontSize:'12px',textDecoration:'none',display:'inline-block'}}>⬡ Mint First Planet</a>
              </div>
            </div>
          )}
          <div className="absolute bottom-6 left-4 rounded-xl px-3 py-3" style={{background:'rgba(6,4,18,0.88)',border:'1px solid rgba(124,58,237,0.15)',backdropFilter:'blur(16px)'}}>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155',letterSpacing:'0.12em',marginBottom:6}}>THREAT LEVEL</div>
            {[['#4ade80','Safe'],['#fbbf24','Warning'],['#f97316','Danger'],['#f43f5e','Critical']].map(([c,l])=>(
              <div key={l} className="flex items-center gap-2 mb-1.5"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c}}/><span className="text-xs text-slate-400">{l}</span></div>
            ))}
          </div>
        </div>
      </div>
      {selected&&(
        <div className="absolute right-0 bottom-0 z-30 overflow-hidden" style={{top:48,width:286,background:'rgba(6,4,18,0.98)',backdropFilter:'blur(24px)',borderLeft:'1px solid rgba(124,58,237,0.18)'}}>
          <PlanetDetailPanel planet={selected} onClose={()=>setSelected(null)} onRefetch={refetch}/>
        </div>
      )}
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  )
}