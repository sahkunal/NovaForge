'use client'
import{useState}from 'react'
import{PlanetType,Rarity,PLANET_COLORS,RARITY_COLORS}from '@/lib/types'
import{ActionStatus}from '@/lib/hooks/useAnchorActions'
import PlanetCanvas from './PlanetCanvas'
import{X}from 'lucide-react'
interface Props{onClose:()=>void;onMint:(t:string,r:string)=>void;minting:boolean;mintStatus:ActionStatus;mintError?:string|null}
const TYPES:PlanetType[]=['Mining','Luxury','Research','Energy','Military']
const DESC:Record<PlanetType,string>={Mining:'+50% Iron · Rock Golem threat',Luxury:'+50% Gold · Space Pirates threat',Research:'-10% upgrade cost · Alien Swarm',Energy:'+50% Uranium · Plasma Wraith',Military:'High defense · Void Titan threat'}
const RARITIES:Rarity[]=['Common','Rare','Epic','Legendary']
const MULT:Record<Rarity,string>={Common:'1x',Rare:'2x',Epic:'3x',Legendary:'5x'}
export default function MintModal({onClose,onMint,minting,mintStatus,mintError}:Props){
  const[selType,setSelType]=useState<PlanetType>('Mining')
  const[selRarity,setSelRarity]=useState<Rarity>('Common')
  const hasRing=selType==='Military'||selRarity==='Legendary'
  const isSuccess=mintStatus==='success'
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(3,2,15,0.85)',backdropFilter:'blur(12px)'}}>
      <div className="w-full rounded-2xl overflow-hidden flex flex-col" style={{maxWidth:500,maxHeight:'88vh',background:'rgba(8,6,22,0.98)',border:'1px solid rgba(124,58,237,0.3)',boxShadow:'0 0 60px rgba(124,58,237,0.2)'}}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{borderBottom:'1px solid rgba(124,58,237,0.15)'}}>
          <div><h2 style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#e2e8f0',letterSpacing:'0.1em'}}>⬡ MINT PLANET NFT</h2><p className="text-xs text-slate-500 mt-0.5">MPL-Core NFT on Solana devnet · ~0.01 SOL</p></div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors"><X size={16}/></button>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Compact preview */}
          <div className="flex items-center gap-4 p-3 rounded-xl" style={{background:'rgba(124,58,237,0.07)',border:'1px solid rgba(124,58,237,0.15)'}}>
            <div style={{animation:'float 4s ease-in-out infinite',flexShrink:0}}><PlanetCanvas planetType={selType} rarity={selRarity} size={68} hasRing={hasRing}/></div>
            <div>
              <div className="flex gap-2 mb-1">
                <span style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:PLANET_COLORS[selType].primary,fontWeight:700}}>{selType.toUpperCase()}</span>
                <span style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:RARITY_COLORS[selRarity]}}>{selRarity} · {MULT[selRarity]}</span>
              </div>
              <div className="text-xs text-slate-400">{DESC[selType]}</div>
            </div>
          </div>
          {/* Type */}
          <div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569',letterSpacing:'0.12em',marginBottom:8}}>PLANET TYPE</div>
            <div className="grid grid-cols-5 gap-2">
              {TYPES.map(t=>{const c=PLANET_COLORS[t],active=selType===t;return(
                <button key={t} onClick={()=>setSelType(t)} className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all" style={{border:`1px solid ${active?c.primary:'rgba(124,58,237,0.1)'}`,background:active?`${c.glow}20`:'rgba(255,255,255,0.02)',transform:active?'scale(1.05)':'scale(1)',boxShadow:active?`0 0 12px ${c.glow}`:'none'}}>
                  <PlanetCanvas planetType={t} rarity="Common" size={26} animated={false}/>
                  <span style={{fontFamily:'Orbitron,monospace',fontSize:'7px',color:active?c.primary:'#334155'}}>{t.slice(0,3).toUpperCase()}</span>
                </button>
              )})}
            </div>
          </div>
          {/* Rarity */}
          <div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569',letterSpacing:'0.12em',marginBottom:8}}>RARITY</div>
            <div className="grid grid-cols-4 gap-2">
              {RARITIES.map(r=>{const active=selRarity===r,color=RARITY_COLORS[r];return(
                <button key={r} onClick={()=>setSelRarity(r)} className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all" style={{border:`1px solid ${active?color:'rgba(255,255,255,0.06)'}`,background:active?`${color}18`:'rgba(255,255,255,0.02)',transform:active?'scale(1.04)':'scale(1)',boxShadow:active?`0 0 10px ${color}40`:'none'}}>
                  <span style={{color,fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:700,lineHeight:1}}>{MULT[r]}</span>
                  <span style={{color:active?color:'#334155',fontFamily:'Orbitron,monospace',fontSize:'7px'}}>{r.toUpperCase()}</span>
                </button>
              )})}
            </div>
          </div>
          {mintError&&<div className="rounded-xl p-3 flex items-start gap-2" style={{background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.25)'}}><span className="text-red-400 flex-shrink-0">✕</span><div><div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#f43f5e',marginBottom:4}}>MINT FAILED</div><div className="text-xs text-red-300 break-all">{mintError}</div></div></div>}
          {isSuccess&&<div className="rounded-xl p-3 flex items-center gap-3" style={{background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.25)'}}><span className="text-2xl">🎉</span><div><div style={{fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#4ade80',fontWeight:700}}>PLANET MINTED!</div><div className="text-xs text-slate-400 mt-0.5">Click ↻ Refresh in dashboard to see it</div></div></div>}
        </div>
        {/* Fixed bottom */}
        <div className="px-5 pb-5 pt-3 flex-shrink-0" style={{borderTop:'1px solid rgba(124,58,237,0.1)'}}>
          <button onClick={()=>onMint(selType,selRarity)} disabled={minting||isSuccess} className="w-full flex items-center justify-center gap-2 rounded-xl transition-all"
            style={{padding:'13px',fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,letterSpacing:'0.08em',color:'#fff',cursor:minting?'not-allowed':'pointer',background:isSuccess?'linear-gradient(135deg,#15803d,#14532d)':'linear-gradient(135deg,#7c3aed,#5b21b6,#0f9e8a)',border:'1px solid rgba(124,58,237,0.4)',opacity:minting?0.7:1,boxShadow:'0 0 30px rgba(124,58,237,0.3)'}}>
            {minting?<><svg className="animate-spin" width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="2" strokeDasharray="26" strokeDashoffset="13"/></svg>Minting on Solana...</>:isSuccess?'✓ Planet Minted!':'⬡ Mint Planet NFT'}
          </button>
          <p className="text-center text-xs text-slate-600 mt-2">Phantom will ask for approval · ~0.01 SOL rent deposit</p>
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </div>
  )
}
