'use client'
import { useState } from 'react'
import { Planet, PLANET_COLORS, RARITY_COLORS, MONSTER_NAMES, MONSTER_EMOJIS, getThreatLevel, getThreatLabel, formatNumber } from '@/lib/types'
import { useColonize, useUncolonize, useClaimResources, useRepairPlanet } from '@/lib/hooks/useAnchorActions'
import { useLiveTicker } from '@/lib/hooks/useLiveTicker'
import PlanetCanvas from './PlanetCanvas'
import ActionButton from './ActionButton'
import UpgradeModal from './UpgradeModal'
import CombatModal from './CombatModal'
import ClaimPopup from './ClaimPopup'
import ListingModal from './ListingModal'
import AttackCountdown from './AttackCountdown'
import { X, Shield, Users, Star, Zap } from 'lucide-react'

interface Props { planet: Planet; onClose: () => void; onRefetch?: () => void }
const TABS = ['Actions', 'Resources', 'Military'] as const
type Tab = typeof TABS[number]

export default function PlanetDetailPanel({ planet, onClose, onRefetch }: Props) {
  const [tab, setTab] = useState<Tab>('Actions')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showListing, setShowListing] = useState(false)
  const [showCombat, setShowCombat] = useState(false)
  const [combatResult, setCombatResult] = useState<'win'|'lose'|null>(null)
  const [claimPopup, setClaimPopup] = useState<{iron:number;gold:number;uranium:number}|null>(null)

  const live = useLiveTicker(planet)
  const { execute: colonize,   status: cs } = useColonize()
  const { execute: uncolonize, status: us } = useUncolonize()
  const { execute: claim,      status: cls } = useClaimResources()
  const { execute: repair,     status: rs } = useRepairPlanet()

  const col = PLANET_COLORS[planet.planetType]
  const rc  = RARITY_COLORS[planet.rarity]
  const max = planet.productionRate * 72 * 3600
  const hasRing = planet.rarity === 'Legendary' || planet.planetType === 'Military'

  const handleClaim = async () => {
    if (planet.monsterPower > 0) {
      setCombatResult(planet.militaryPower >= planet.monsterPower * 0.7 ? 'win' : 'lose')
      setShowCombat(true)
    }
    await claim(planet.publicKey)
    setClaimPopup({ iron: live.pendingIron || 0, gold: live.pendingGold || 0, uranium: live.pendingUranium || 0 })
    setTimeout(() => onRefetch?.(), 1500)
  }

  const resources = [
    { label:'Iron',    icon:'⚡', value:live.iron,    color:'#f59e0b', rate:planet.planetType==='Mining'?planet.productionRate*1.5:planet.productionRate },
    { label:'Gold',    icon:'💧', value:live.gold,    color:'#60a5fa', rate:planet.planetType==='Luxury'?planet.productionRate*1.5:planet.productionRate },
    { label:'Uranium', icon:'☢️', value:live.uranium, color:'#4ade80', rate:(planet.planetType==='Energy'||planet.planetType==='Research')?planet.productionRate*1.5:planet.productionRate },
  ]

  return (
    <>
      <div className="flex flex-col h-full" style={{ width: 286 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor:'rgba(124,58,237,0.2)' }}>
          <div>
            <div className="flex gap-1 flex-wrap mb-1">
              <span className="badge" style={{ color:col.primary, background:`${col.glow}22`, borderColor:`${col.primary}50` }}>{planet.planetType}</span>
              <span className="badge" style={{ color:rc, background:`${rc}18`, borderColor:`${rc}45` }}>{planet.rarity}</span>
              <span className="badge badge-purple">Lv {planet.level}</span>
            </div>
            <div className="text-xs text-slate-500 font-mono">{planet.publicKey.slice(0,16)}...</div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"><X size={16}/></button>
        </div>

        {/* 3D Planet */}
        <div className="relative flex items-center justify-center py-5 border-b" style={{ borderColor:'rgba(124,58,237,0.12)', background:'radial-gradient(ellipse at center,rgba(124,58,237,0.1) 0%,transparent 70%)' }}>
          <div style={{ animation:'float 5s ease-in-out infinite', position:'relative', zIndex:1 }}>
            <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={88} hasRing={hasRing}/>
          </div>
          {planet.colonized && !planet.inactive && (
            <div className="absolute bottom-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', color:'#4ade80', letterSpacing:'0.1em' }}>ACTIVE</span>
            </div>
          )}
          <div className="absolute top-2 right-4 text-right">
            <span className="text-xs text-slate-500 font-mono block">PWR <span className="text-white">{formatNumber(planet.power)}</span></span>
            <span className="text-xs text-slate-500 font-mono block">KILLS <span className="text-green-400">{planet.monstersKilled}</span></span>
          </div>
        </div>

        {/* Attack countdown */}
        {planet.colonized && !planet.inactive && (
          <div className="px-4 pt-3"><AttackCountdown planet={planet}/></div>
        )}

        {/* Tabs */}
        <div className="flex border-b mt-2" style={{ borderColor:'rgba(124,58,237,0.15)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 transition-all ${tab===t?'text-purple-400 border-b-2 border-purple-500':'text-slate-500 hover:text-slate-300'}`}
              style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', letterSpacing:'0.04em' }}>{t}</button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* ===== ACTIONS TAB ===== */}
          {tab === 'Actions' && (
            <>
              {planet.inactive ? (
                <div className="space-y-3">
                  {/* Inactive state */}
                  <div className="rounded-xl p-4 text-center" style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.25)' }}>
                    <div style={{ fontSize:'32px', marginBottom:8 }}>💀</div>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', color:'#f43f5e', marginBottom:6 }}>PLANET INACTIVE</div>
                    <div className="text-xs text-slate-400">A monster defeated your planet. Spend resources to repair it and resume production.</div>
                  </div>
                  <ActionButton label="🔧 Repair Planet" loadingLabel="Repairing..." successLabel="✓ Repaired!" status={rs}
                    onClick={async()=>{ await repair(planet.publicKey); setTimeout(()=>onRefetch?.(),1500) }} variant="danger"/>
                </div>
              ) : !planet.colonized ? (
                <div className="space-y-3">
                  {/* Not colonized — show full flow */}
                  <div className="rounded-xl p-4" style={{ background:'rgba(74,222,128,0.06)', border:'1px solid rgba(74,222,128,0.2)' }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'10px', color:'#4ade80', marginBottom:8 }}>STEP 1 — COLONIZE</div>
                    <div className="text-xs text-slate-400 mb-3">Start generating Iron, Gold &amp; Uranium every second. Resources accumulate until you claim them.</div>
                    <ActionButton label="🌐 Colonize Planet" loadingLabel="Colonizing..." successLabel="✓ Colonized!"
                      status={cs} onClick={async()=>{ await colonize(planet.publicKey); setTimeout(()=>onRefetch?.(),1500) }} variant="teal"/>
                  </div>

                  {/* Or list for sale */}
                  <div className="rounded-xl p-4" style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)' }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'10px', color:'#fbbf24', marginBottom:8 }}>OR — SELL ON MARKETPLACE</div>
                    <div className="text-xs text-slate-400 mb-3">List this planet for SOL. Other players can buy it. NFT transfers on-chain when sold.</div>
                    <button onClick={() => setShowListing(true)}
                      className="w-full rounded-xl py-2.5 text-xs font-bold transition-all hover:scale-[1.02]"
                      style={{ background:'linear-gradient(135deg,#b45309,#92400e)', border:'1px solid rgba(251,191,36,0.3)', color:'#fff', fontFamily:'Orbitron,monospace', fontSize:'10px', letterSpacing:'0.06em', cursor:'pointer' }}>
                      🏪 List for Sale
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Colonized — main actions */}

                  {/* Claim */}
                  <div className="rounded-xl p-4" style={{ background: planet.monsterPower>0?'rgba(244,63,94,0.08)':'rgba(94,234,212,0.06)', border: planet.monsterPower>0?'1px solid rgba(244,63,94,0.3)':'1px solid rgba(94,234,212,0.2)' }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'10px', color: planet.monsterPower>0?'#f43f5e':'#5eead4', marginBottom:6 }}>
                      {planet.monsterPower>0 ? '⚔️ MONSTER ATTACKING — CLAIM TO FIGHT' : '⚡ CLAIM RESOURCES'}
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      {planet.monsterPower>0
                        ? `Monster power: ${planet.monsterPower} vs your military: ${planet.militaryPower}. ${planet.militaryPower>=planet.monsterPower*0.7?'✅ You should WIN':'⚠️ Upgrade military first!'}`
                        : 'Transfer accumulated resources on-chain. Resets the threat timer.'}
                    </div>
                    <ActionButton
                      label={planet.monsterPower>0 ? '⚔️ BATTLE & CLAIM' : '⚡ Claim Resources'}
                      loadingLabel="Processing tx..." successLabel="✓ Done!"
                      status={cls} onClick={handleClaim}
                      variant={planet.monsterPower>0 ? 'danger' : 'teal'}/>
                  </div>

                  {/* Upgrade */}
                  <div className="rounded-xl p-4" style={{ background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.2)' }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'10px', color:'#a78bfa', marginBottom:6 }}>▲ UPGRADE</div>
                    <div className="text-xs text-slate-400 mb-3">Spend resources to increase production speed (Planet) or survive monster attacks (Military).</div>
                    <button onClick={() => setShowUpgrade(true)}
                      className="btn-primary w-full" style={{ padding:'9px', fontSize:'10px' }}>
                      ▲ Upgrade Planet / Military
                    </button>
                  </div>

                  {/* Uncolonize → then list */}
                  <div className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontFamily:'Orbitron,monospace', fontSize:'10px', color:'#475569', marginBottom:6 }}>🏪 WANT TO SELL THIS PLANET?</div>
                    <div className="text-xs text-slate-400 mb-3">You must uncolonize first, then list it on the marketplace for SOL.</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-slate-600 mb-1 text-center" style={{ fontFamily:'Orbitron,monospace', fontSize:'8px' }}>STEP 1</div>
                        <ActionButton label="⬛ Uncolonize" loadingLabel="..." successLabel="✓ Done!"
                          status={us}
                          onClick={async()=>{ await uncolonize(planet.publicKey); setTimeout(()=>onRefetch?.(),1500) }}
                          variant="ghost"/>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 mb-1 text-center" style={{ fontFamily:'Orbitron,monospace', fontSize:'8px' }}>STEP 2</div>
                        <button disabled
                          className="btn-ghost w-full btn-disabled text-xs" style={{ fontSize:'10px' }}>
                          🏪 List for Sale
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 mt-2 text-center">After uncolonizing, refresh — then List for Sale becomes available</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== RESOURCES TAB ===== */}
          {tab === 'Resources' && (
            <div className="space-y-3">
              {resources.map(({ label, icon, value, color, rate }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono flex items-center gap-1.5" style={{ color }}>
                      <span style={{ fontSize:'13px' }}>{icon}</span>{label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{formatNumber(Math.floor(value))} / {formatNumber(max)}</span>
                  </div>
                  <div className="resource-bar h-2 rounded-full">
                    <div className="resource-fill rounded-full" style={{ width:`${Math.min((value/Math.max(max,1))*100,100)}%`, background:`linear-gradient(to right,${color}77,${color})` }}/>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-600 font-mono">{rate.toFixed(1)}/s</span>
                    {planet.colonized && !planet.inactive && (
                      <span className="text-xs font-mono animate-pulse" style={{ color, fontSize:'9px' }}>+{rate.toFixed(1)}/s</span>
                    )}
                  </div>
                </div>
              ))}
              {planet.productionBoost > 0 && (
                <div className="rounded-xl p-2 flex items-center gap-2" style={{ background:'rgba(15,158,138,0.1)', border:'1px solid rgba(15,158,138,0.2)' }}>
                  <Zap size={13} className="text-teal-400"/>
                  <span className="text-xs text-teal-300">+{planet.productionBoost}% Kill Bonus Active</span>
                </div>
              )}
            </div>
          )}

          {/* ===== MILITARY TAB ===== */}
          {tab === 'Military' && (
            <div className="space-y-2">
              {[
                { label:'Military Power', value:planet.militaryPower, color:'#a78bfa' },
                { label:'Defense Score',  value:planet.militaryPower+planet.level*20, color:'#5eead4' },
                { label:'Monsters Killed',value:planet.monstersKilled, color:'#4ade80' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b" style={{ borderColor:'rgba(124,58,237,0.1)' }}>
                  <span className="flex items-center gap-2 text-xs text-slate-400"><Shield size={13} className="text-purple-400"/>{label}</span>
                  <span className="text-sm font-mono font-semibold" style={{ color }}>{formatNumber(value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor:'rgba(124,58,237,0.1)' }}>
                <span className="text-xs text-slate-400">Monster Type</span>
                <span className="text-xs font-mono" style={{ color:'#f97316' }}>{MONSTER_EMOJIS[planet.planetType]} {MONSTER_NAMES[planet.planetType]}</span>
              </div>
              {planet.monsterPower > 0 && (
                <div className="rounded-xl p-3 border" style={{ background:'rgba(244,63,94,0.07)', borderColor:'rgba(244,63,94,0.25)' }}>
                  <div className="text-xs text-red-400 mb-2" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>⚔️ UNDER ATTACK</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Your Military</span><span className="text-purple-300">{planet.militaryPower}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Monster Power</span><span className="text-red-300">{planet.monsterPower}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Outcome</span>
                      <span style={{ color:planet.militaryPower>=planet.monsterPower*0.7?'#4ade80':'#f43f5e' }}>
                        {planet.militaryPower>=planet.monsterPower*0.7?'✓ WIN':'✗ LOSE — Upgrade Military!'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <button onClick={() => { setTab('Actions'); setShowUpgrade(true) }}
                className="btn-danger w-full mt-2" style={{ padding:'9px', fontSize:'10px' }}>
                ⚔️ Upgrade Military
              </button>
            </div>
          )}
        </div>
      </div>

      {showUpgrade  && <UpgradeModal planet={planet} onClose={()=>setShowUpgrade(false)} onSuccess={onRefetch}/>}
      {showListing  && <ListingModal planet={planet} onClose={()=>setShowListing(false)}/>}
      {showCombat   && <CombatModal  planet={planet} result={combatResult} onClose={()=>setShowCombat(false)} resourcesClaimed={claimPopup||undefined}/>}
      {claimPopup && !showCombat && <ClaimPopup iron={claimPopup.iron} gold={claimPopup.gold} uranium={claimPopup.uranium} onDone={()=>setClaimPopup(null)}/>}
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </>
  )
}