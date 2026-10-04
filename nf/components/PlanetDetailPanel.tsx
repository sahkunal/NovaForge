'use client'
import {useState} from 'react'
import {Planet,PLANET_COLORS,RARITY_COLORS,MONSTER_NAMES,formatNumber} from '@/lib/types'
import {useColonize,useUncolonize,useClaimResources,useRepairPlanet} from '@/lib/hooks/useAnchorActions'
import {useLiveTicker} from '@/lib/hooks/useLiveTicker'
import PlanetCanvas from './PlanetCanvas'
import ActionButton from './ActionButton'
import UpgradeModal from './UpgradeModal'
import CombatModal from './CombatModal'
import ClaimPopup from './ClaimPopup'
import ListingModal from './ListingModal'
import AttackCountdown from './AttackCountdown'
import {useAttackTimer} from '@/lib/hooks/useAttackTimer'
import {X,Shield,Zap,Skull,Coins,FlaskConical,Swords,ShoppingBag,ArrowUpRight,Radio} from 'lucide-react'

interface Props{planet:Planet;onClose:()=>void;onRefetch?:()=>void}
type Tab='COMMAND'|'RESOURCES'|'DEFENSE'

export default function PlanetDetailPanel({planet,onClose,onRefetch}:Props){
 const [tab,setTab]=useState<Tab>('COMMAND')
 const [showUpgrade,setShowUpgrade]=useState(false)
 const [showListing,setShowListing]=useState(false)
 const [showCombat,setShowCombat]=useState(false)
 const [combatResult,setCombatResult]=useState<'win'|'lose'|null>(null)
 const [claimPopup,setClaimPopup]=useState<{iron:number;gold:number;uranium:number}|null>(null)
 const live=useLiveTicker(planet)
 const attack=useAttackTimer(planet)
 const underAttack=attack.isUnderAttack
 const {execute:colonize,status:cs}=useColonize()
 const {execute:uncolonize,status:us}=useUncolonize()
 const {execute:claim,status:cls}=useClaimResources()
 const {execute:repair,status:rs}=useRepairPlanet()
 const col=PLANET_COLORS[planet.planetType]
 const rc=RARITY_COLORS[planet.rarity]
 const resources=[
  ['IRON',live.iron,'#ffae45',Zap],
  ['GOLD',live.gold,'#55bfff',Coins],
  ['URANIUM',live.uranium,'#7dff8a',FlaskConical],
 ] as const
 const handleClaim=async()=>{
  if(underAttack){
   setCombatResult(planet.militaryPower>=planet.monsterPower*.7?'win':'lose')
   setShowCombat(true)
  }
  await claim(planet.publicKey)
  setClaimPopup({iron:live.pendingIron||0,gold:live.pendingGold||0,uranium:live.pendingUranium||0})
  setTimeout(()=>onRefetch?.(),1500)
 }
 return <>
  <aside className="nf-planet-panel">
   <div className="nf-panel-glow" style={{background:col.glow}}/>
   <header className="nf-panel-head">
    <div>
     <div className="nf-kicker">ORBITAL ASSET // SELECTED</div>
     <div className="nf-panel-title">{planet.planetType.toUpperCase()} WORLD</div>
     <div className="nf-panel-id">{planet.publicKey.slice(0,8)}…{planet.publicKey.slice(-8)}</div>
    </div>
    <button className="nf-icon-btn" onClick={onClose}><X size={16}/></button>
   </header>

   <div className="nf-panel-planet">
    <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={118} hasRing={planet.rarity==='Legendary'||planet.planetType==='Military'}/>
    <div className="nf-orbit-readout">
     <span>RARITY</span><b style={{color:rc}}>{planet.rarity}</b>
     <span>LEVEL</span><b>LV.{planet.level}</b>
     <span>POWER</span><b>{formatNumber(planet.power)}</b>
    </div>
   </div>

   <div className="nf-panel-threat" data-hot={underAttack}>
    <div><Radio size={13}/><span>{underAttack?'HOSTILE CONTACT':'ORBIT SECURE'}</span></div>
    <strong>{planet.threatLevel}%</strong>
   </div>

   <div className="nf-panel-tabs">
    {(['COMMAND','RESOURCES','DEFENSE'] as Tab[]).map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}
   </div>

   <div className="nf-panel-scroll">
    {tab==='COMMAND'&&<div className="nf-action-stack">
     {planet.inactive ? <>
      <div className="nf-danger-card"><Skull size={18}/><div><b>WORLD DISABLED</b><p>Core integrity breached. Production halted.</p></div></div>
      <ActionButton label="RESTORE PLANET CORE" loadingLabel="REPAIRING…" successLabel="CORE RESTORED" status={rs} onClick={async()=>{await repair(planet.publicKey);setTimeout(()=>onRefetch?.(),1500)}} variant="danger"/>
     </> : !planet.colonized ? <>
      <div className="nf-action-card green"><div className="nf-action-icon"><Radio/></div><div><b>COLONIZE WORLD</b><p>Activate resource production and open the command layer.</p></div></div>
      <ActionButton label="INITIALIZE COLONY" loadingLabel="COLONIZING…" successLabel="COLONY ONLINE" status={cs} onClick={async()=>{await colonize(planet.publicKey);setTimeout(()=>onRefetch?.(),1500)}} variant="teal"/>
      <button className="nf-outline-action" onClick={()=>setShowListing(true)}><ShoppingBag/> LIST DIRECTLY FOR SALE</button>
     </> : <>
      <div className={`nf-action-card ${underAttack?'danger':'cyan'}`}>
       <div className="nf-action-icon">{underAttack?<Swords/>:<Zap/>}</div>
       <div><b>{underAttack?'HOSTILE IN ORBIT':'YIELD AVAILABLE'}</b><p>{underAttack?`${MONSTER_NAMES[planet.planetType]} power ${formatNumber(planet.monsterPower)}. Engage before claiming.`:'Accrued resources are ready for on-chain settlement.'}</p></div>
      </div>
      {planet.colonized&&!planet.inactive&&<AttackCountdown planet={planet}/>} 
      <ActionButton label={underAttack?'ENGAGE + CLAIM YIELD':'CLAIM ON-CHAIN YIELD'} loadingLabel="EXECUTING…" successLabel="SETTLED" status={cls} onClick={handleClaim} variant={underAttack?'danger':'teal'}/>
      <button className="nf-outline-action" onClick={()=>setShowUpgrade(true)}><ArrowUpRight/> OPEN UPGRADE MATRIX</button>
      <div className="nf-divider"/>
      <div className="nf-sell-mini">
       <div><span>ASSET EXIT</span><b>Sell this world</b></div>
       <button onClick={async()=>{await uncolonize(planet.publicKey);setTimeout(()=>onRefetch?.(),1500)}} disabled={us==='pending'}>{us==='pending'?'…':'UNCOLONIZE'}</button>
       <button onClick={()=>setShowListing(true)}>LIST</button>
      </div>
     </>}
    </div>}

    {tab==='RESOURCES'&&<div className="nf-resource-stack">
     {resources.map(([name,v,c,I])=><div className="nf-resource-row" key={name} style={{'--accent':c} as React.CSSProperties}>
      <I size={15}/><div><span>{name}</span><b>{formatNumber(v)}</b></div><small>LIVE YIELD</small>
     </div>)}
     <div className="nf-production"><span>PRODUCTION RATE</span><strong>{formatNumber(planet.productionRate)} / SEC</strong></div>
    </div>}

    {tab==='DEFENSE'&&<div className="nf-defense-stack">
     <div className="nf-defense-score"><Shield/><div><span>DEFENSE RATING</span><strong>{formatNumber(planet.militaryPower)}</strong></div></div>
     <div className="nf-defense-meter"><span>CORE INTEGRITY</span><div><i style={{width:`${Math.min(100,Math.max(10,planet.militaryPower/Math.max(1,planet.monsterPower)*70))}%`}}/></div></div>
     <div className="nf-threat-card"><Skull/><div><span>CURRENT HOSTILE</span><b>{underAttack?MONSTER_NAMES[planet.planetType]:'NONE DETECTED'}</b></div></div>
     <button className="nf-danger-giant" onClick={()=>setShowUpgrade(true)}>REINFORCE DEFENSE</button>
    </div>}
   </div>
  </aside>

  {showUpgrade&&<UpgradeModal planet={planet} onClose={()=>setShowUpgrade(false)} onSuccess={()=>{setShowUpgrade(false);onRefetch?.()}}/>}
  {showListing&&<ListingModal planet={planet} onClose={()=>setShowListing(false)}/>} 
  {showCombat&&<CombatModal planet={planet} result={combatResult} onClose={()=>setShowCombat(false)} resourcesClaimed={claimPopup||undefined}/>} 
  {claimPopup&&<ClaimPopup {...claimPopup} onDone={()=>setClaimPopup(null)}/>} 
 </>
}
