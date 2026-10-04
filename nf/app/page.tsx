'use client'
import{useState,useEffect}from'react'
import dynamic from'next/dynamic'
import{useNovaWallet}from'@/lib/hooks/useWallet'
import{usePlanets}from'@/lib/hooks/usePlanets'
import EntryScreen from'@/components/EntryScreen'
import PlanetDetailPanel from'@/components/PlanetDetailPanel'
import GalaxyHUD from'@/components/hud/GalaxyHUD'
import ThreatRadar,{RadarThreat}from'@/components/hud/ThreatRadar'
import PlanetHUD from'@/components/hud/PlanetHUD'
const NovaForgeScene=dynamic(()=>import('@/components/scene/NovaForgeScene'),{ssr:false})
const SplashScreen=dynamic(()=>import('@/components/SplashScreen'),{ssr:false})
export default function Home(){
 const[mounted,setMounted]=useState(false)
 const[splash,setSplash]=useState(true)
 const[selectedId,setSelectedId]=useState<string|null>(null)
 const[detailOpen,setDetailOpen]=useState(false)
 const{connected,publicKey,balance}=useNovaWallet()
 const{planets,loading,refetch}=usePlanets(connected?publicKey:null)
 const selected=planets.find(p=>p.publicKey===selectedId)||null
 useEffect(()=>{setMounted(true)},[])
 if(!mounted)return null
 if(splash)return<SplashScreen onDone={()=>setSplash(false)}/>
 if(!connected)return<EntryScreen/>
 const threats:RadarThreat[]=planets.filter(p=>p.threatLevel>0||p.monsterPower>0).map(p=>({id:p.publicKey,name:`${p.planetType} // ${p.publicKey.slice(0,5)}`,power:p.monsterPower,level:p.level,severity:p.threatLevel>=80?'CRITICAL':p.threatLevel>=55?'HIGH':p.threatLevel>=25?'MEDIUM':'LOW'}))
 return <div className="fixed inset-0 overflow-hidden bg-[#010208]">
   <NovaForgeScene planets={planets} selectedPlanet={selected} onPlanetSelect={p=>setSelectedId(p.publicKey===selectedId?null:p.publicKey)}/>
   <GalaxyHUD planetCount={planets.length} threatCount={threats.length} solBalance={balance} walletAddress={publicKey} connected={connected}/>
   <ThreatRadar threats={threats} onSelect={t=>setSelectedId(t.id)}/>
   {selected&&<PlanetHUD planet={selected} onClose={()=>setSelectedId(null)} onManage={()=>setDetailOpen(true)} onAttack={()=>setDetailOpen(true)}/>}
   {selected&&detailOpen&&<div className="nf-existing-detail"><PlanetDetailPanel planet={selected} onClose={()=>setDetailOpen(false)} onRefetch={refetch}/></div>}
   <div className="nf-bottom-nav"><a href="/" className="active">GALAXY</a><a href="/marketplace">MARKET</a><a href="/leaderboard">RANKINGS</a><a href="/dashboard">COMMAND</a></div>
   {loading&&<div className="nf-loading">SYNCHRONIZING SECTOR...</div>}
   {planets.length===0&&!loading&&<div className="nf-empty"><div>NO COLONIZED PLANETS DETECTED</div><a href="/dashboard">OPEN COMMAND // MINT PLANET</a></div>}
 </div>
}
