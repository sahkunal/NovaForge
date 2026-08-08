'use client'
import { useState } from 'react'
import { Planet, PLANET_COLORS, RARITY_COLORS, MONSTER_NAMES, MONSTER_EMOJIS, getThreatLevel, getThreatLabel, formatNumber } from '@/lib/types'
import { useColonize, useClaimResources, useRepairPlanet } from '@/lib/hooks/useAnchorActions'
import PlanetCanvas from './PlanetCanvas'
import ActionButton from './ActionButton'
import UpgradeModal from './UpgradeModal'
import { X, Shield, Users, Building, Star, AlertTriangle, Zap } from 'lucide-react'

interface Props { planet: Planet; onClose: () => void }
const TABS = ['Resources','Population','Military','Buildings'] as const
type Tab = typeof TABS[number]

export default function PlanetDetailPanel({ planet, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('Resources')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { execute: colonize, status: colonizeStatus } = useColonize()
  const { execute: claim, status: claimStatus } = useClaimResources()
  const { execute: repair, status: repairStatus } = useRepairPlanet()

  const threat = getThreatLevel(planet.threatLevel)
  const colors = PLANET_COLORS[planet.planetType]
  const rarityColor = RARITY_COLORS[planet.rarity]
  const maxStorage = planet.productionRate * 72 * 3600
  const hasRing = planet.rarity === 'Legendary' || planet.planetType === 'Military'
  const threatColors = { safe:'#4ade80', warn:'#fbbf24', danger:'#f97316', critical:'#f43f5e' }

  const resources = [
    { label:'Iron',    icon:'⬡', value:planet.ironBalance,    color:'#f59e0b', rate: planet.planetType==='Mining'   ? planet.productionRate*1.5 : planet.productionRate },
    { label:'Gold',    icon:'◈', value:planet.goldBalance,    color:'#eab308', rate: planet.planetType==='Luxury'   ? planet.productionRate*1.5 : planet.productionRate },
    { label:'Uranium', icon:'⬟', value:planet.uraniumBalance, color:'#22d3ee', rate: (planet.planetType==='Energy'||planet.planetType==='Research') ? planet.productionRate*1.5 : planet.productionRate },
  ]

  return (
    <>
      <div className="flex flex-col h-full" style={{ width:280 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div>
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', fontWeight:700, color:'#e2e8f0', marginBottom:4 }}>
              {planet.publicKey.slice(0,10)}...
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="badge" style={{ color:colors.primary, background:`${colors.glow}20`, borderColor:`${colors.primary}40` }}>{planet.planetType}</span>
              <span className="badge" style={{ color:rarityColor, background:`${rarityColor}15`, borderColor:`${rarityColor}30` }}>{planet.rarity}</span>
              <span className="badge badge-purple">Lv {planet.level}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors"><X size={16}/></button>
        </div>

        {/* 3D Planet */}
        <div className="relative flex items-center justify-center py-5 border-b border-purple-500/10"
          style={{ background:'radial-gradient(ellipse at center,rgba(124,58,237,0.08) 0%,transparent 70%)' }}>
          <div className="absolute w-32 h-32 rounded-full border border-purple-500/10 animate-spin-slow pointer-events-none"/>
          <div className="absolute w-48 h-48 rounded-full border border-teal-500/5 animate-spin-slow pointer-events-none" style={{ animationDirection:'reverse', animationDuration:'25s' }}/>
          <div className="animate-float relative z-10">
            <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={90} hasRing={hasRing}/>
          </div>
          <div className="absolute bottom-2 flex gap-4">
            <span className="text-xs text-slate-400 font-mono">PWR <span className="text-white">{formatNumber(planet.power)}</span></span>
            <span className="text-xs text-slate-400 font-mono">KILLS <span className="text-green-400">{planet.monstersKilled}</span></span>
          </div>
        </div>

        {/* Threat banner */}
        {threat !== 'safe' && (
          <div className="px-4 py-2 flex items-center gap-2 border-b"
            style={{ background:`${threatColors[threat]}12`, borderColor:`${threatColors[threat]}25` }}>
            <AlertTriangle size={12} style={{ color:threatColors[threat] }}/>
            <span className="text-xs" style={{ color:threatColors[threat] }}>{getThreatLabel(threat)}</span>
            {planet.monsterPower > 0 && (
              <span className="text-xs ml-auto animate-pulse" style={{ color:threatColors[threat] }}>
                {MONSTER_EMOJIS[planet.planetType]} Attacking!
              </span>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-purple-500/20">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 transition-colors ${tab===t?'text-purple-400 border-b-2 border-purple-500':'text-slate-500 hover:text-slate-300'}`}
              style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', letterSpacing:'0.04em' }}>{t}</button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'Resources' && (
            <>
              <div className="space-y-3">
                {resources.map(({ label, icon, value, color, rate }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono flex items-center gap-1" style={{ color }}><span>{icon}</span>{label}</span>
                      <span className="text-xs text-slate-400 font-mono">{formatNumber(value)} / {formatNumber(maxStorage)}</span>
                    </div>
                    <div className="resource-bar h-1.5">
                      <div className="resource-fill" style={{ width:`${Math.min((value/maxStorage)*100,100)}%`, background:`linear-gradient(to right,${color}88,${color})` }}/>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 font-mono">{rate.toFixed(1)}/s</div>
                  </div>
                ))}
              </div>
              {planet.productionBoost > 0 && (
                <div className="panel-teal p-2 rounded-lg flex items-center gap-2">
                  <Zap size={12} className="text-teal-400"/>
                  <span className="text-xs text-teal-300">+{planet.productionBoost}% Kill Bonus Active</span>
                </div>
              )}
              <div className="text-xs text-slate-600 font-mono">72h storage cap · {formatNumber(maxStorage)} max</div>
            </>
          )}

          {tab === 'Population' && (
            <div className="space-y-2">
              {[
                { label:'Total Population', value:planet.population, icon:<Users size={13} className="text-purple-400"/> },
                { label:'Researchers', value:planet.researchers, icon:<Star size={13} className="text-teal-400"/> },
                { label:'Food Consumption', value:Math.round(planet.population*0.32), icon:<span className="text-sm">🌾</span> },
                { label:'Food Reserve', value:0, icon:<span className="text-sm">📦</span> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-purple-500/10">
                  <span className="flex items-center gap-2 text-xs text-slate-400">{icon}{label}</span>
                  <span className="text-sm text-white font-mono">{formatNumber(value)}</span>
                </div>
              ))}
              <div className="text-xs text-slate-600 mt-2">Population grows with planet level</div>
            </div>
          )}

          {tab === 'Military' && (
            <div className="space-y-2">
              {[
                { label:'Military Power', value:planet.militaryPower, color:'#a78bfa', note:'Combat Soon' },
                { label:'Defense Score', value:planet.militaryPower + planet.level*20, color:'#5eead4', note:null },
                { label:'Monsters Killed', value:planet.monstersKilled, color:'#4ade80', note:null },
              ].map(({ label, value, color, note }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-purple-500/10">
                  <span className="flex items-center gap-2 text-xs text-slate-400"><Shield size={13} className="text-purple-400"/>{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono" style={{ color }}>{formatNumber(value)}</span>
                    {note && <span className="badge badge-gray" style={{ fontSize:'8px' }}>{note}</span>}
                  </div>
                </div>
              ))}
              <div className="py-2 border-b border-purple-500/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Monster Threat</span>
                <span className="text-xs font-mono" style={{ color:'#f97316' }}>{MONSTER_EMOJIS[planet.planetType]} {MONSTER_NAMES[planet.planetType]}</span>
              </div>
              {planet.monsterPower > 0 && (
                <div className="rounded-lg p-3 border border-red-500/30 bg-red-900/20">
                  <div className="text-xs text-red-400 mb-1" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>⚔️ UNDER ATTACK</div>
                  <div className="text-xs text-slate-400">Monster: <span className="text-red-300">{planet.monsterPower}</span></div>
                  <div className="text-xs text-slate-400">Defense: <span className="text-purple-300">{planet.militaryPower}</span></div>
                </div>
              )}
            </div>
          )}

          {tab === 'Buildings' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Building size={32} className="text-slate-700"/>
              <p className="text-slate-500 text-xs text-center">No buildings yet<br/>Coming in a future update</p>
            </div>
          )}

          {/* Learned bonuses */}
          <div>
            <div className="text-xs text-slate-500 mb-2" style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', letterSpacing:'0.1em' }}>LEARNED BONUSES</div>
            <div className="flex gap-2 flex-wrap">
              {['type',...(planet.level>=3?['def']:[]),...(planet.level>=5?['spd']:[])].map((b,i) => (
                <div key={i} className="w-9 h-9 rounded-full border border-purple-500/30 bg-purple-900/20 flex items-center justify-center text-base">
                  {i===0?{Mining:'⛏',Luxury:'💎',Research:'🔬',Energy:'⚡',Military:'⚔️'}[planet.planetType]:i===1?'🛡':'🚀'}
                </div>
              ))}
              {[...Array(Math.max(0,5-planet.level))].map((_,i)=>(
                <div key={`e${i}`} className="w-9 h-9 rounded-full border border-slate-700/40"/>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-purple-500/20 space-y-2">
          {planet.inactive ? (
            <ActionButton label="🔧 Repair Planet" loadingLabel="Repairing..." successLabel="✓ Repaired!"
              status={repairStatus} onClick={() => repair(planet.publicKey)} variant="danger"/>
          ) : (
            <>
              <ActionButton label="⚡ Claim Resources" loadingLabel="Claiming..." successLabel="✓ Claimed!"
                status={claimStatus} onClick={() => claim(planet.publicKey)}
                disabled={!planet.colonized} variant="teal"/>
              <button onClick={() => setShowUpgrade(true)} className="btn-primary w-full" style={{ padding:'8px' }}>
                ▲ Upgrade
              </button>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton label={planet.colonized?'⬛ Uncolonize':'🌐 Colonize'} loadingLabel="..."
                  status={colonizeStatus} onClick={() => colonize(planet.publicKey)} variant="ghost"/>
                <button className={`btn-ghost ${planet.colonized?'btn-disabled':''}`} style={{ fontSize:'10px' }}>
                  {planet.listed?'✕ Cancel':'🏪 List Sale'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal planet={planet} onClose={() => setShowUpgrade(false)}/>}
    </>
  )
}
