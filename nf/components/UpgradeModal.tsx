'use client'
import{Planet,PLANET_COLORS,formatNumber}from '@/lib/types'
import{useUpgradePlanet,useUpgradeMilitary}from '@/lib/hooks/useAnchorActions'
import ActionButton from './ActionButton'
import{X,AlertCircle}from 'lucide-react'
interface Props{planet:Planet;onClose:()=>void;onSuccess?:()=>void}
export default function UpgradeModal({planet,onClose,onSuccess}:Props){
  const{execute:upgP,status:ps,error:pe}=useUpgradePlanet()
  const{execute:upgM,status:ms,error:me}=useUpgradeMilitary()
  const col=PLANET_COLORS[planet.planetType],disc=planet.planetType==='Research'?0.9:1
  const pc=[{label:'Iron',cost:Math.floor(100*planet.level*disc),has:planet.ironBalance,color:'#f59e0b'},{label:'Gold',cost:Math.floor(20*planet.level*disc),has:planet.goldBalance,color:'#60a5fa'},{label:'Uranium',cost:Math.floor(10*planet.level*disc),has:planet.uraniumBalance,color:'#4ade80'}]
  const mc=[{label:'Iron',cost:80,has:planet.ironBalance,color:'#f59e0b'},{label:'Gold',cost:40,has:planet.goldBalance,color:'#60a5fa'},{label:'Uranium',cost:25,has:planet.uraniumBalance,color:'#4ade80'}]
  const canP=pc.every(c=>c.has>=c.cost)&&planet.level<10&&planet.colonized
  const canM=mc.every(c=>c.has>=c.cost)&&planet.colonized
  const Costs=({costs}:{costs:typeof pc})=><div className="space-y-1.5">{costs.map(({label,cost,has,color})=><div key={label} className="flex justify-between text-xs"><span style={{color}}>{label}</span><div className="flex items-center gap-2"><span className={has>=cost?'text-green-400':'text-red-400'}>{formatNumber(has)}</span><span className="text-slate-600">/</span><span className="text-white font-semibold">{formatNumber(cost)}</span><span>{has>=cost?'✓':'✗'}</span></div></div>)}</div>
  const Err=({err}:{err:string|null})=>err?<div className="rounded-lg p-2 mt-2 flex items-start gap-2" style={{background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.25)'}}><AlertCircle size={11} className="text-red-400 flex-shrink-0 mt-0.5"/><span className="text-xs text-red-300 break-all">{err.slice(0,150)}</span></div>:null
  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(3,2,15,0.9)',backdropFilter:'blur(14px)'}}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{background:'rgba(8,6,22,0.98)',border:'1px solid rgba(124,58,237,0.3)',boxShadow:'0 0 60px rgba(124,58,237,0.2)'}}>
        <div className="h-0.5" style={{background:`linear-gradient(to right,transparent,${col.primary},transparent)`}}/>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:'rgba(124,58,237,0.18)'}}><h2 style={{fontFamily:'Orbitron,monospace',fontSize:'14px',fontWeight:700,color:'#e2e8f0',letterSpacing:'0.1em'}}>▲ UPGRADES</h2><button onClick={onClose}><X size={17} className="text-slate-500 hover:text-white transition-colors"/></button></div>
        <div className="p-5 space-y-4">
          {!planet.colonized&&<div className="rounded-xl p-3 flex items-center gap-2" style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)'}}><AlertCircle size={14} className="text-amber-400 flex-shrink-0"/><span className="text-xs text-amber-300">Planet must be colonized to upgrade</span></div>}
          <div className="rounded-xl p-4" style={{border:`1px solid ${col.primary}28`,background:`${col.glow}0a`}}>
            <div className="flex justify-between items-center mb-3"><div><div style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:col.primary,fontWeight:700}}>PLANET Lv{planet.level} → Lv{planet.level+1}</div><div className="text-xs text-slate-400 mt-0.5">+Production · +Power · +Population</div></div>{planet.planetType==='Research'&&<span className="badge badge-teal" style={{fontSize:'8px'}}>-10% COST</span>}</div>
            <Costs costs={pc}/><Err err={pe}/>
            <div className="mt-3"><ActionButton label={planet.level>=10?'MAX LEVEL':'▲ Upgrade Planet'} loadingLabel="Upgrading..." successLabel="✓ Upgraded!" status={ps} onClick={async()=>{await upgP(planet.publicKey);onSuccess?.()}} disabled={!canP}/></div>
          </div>
          <div className="rounded-xl p-4" style={{border:'1px solid rgba(244,63,94,0.2)',background:'rgba(244,63,94,0.05)'}}>
            <div className="mb-3"><div style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#fb7185',fontWeight:700}}>MILITARY POWER +25</div><div className="text-xs text-slate-400 mt-0.5">Increases defense · reduces monster loot</div></div>
            <Costs costs={mc}/><Err err={me}/>
            <div className="mt-3"><ActionButton label="⚔️ Upgrade Military" loadingLabel="Training..." successLabel="✓ Strengthened!" status={ms} onClick={async()=>{await upgM(planet.publicKey);onSuccess?.()}} disabled={!canM} variant="danger"/></div>
          </div>
        </div>
      </div>
    </div>
  )
}
