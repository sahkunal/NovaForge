'use client'
import{useState,useEffect}from 'react'
import dynamic from 'next/dynamic'
import{Planet}from '@/lib/types'
import{useNovaWallet}from '@/lib/hooks/useWallet'
import{usePlanets}from '@/lib/hooks/usePlanets'
import{useInitializePlanet}from '@/lib/hooks/useAnchorActions'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import PlanetCard from '@/components/PlanetCard'
import PlanetDetailPanel from '@/components/PlanetDetailPanel'
import MintModal from '@/components/MintModal'
import EntryScreen from '@/components/EntryScreen'
import AttackWarningBanner from '@/components/AttackWarningBanner'
import{sounds}from '@/lib/utils/sounds'
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
export default function Dashboard(){
  const[mounted,setMounted]=useState(false)
  const{connected,publicKey}=useNovaWallet()
  const{planets,loading,refetch}=usePlanets(connected?publicKey:null)
  const[selected,setSelected]=useState<Planet|null>(null)
  const[showMint,setShowMint]=useState(false)
  const{execute:mint,status:mintStatus,error:mintError}=useInitializePlanet()
  useEffect(()=>{setMounted(true)},[])
  if(!mounted) return null
  if(!connected) return <EntryScreen/>
  const stats=[{label:'Planets',value:planets.length,sub:'/ 10 max',color:'#a78bfa'},{label:'Colonized',value:planets.filter(p=>p.colonized).length,sub:'generating',color:'#4ade80'},{label:'Kills',value:planets.reduce((a,p)=>a+p.monstersKilled,0),sub:'lifetime',color:'#f97316'},{label:'At Risk',value:planets.filter(p=>p.threatLevel>=50).length,sub:'need attention',color:'#f43f5e'}]
  const handleMint=async(planetType:string,rarity:string)=>{await mint(planetType,rarity);sounds.mint();setTimeout(()=>{setShowMint(false);refetch()},2000)}
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <AttackWarningBanner planets={planets}/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:48,paddingRight:selected?286:0}}>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({label,value,sub,color})=>(
              <div key={label} className="relative overflow-hidden rounded-2xl p-4" style={{background:'rgba(8,6,22,0.9)',border:`1px solid ${color}20`,backdropFilter:'blur(16px)'}}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none" style={{background:`${color}0e`,filter:'blur(24px)',transform:'translate(35%,-35%)'}}/>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#334155',letterSpacing:'0.12em',marginBottom:6}}>{label.toUpperCase()}</div>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'32px',fontWeight:700,color,lineHeight:1}}>{loading?'—':value}</div>
                <div className="text-xs text-slate-600 mt-1.5">{sub}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-5">
            <div><h2 style={{fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:700,color:'#e2e8f0',letterSpacing:'0.1em'}}>MY PLANETS</h2><p className="text-xs text-slate-600 mt-0.5">Real on-chain data · resources tick live every second</p></div>
            <div className="flex gap-2"><button onClick={refetch} className="btn-ghost" style={{padding:'7px 14px',fontSize:'9px'}}>↻ Refresh</button><button onClick={()=>setShowMint(true)} className="btn-primary" style={{padding:'9px 20px',fontSize:'11px'}}>⬡ Mint Planet</button></div>
          </div>
          {loading&&<div className="flex items-center justify-center py-28 gap-3"><svg className="animate-spin" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="#7c3aed" strokeWidth="3" strokeDasharray="48" strokeDashoffset="24"/></svg><span style={{fontFamily:'Orbitron,monospace',fontSize:'12px',color:'#334155',letterSpacing:'0.15em'}}>SCANNING DEVNET...</span></div>}
          {!loading&&planets.length===0&&(
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div style={{fontSize:'80px',animation:'float 4s ease-in-out infinite'}}>🪐</div>
              <div className="text-center"><p style={{fontFamily:'Orbitron,monospace',fontSize:'18px',color:'#e2e8f0',letterSpacing:'0.1em',fontWeight:700,marginBottom:10}}>YOUR EMPIRE AWAITS</p><p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">Mint your first Planet NFT on Solana devnet to begin generating Iron, Gold &amp; Uranium every second.</p></div>
              <div className="rounded-2xl p-5 max-w-xs w-full" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.2)'}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#334155',letterSpacing:'0.12em',marginBottom:14}}>HOW IT WORKS</div>
                {[['1','Mint a Planet NFT','~0.01 SOL on devnet'],['2','Colonize your planet','Starts resource clock on-chain'],['3','Claim resources','Iron · Gold · Uranium per second'],['4','Fight invasions','Idle = monster attack'],['5','Upgrade & trade','Level up or sell for SOL']].map(([n,title,desc])=>(
                  <div key={n} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5" style={{background:'rgba(124,58,237,0.2)',color:'#a78bfa',border:'1px solid rgba(124,58,237,0.3)'}}>{n}</div>
                    <div><div className="text-sm text-white font-medium">{title}</div><div className="text-xs text-slate-500">{desc}</div></div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setShowMint(true)} className="btn-primary" style={{padding:'14px 44px',fontSize:'13px',letterSpacing:'0.08em'}}>⬡ Mint Your First Planet</button>
            </div>
          )}
          {!loading&&planets.length>0&&<div className="grid gap-4" style={{gridTemplateColumns:'repeat(auto-fill,minmax(275px,1fr))'}}>{planets.map(planet=><PlanetCard key={planet.publicKey} planet={planet} selected={selected?.publicKey===planet.publicKey} onClick={()=>setSelected(p=>p?.publicKey===planet.publicKey?null:planet)}/>)}</div>}
        </div>
      </div>
      {selected&&<div className="absolute right-0 bottom-0 z-30 overflow-hidden" style={{top:48,width:286,background:'rgba(6,4,18,0.98)',backdropFilter:'blur(24px)',borderLeft:'1px solid rgba(124,58,237,0.18)'}}><PlanetDetailPanel planet={selected} onClose={()=>setSelected(null)} onRefetch={refetch}/></div>}
      {showMint&&<MintModal onClose={()=>setShowMint(false)} onMint={handleMint} minting={mintStatus==='pending'} mintStatus={mintStatus} mintError={mintError}/>}
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  )
}