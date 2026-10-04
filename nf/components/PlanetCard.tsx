'use client'
import{Planet,PLANET_COLORS,RARITY_COLORS,formatNumber}from'@/lib/types'
import{useLiveTicker}from'@/lib/hooks/useLiveTicker'
import PlanetCanvas from'./PlanetCanvas'
import AttackCountdown from'./AttackCountdown'
interface Props{planet:Planet;selected?:boolean;onClick?:()=>void}
export default function PlanetCard({planet,selected,onClick}:Props){
  const live=useLiveTicker(planet)
  const col=PLANET_COLORS[planet.planetType],rc=RARITY_COLORS[planet.rarity]
  const hasRing=planet.rarity==='Legendary'||planet.planetType==='Military'
  const elapsed=Math.max(0,Date.now()/1000-planet.lastClaimTs)
  const fmt=(n:number)=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toString()
  const fmtTime=(s:number)=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=Math.floor(s%60);return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`}
  return(
    <div onClick={onClick} className={`planet-card relative rounded-2xl overflow-hidden cursor-pointer ${planet.rarity==='Legendary'?'legendary-card':''}`}
      style={{background:'rgba(8,6,22,0.92)',border:`1px solid ${selected?col.primary:planet.inactive?'rgba(244,63,94,0.3)':planet.colonized?`${col.primary}40`:'rgba(124,58,237,0.15)'}`,boxShadow:selected?`0 0 30px ${col.glow},0 0 80px ${col.glow}40`:planet.inactive?'0 0 20px rgba(244,63,94,0.15)':'none',transition:'all 0.3s ease'}}>
      {/* Rarity bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{background:`linear-gradient(to right,transparent,${rc},transparent)`}}/>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div style={{flexShrink:0,filter:`drop-shadow(0 0 8px ${col.glow})`}}>
            <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={52} hasRing={hasRing}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-1 flex-wrap mb-1">
              <span className="badge" style={{color:col.primary,background:`${col.glow}18`,borderColor:`${col.primary}40`,fontSize:'8px'}}>{planet.planetType}</span>
              <span className="badge" style={{color:rc,background:`${rc}18`,borderColor:`${rc}40`,fontSize:'8px'}}>{planet.rarity}</span>
              <span className="badge badge-purple" style={{fontSize:'8px'}}>Lv{planet.level}</span>
            </div>
            <div className="text-xs text-slate-600 font-mono truncate">{planet.publicKey.slice(0,14)}...</div>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-slate-500 font-mono">PWR <span className="text-slate-300">{fmt(planet.power)}</span></span>
              <span className="text-xs text-slate-500 font-mono">MIL <span className="text-purple-300">{fmt(planet.militaryPower)}</span></span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {planet.inactive&&<span className="badge badge-red" style={{fontSize:'8px'}}>💀 INACTIVE</span>}
            {planet.listed&&<span className="badge badge-amber" style={{fontSize:'8px'}}>🏪 LISTED</span>}
            {!planet.colonized&&!planet.inactive&&<span className="badge badge-gray" style={{fontSize:'8px'}}>UNCOLONIZED</span>}
            {planet.colonized&&!planet.inactive&&<span className="badge badge-green" style={{fontSize:'8px'}}>● ACTIVE</span>}
            {planet.productionBoost>0&&<span className="badge badge-teal" style={{fontSize:'8px'}}>⚡+{planet.productionBoost}%</span>}
          </div>
        </div>
        {/* Resources */}
        {planet.colonized&&!planet.inactive?(
          <>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[{i:'⚡',v:live.iron,c:'#f59e0b'},{i:'💧',v:live.gold,c:'#60a5fa'},{i:'☢️',v:live.uranium,c:'#4ade80'}].map(({i,v,c})=>(
                <div key={i} className="rounded-lg px-2 py-1.5 text-center" style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${c}18`}}>
                  <div style={{fontSize:'11px'}}>{i}</div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'11px',fontWeight:600,color:c,lineHeight:1.2}}>{fmt(v)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'10px',color:'#4ade80'}}>{fmtTime(elapsed)}</span>
              </div>
              <span className="text-xs text-slate-600 font-mono">{planet.monstersKilled} kills</span>
            </div>
            <AttackCountdown planet={planet} compact/>
          </>
        ):(
          <div className="text-center py-3">
            {planet.inactive?(
              <div className="text-xs text-red-400" style={{fontFamily:'Orbitron,monospace',fontSize:'9px',letterSpacing:'0.1em'}}>REPAIR NEEDED</div>
            ):(
              <div className="text-xs text-slate-600" style={{fontFamily:'Orbitron,monospace',fontSize:'9px',letterSpacing:'0.1em'}}>→ CLICK TO COLONIZE</div>
            )}
          </div>
        )}
      </div>
      <div className="px-4 pb-3 flex items-center justify-between">
        <span style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#1e293b',letterSpacing:'0.05em'}}>Click to manage →</span>
        {planet.monsterPower>0&&<span className="badge badge-red animate-pulse" style={{fontSize:'8px'}}>⚔️ UNDER ATTACK</span>}
      </div>
    </div>
  )
}
