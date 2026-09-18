'use client'
import{Planet,PLANET_COLORS,RARITY_COLORS,MONSTER_NAMES,MONSTER_EMOJIS,getThreatLevel,getThreatLabel,formatNumber}from '@/lib/types'
import{useLiveTicker}from '@/lib/hooks/useLiveTicker'
import PlanetCanvas from './PlanetCanvas'
import AttackCountdown from './AttackCountdown'
const pad=(n:number)=>String(Math.floor(n)).padStart(2,'0')
const fmtTimer=(s:number)=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=Math.floor(s%60);return`${pad(h)}:${pad(m)}:${pad(sc)}`}
interface Props{planet:Planet;onClick?:()=>void;selected?:boolean}
export default function PlanetCard({planet,onClick,selected}:Props){
  const live=useLiveTicker(planet),threat=getThreatLevel(live.threatLevel)
  const col=PLANET_COLORS[planet.planetType],rc=RARITY_COLORS[planet.rarity]
  const max=planet.productionRate*72*3600,hasRing=planet.rarity==='Legendary'||planet.planetType==='Military'
  const isLeg=planet.rarity==='Legendary',isAttack=planet.monsterPower>0
  const elapsed=Math.max(0,Date.now()/1000-planet.lastClaimTs)
  const tc={safe:'#4ade80',warn:'#fbbf24',danger:'#f97316',critical:'#f43f5e'}
  return(
    <div onClick={onClick} className={`relative planet-card cursor-pointer overflow-hidden rounded-2xl ${isLeg?'legendary-card':''} ${isAttack?'invasion-pulse':''}`}
      style={{border:`1px solid ${selected?'rgba(124,58,237,0.7)':isLeg?'rgba(251,191,36,0.45)':isAttack?'rgba(244,63,94,0.45)':'rgba(124,58,237,0.2)'}`,background:'rgba(8,6,22,0.92)',backdropFilter:'blur(20px)',boxShadow:selected?'0 0 40px rgba(124,58,237,0.5)':isLeg?'0 0 25px rgba(251,191,36,0.2)':isAttack?'0 0 25px rgba(244,63,94,0.25)':'none'}}>
      <div className="h-0.5 w-full" style={{background:`linear-gradient(to right,transparent,${col.primary},transparent)`}}/>
      {planet.inactive&&<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl" style={{background:'rgba(0,0,0,0.75)'}}><div style={{fontSize:'42px'}}>💀</div><span style={{fontFamily:'Orbitron,monospace',fontSize:'12px',color:'#f87171',letterSpacing:'0.1em'}}>PLANET INACTIVE</span><span className="text-xs text-slate-400">Repair to continue</span></div>}
      {isAttack&&!planet.inactive&&<div className="absolute top-0.5 left-0 right-0 flex items-center justify-center gap-2 py-1 z-10" style={{background:'rgba(244,63,94,0.12)'}}><span style={{fontSize:'12px'}}>{MONSTER_EMOJIS[planet.planetType]}</span><span style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#f43f5e',letterSpacing:'0.1em'}}>{MONSTER_NAMES[planet.planetType].toUpperCase()} ATTACKING!</span></div>}
      <div style={{padding:isAttack?'28px 14px 14px':'12px 14px 14px'}}>
        <div className="flex items-start gap-3 mb-3">
          <div className="relative flex-shrink-0">
            <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={56} hasRing={hasRing}/>
            {planet.colonized&&!planet.inactive&&<div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 bg-green-400" style={{borderColor:'rgba(8,6,22,0.9)',boxShadow:'0 0 8px rgba(74,222,128,0.8)',animation:'pulse 2s infinite'}}/>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1.5">
              <span className="badge" style={{color:col.primary,background:`${col.glow}22`,borderColor:`${col.primary}50`,fontSize:'9px',fontWeight:700}}>{planet.planetType.toUpperCase()}</span>
              <span className="badge" style={{color:rc,background:`${rc}18`,borderColor:`${rc}45`,fontSize:'9px'}}>{planet.rarity}</span>
              <span className="badge badge-gray" style={{fontSize:'9px'}}>Lv {planet.level}</span>
            </div>
            <div className="text-xs text-slate-500 font-mono mb-1">{planet.publicKey.slice(0,13)}...</div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">PWR <span className="text-white font-semibold font-mono">{formatNumber(planet.power)}</span></span>
              {planet.militaryPower>0&&<span className="text-xs text-red-400 font-mono">⚔️{formatNumber(planet.militaryPower)}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <AttackCountdown planet={planet} compact={true}/>
          <span className="text-xs text-slate-600 font-mono flex-shrink-0">{planet.monstersKilled} kills</span>
        </div>
        {planet.colonized&&!planet.inactive?(
          <div className="rounded-xl p-3 mb-2" style={{background:'rgba(124,58,237,0.07)',border:'1px solid rgba(124,58,237,0.15)'}}>
            <div className="flex justify-between items-center mb-2">
              <span style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#6d28d9',letterSpacing:'0.12em'}}>RESOURCES</span>
              <span className="text-xs text-green-400 font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"/>LIVE</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[{i:'⚡',v:live.iron,c:'#f59e0b'},{i:'💧',v:live.gold,c:'#60a5fa'},{i:'☢️',v:live.uranium,c:'#4ade80'}].map(({i,v,c},idx)=>(
                <div key={idx} className="text-center"><div style={{fontSize:'14px',marginBottom:2}}>{i}</div><div style={{color:c,fontFamily:'JetBrains Mono,monospace',fontSize:'12px',fontWeight:700}}>{formatNumber(Math.floor(v))}</div></div>
              ))}
            </div>
            <div className="text-center">
              <div className="res-timer">{fmtTimer(elapsed)}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#475569',letterSpacing:'0.2em',marginTop:2}}>GROWING...</div>
            </div>
          </div>
        ):(
          <div className="space-y-1.5 mb-3">
            {[{l:'Fe',v:live.iron,c:'#f59e0b'},{l:'Au',v:live.gold,c:'#60a5fa'},{l:'U',v:live.uranium,c:'#4ade80'}].map(({l,v,c})=>(
              <div key={l} className="flex items-center gap-2"><span className="text-xs w-4 font-mono" style={{color:c}}>{l}</span><div className="flex-1 resource-bar"><div className="resource-fill" style={{width:`${Math.min((v/Math.max(max,1))*100,100)}%`,background:c}}/></div><span className="text-xs text-slate-400 font-mono w-12 text-right">{formatNumber(Math.floor(v))}</span></div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 flex-wrap">
          {planet.listed&&<span className="badge badge-amber" style={{fontSize:'8px'}}>For Sale</span>}
          {planet.productionBoost>0&&<span className="badge badge-green" style={{fontSize:'8px'}}>+{planet.productionBoost}% Boost</span>}
          {threat==='critical'&&<span className="badge badge-red animate-pulse" style={{fontSize:'8px'}}>⚠ CRITICAL</span>}
          {!planet.colonized&&!planet.inactive&&<span className="badge badge-gray" style={{fontSize:'8px'}}>Not Colonized</span>}
        </div>
      </div>
      <div className="h-0.5 w-full" style={{background:`linear-gradient(to right,transparent,${col.primary}50,transparent)`}}/>
    </div>
  )
}