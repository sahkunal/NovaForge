'use client'
import{useState,useEffect}from'react'
import dynamic from'next/dynamic'
import{useNovaWallet}from'@/lib/hooks/useWallet'
import{usePlanets}from'@/lib/hooks/usePlanets'
import{useInitializePlanet}from'@/lib/hooks/useAnchorActions'
import NavigationBar from'@/components/NavigationBar'
import TopBar from'@/components/TopBar'
import EntryScreen from'@/components/EntryScreen'
import PlanetCard from'@/components/PlanetCard'
import PlanetDetailPanel from'@/components/PlanetDetailPanel'
import MintModal from'@/components/MintModal'
import GameGuide from'@/components/GameGuide'
import AttackWarningBanner from'@/components/AttackWarningBanner'
import{sounds}from'@/lib/utils/sounds'
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
export default function Dashboard(){
  const[mounted,setMounted]=useState(false)
  const[showMint,setShowMint]=useState(false)
  const[showGuide,setShowGuide]=useState(false)
  const[selectedId,setSelectedId]=useState<string|null>(null)
  const{connected,publicKey}=useNovaWallet()
  const{planets,loading,refetch}=usePlanets(connected?publicKey:null)
  const{execute:mint,status:mintStatus,error:mintError}=useInitializePlanet()
  const selected=planets.find(p=>p.publicKey===selectedId)||null
  useEffect(()=>{setMounted(true)},[])
  if(!mounted)return null
  if(!connected)return<EntryScreen/>
  const handleMint=async(t:string,r:string)=>{await mint(t,r);sounds.mint();setTimeout(()=>{setShowMint(false);refetch()},2000)}
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <AttackWarningBanner planets={planets}/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:48,right:selected?286:0}}>
        <div className="p-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div><h1 style={{fontFamily:'Orbitron,monospace',fontSize:'20px',fontWeight:900,color:'#e2e8f0',letterSpacing:'0.1em'}}>⬡ COMMAND CENTER</h1><p className="text-xs text-slate-500 mt-1">{planets.length} planet{planets.length!==1?'s':''} · {planets.filter(p=>p.colonized&&!p.inactive).length} active</p></div>
            <div className="flex gap-2">
              <button onClick={()=>setShowGuide(true)} className="btn-ghost" style={{padding:'8px 14px',fontSize:'9px'}}>? HOW TO PLAY</button>
              <button onClick={refetch} disabled={loading} className="btn-ghost" style={{padding:'8px 14px',fontSize:'9px'}}>{loading?'...':'↻ REFRESH'}</button>
              <button onClick={()=>setShowMint(true)} className="btn-primary" style={{padding:'8px 20px',fontSize:'11px'}}>⬡ Mint Planet</button>
            </div>
          </div>
          {/* Empty state */}
          {!loading&&planets.length===0&&(
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div style={{fontSize:'72px',marginBottom:20}}>🌌</div>
              <h2 style={{fontFamily:'Orbitron,monospace',fontSize:'20px',fontWeight:700,color:'#e2e8f0',letterSpacing:'0.1em',marginBottom:8}}>YOUR EMPIRE AWAITS</h2>
              <p className="text-slate-500 text-sm mb-8 max-w-sm">Mint your first planet NFT to start generating resources on-chain. Every second counts.</p>
              <button onClick={()=>setShowMint(true)} className="btn-primary" style={{padding:'14px 40px',fontSize:'13px'}}>⬡ Mint First Planet</button>
            </div>
          )}
          {/* Planet grid */}
          {planets.length>0&&(
            <div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>
              {planets.map(p=><PlanetCard key={p.publicKey} planet={p} selected={p.publicKey===selectedId} onClick={()=>setSelectedId(p.publicKey===selectedId?null:p.publicKey)}/>)}
            </div>
          )}
        </div>
      </div>
      {/* Side panel */}
      {selected&&(
        <div className="absolute right-0 top-12 bottom-0 flex flex-col overflow-y-auto" style={{width:286,background:'rgba(8,6,22,0.96)',borderLeft:'1px solid rgba(124,58,237,0.2)',backdropFilter:'blur(20px)'}}>
          <PlanetDetailPanel planet={selected} onClose={()=>setSelectedId(null)} onRefetch={refetch}/>
        </div>
      )}
      {showMint&&<MintModal onClose={()=>setShowMint(false)} onMint={handleMint} minting={mintStatus==='pending'} mintStatus={mintStatus} mintError={mintError}/>}
      {showGuide&&<GameGuide planets={planets} onClose={()=>setShowGuide(false)}/>}
    </div>
  )
}
