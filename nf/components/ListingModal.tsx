'use client'
import{useState}from 'react'
import{Planet,PLANET_COLORS}from '@/lib/types'
import{useListPlanet}from '@/lib/hooks/useAnchorActions'
import ActionButton from './ActionButton'
import PlanetCanvas from './PlanetCanvas'
import{X}from 'lucide-react'
interface Props{planet:Planet;onClose:()=>void}
export default function ListingModal({planet,onClose}:Props){
  const[price,setPrice]=useState('')
  const{execute:list,status}=useListPlanet()
  const col=PLANET_COLORS[planet.planetType],sol=parseFloat(price)||0
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(3,2,15,0.9)',backdropFilter:'blur(14px)'}}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{background:'rgba(8,6,22,0.98)',border:'1px solid rgba(124,58,237,0.28)',boxShadow:'0 0 50px rgba(124,58,237,0.15)'}}>
        <div className="h-0.5" style={{background:'linear-gradient(to right,transparent,#7c3aed,transparent)'}}/>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:'rgba(124,58,237,0.15)'}}><h2 style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#e2e8f0'}}>🏪 LIST FOR SALE</h2><button onClick={onClose}><X size={16} className="text-slate-500 hover:text-white"/></button></div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{background:`${col.glow}12`,border:`1px solid ${col.primary}28`}}><PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={46}/><div><div className="flex gap-1 mb-1"><span className="badge" style={{color:col.primary,borderColor:`${col.primary}40`,fontSize:'9px'}}>{planet.planetType}</span><span className="badge badge-gray" style={{fontSize:'9px'}}>Lv {planet.level}</span></div><div className="text-xs text-slate-500 font-mono">{planet.publicKey.slice(0,16)}...</div></div></div>
          <div><label className="text-xs text-slate-500 mb-1.5 block" style={{fontFamily:'Orbitron,monospace',fontSize:'9px',letterSpacing:'0.1em'}}>PRICE (SOL)</label><div className="relative"><input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.0" min="0" step="0.1" className="w-full rounded-xl px-4 py-3.5 text-white text-xl font-mono pr-14 focus:outline-none" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(124,58,237,0.28)'}}/><span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 text-lg">◎</span></div></div>
          {sol>0&&<div className="space-y-1.5 text-xs font-mono px-1"><div className="flex justify-between text-slate-400"><span>Price</span><span className="text-white">{sol.toFixed(3)} ◎</span></div><div className="flex justify-between text-slate-400"><span>Fee (1%)</span><span className="text-amber-400">-{(sol*0.01).toFixed(3)} ◎</span></div><div className="h-px bg-purple-500/15 my-1"/><div className="flex justify-between"><span className="text-slate-300">You receive</span><span className="text-green-400 font-bold">{(sol*0.99).toFixed(3)} ◎</span></div></div>}
          <div className="rounded-xl p-3" style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.18)'}}><div className="text-xs text-amber-400 mb-1" style={{fontFamily:'Orbitron,monospace',fontSize:'9px'}}>⚠ NOTE</div><div className="text-xs text-slate-400">Uncolonize first. NFT will be frozen via MPL-Core until sold or cancelled.</div></div>
          <ActionButton label="🏪 List Planet" loadingLabel="Listing..." successLabel="✓ Listed!" status={status} onClick={()=>list(planet.publicKey,planet.asset,sol)} disabled={!sol||sol<=0}/>
        </div>
      </div>
    </div>
  )
}
