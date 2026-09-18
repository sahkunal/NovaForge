'use client'
import{useState}from 'react'
import{Planet,PLANET_COLORS,RARITY_COLORS,MONSTER_NAMES,MONSTER_EMOJIS,getThreatLevel,getThreatLabel,formatNumber}from '@/lib/types'
import{useColonize,useUncolonize,useClaimResources,useRepairPlanet}from '@/lib/hooks/useAnchorActions'
import{useLiveTicker}from '@/lib/hooks/useLiveTicker'
import PlanetCanvas from './PlanetCanvas'
import ActionButton from './ActionButton'
import UpgradeModal from './UpgradeModal'
import CombatModal from './CombatModal'
import ClaimPopup from './ClaimPopup'
import ListingModal from './ListingModal'
import{X,Shield,Users,Star,Zap}from 'lucide-react'
import{sounds}from '@/lib/utils/sounds'
import AttackCountdown from './AttackCountdown'
interface Props{planet:Planet;onClose:()=>void;onRefetch?:()=>void}
const TABS=['Resources','Population','Military'] as const
type Tab=typeof TABS[number]
export default function PlanetDetailPanel({planet,onClose,onRefetch}:Props){
  const[tab,setTab]=useState<Tab>('Resources')
  const[showUpgrade,setShowUpgrade]=useState(false),[showListing,setShowListing]=useState(false)
  const[showCombat,setShowCombat]=useState(false),[combatResult,setCombatResult]=useState<'win'|'lose'|null>(null)
  const[claimPopup,setClaimPopup]=useState<{iron:number;gold:number;uranium:number}|null>(null)
  const live=useLiveTicker(planet)
  const{execute:colonize,status:cs}=useColonize()
  const{execute:uncolonize,status:us}=useUncolonize()
  const{execute:claim,status:cls}=useClaimResources()
  const{execute:repair,status:rs}=useRepairPlanet()
  const col=PLANET_COLORS[planet.planetType],rc=RARITY_COLORS[planet.rarity]
  const max=planet.productionRate*72*3600,hasRing=planet.rarity==='Legendary'||planet.planetType==='Military'
  const threat=getThreatLevel(live.threatLevel),tc={safe:'#4ade80',warn:'#fbbf24',danger:'#f97316',critical:'#f43f5e'}
  const handleClaim=async()=>{ sounds.alert();
    if(planet.monsterPower>0){setCombatResult(planet.militaryPower>=planet.monsterPower*0.7?'win':'lose');setShowCombat(true)}
    await claim(planet.publicKey)
    setClaimPopup({iron:live.pendingIron||0,gold:live.pendingGold||0,uranium:live.pendingUranium||0})
    onRefetch?.()
  }
  const resources=[
    {label:'Iron',icon:'⚡',value:live.iron,color:'#f59e0b',rate:planet.planetType==='Mining'?planet.productionRate*1.5:planet.productionRate},
    {label:'Gold',icon:'💧',value:live.gold,color:'#60a5fa',rate:planet.planetType==='Luxury'?planet.productionRate*1.5:planet.productionRate},
    {label:'Uranium',icon:'☢️',value:live.uranium,color:'#4ade80',rate:(planet.planetType==='Energy'||planet.planetType==='Research')?planet.productionRate*1.5:planet.productionRate},
  ]
  return(
    <>
      <div className="flex flex-col h-full" style={{width:286}}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'rgba(124,58,237,0.2)'}}>
          <div><div className="flex gap-1 flex-wrap mb-1"><span className="badge" style={{color:col.primary,background:`${col.glow}22`,borderColor:`${col.primary}50`}}>{planet.planetType}</span><span className="badge" style={{color:rc,background:`${rc}18`,borderColor:`${rc}45`}}>{planet.rarity}</span><span className="badge badge-purple">Lv {planet.level}</span></div><div className="text-xs text-slate-500 font-mono">{planet.publicKey.slice(0,16)}...</div></div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"><X size={16}/></button>
        </div>
        <div className="relative flex items-center justify-center py-5 border-b" style={{borderColor:'rgba(124,58,237,0.12)',background:'radial-gradient(ellipse at center,rgba(124,58,237,0.1) 0%,transparent 70%)'}}>
          <div className="absolute w-32 h-32 rounded-full border border-purple-500/10 animate-spin-slow pointer-events-none"/>
          <div style={{animation:'float 5s ease-in-out infinite',position:'relative',zIndex:1}}><PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={88} hasRing={hasRing}/></div>
          {planet.colonized&&!planet.inactive&&<div className="absolute bottom-2 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/><span style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#4ade80',letterSpacing:'0.1em'}}>ACTIVE</span></div>}
          <div className="absolute top-2 right-4 text-right"><span className="text-xs text-slate-500 font-mono block">PWR <span className="text-white">{formatNumber(planet.power)}</span></span><span className="text-xs text-slate-500 font-mono block">KILLS <span className="text-green-400">{planet.monstersKilled}</span></span></div>
        </div>
        <div className="px-4 pt-3"><AttackCountdown planet={planet}/></div>
        <div className="flex border-b" style={{borderColor:'rgba(124,58,237,0.15)'}}>
          {TABS.map(tb=><button key={tb} onClick={()=>setTab(tb)} className={`flex-1 py-2.5 transition-all ${tab===tb?'text-purple-400 border-b-2 border-purple-500':'text-slate-500 hover:text-slate-300'}`} style={{fontFamily:'Orbitron,monospace',fontSize:'8px',letterSpacing:'0.04em'}}>{tb}</button>)}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab==='Resources'&&<>
            <div className="space-y-3">
              {resources.map(({label,icon,value,color,rate})=>(
                <div key={label}><div className="flex justify-between items-center mb-1.5"><span className="text-xs font-mono flex items-center gap-1.5" style={{color}}><span style={{fontSize:'13px'}}>{icon}</span>{label}</span><span className="text-xs text-slate-400 font-mono">{formatNumber(Math.floor(value))}/{formatNumber(max)}</span></div><div className="resource-bar h-2 rounded-full"><div className="resource-fill rounded-full" style={{width:`${Math.min((value/Math.max(max,1))*100,100)}%`,background:`linear-gradient(to right,${color}77,${color})`}}/></div><div className="flex justify-between mt-1"><span className="text-xs text-slate-600 font-mono">{rate.toFixed(1)}/s</span>{planet.colonized&&!planet.inactive&&<span className="text-xs font-mono animate-pulse" style={{color,fontSize:'9px'}}>+{rate.toFixed(1)}/s</span>}</div></div>
              ))}
            </div>
            {planet.productionBoost>0&&<div className="rounded-xl p-2 flex items-center gap-2" style={{background:'rgba(15,158,138,0.1)',border:'1px solid rgba(15,158,138,0.2)'}}><Zap size={13} className="text-teal-400"/><span className="text-xs text-teal-300">+{planet.productionBoost}% Kill Bonus Active</span></div>}
          </>}
          {tab==='Population'&&<div className="space-y-2">
            {[{label:'Population',value:planet.population,icon:<Users size={13} className="text-purple-400"/>},{label:'Researchers',value:planet.researchers,icon:<Star size={13} className="text-teal-400"/>}].map(({label,value,icon})=>(
              <div key={label} className="flex items-center justify-between py-2 border-b" style={{borderColor:'rgba(124,58,237,0.1)'}}><span className="flex items-center gap-2 text-xs text-slate-400">{icon}{label}</span><span className="text-sm text-white font-mono font-semibold">{formatNumber(Number(value))}</span></div>
            ))}
          </div>}
          {tab==='Military'&&<div className="space-y-2">
            {[{label:'Military Power',value:planet.militaryPower,color:'#a78bfa'},{label:'Defense Score',value:planet.militaryPower+planet.level*20,color:'#5eead4'},{label:'Monsters Killed',value:planet.monstersKilled,color:'#4ade80'}].map(({label,value,color})=>(
              <div key={label} className="flex items-center justify-between py-2 border-b" style={{borderColor:'rgba(124,58,237,0.1)'}}><span className="flex items-center gap-2 text-xs text-slate-400"><Shield size={13} className="text-purple-400"/>{label}</span><span className="text-sm font-mono font-semibold" style={{color}}>{formatNumber(value)}</span></div>
            ))}
            <div className="flex items-center justify-between py-2 border-b" style={{borderColor:'rgba(124,58,237,0.1)'}}><span className="text-xs text-slate-400">Monster</span><span className="text-xs font-mono" style={{color:'#f97316'}}>{MONSTER_EMOJIS[planet.planetType]} {MONSTER_NAMES[planet.planetType]}</span></div>
            {planet.monsterPower>0&&<div className="rounded-xl p-3 border" style={{background:'rgba(244,63,94,0.07)',borderColor:'rgba(244,63,94,0.25)'}}><div className="text-xs text-red-400 mb-2" style={{fontFamily:'Orbitron,monospace',fontSize:'9px'}}>⚔️ UNDER ATTACK</div><div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-slate-400">Your Defense</span><span className="text-purple-300">{planet.militaryPower}</span></div><div className="flex justify-between text-xs"><span className="text-slate-400">Monster Power</span><span className="text-red-300">{planet.monsterPower}</span></div><div className="flex justify-between text-xs"><span className="text-slate-400">Outcome</span><span style={{color:planet.militaryPower>=planet.monsterPower*0.7?'#4ade80':'#f43f5e'}}>{planet.militaryPower>=planet.monsterPower*0.7?'✓ WIN':'✗ LOSE'}</span></div></div></div>}
          </div>}
        </div>
        <div className="p-4 border-t space-y-2" style={{borderColor:'rgba(124,58,237,0.15)'}}>
          {planet.inactive?(
            <ActionButton label="🔧 Repair Planet" loadingLabel="Repairing..." successLabel="✓ Repaired!" status={rs} onClick={async()=>{await repair(planet.publicKey);onRefetch?.()}} variant="danger"/>
          ):(
            <>
              <ActionButton label={planet.monsterPower>0?'⚔️ BATTLE & CLAIM':'⚡ Claim Resources'} loadingLabel="Processing tx..." successLabel="✓ Done!" status={cls} onClick={handleClaim} disabled={!planet.colonized} variant={planet.monsterPower>0?'danger':'teal'}/>
              <button onClick={()=>setShowUpgrade(true)} className="btn-primary w-full" style={{padding:'9px'}}>▲ Upgrade Planet / Military</button>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton 
                label={planet.colonized?'⬛ Uncolonize':'🌐 Colonize'} 
                loadingLabel={planet.colonized?'Uncolonizing...':'Colonizing...'} 
                successLabel="✓ Done!" 
                status={planet.colonized?us:cs} 
                onClick={async()=>{
                  if(planet.colonized){
                    await uncolonize(planet.publicKey)
                  } else {
                    sounds.colonize()
                    await colonize(planet.publicKey)
                  }
                  setTimeout(()=>onRefetch?.(), 1500)
                }} 
                variant="ghost"
              />
                <button onClick={()=>!planet.colonized&&setShowListing(true)} className={`btn-ghost ${planet.colonized?'btn-disabled':''}`} style={{fontSize:'10px'}}>{planet.listed?'✕ Cancel':'🏪 List for Sale'}</button>
              </div>
            </>
          )}
        </div>
      </div>
      {showUpgrade&&<UpgradeModal planet={planet} onClose={()=>setShowUpgrade(false)} onSuccess={onRefetch}/>}
      {showListing&&<ListingModal planet={planet} onClose={()=>setShowListing(false)}/>}
      {showCombat&&<CombatModal planet={planet} result={combatResult} onClose={()=>setShowCombat(false)} resourcesClaimed={claimPopup||undefined}/>}
      {claimPopup&&!showCombat&&<ClaimPopup iron={claimPopup.iron} gold={claimPopup.gold} uranium={claimPopup.uranium} onDone={()=>setClaimPopup(null)}/>}
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  )
}