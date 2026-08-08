'use client'
import { Planet, PLANET_COLORS, RARITY_COLORS, MONSTER_NAMES, MONSTER_EMOJIS, getThreatLevel, getThreatLabel, formatNumber } from '@/lib/types'
import { useLiveTicker } from '@/lib/hooks/useLiveTicker'
import PlanetCanvas from './PlanetCanvas'

interface Props { planet: Planet; onClick?: () => void; selected?: boolean }

export default function PlanetCard({ planet, onClick, selected }: Props) {
  const live = useLiveTicker(planet)
  const threat = getThreatLevel(live.threatLevel)
  const colors = PLANET_COLORS[planet.planetType]
  const rarityColor = RARITY_COLORS[planet.rarity]
  const maxStorage = planet.productionRate * 72 * 3600
  const hasRing = planet.rarity === 'Legendary' || planet.planetType === 'Military'
  const threatColors = { safe:'#4ade80', warn:'#fbbf24', danger:'#f97316', critical:'#f43f5e' }

  return (
    <div onClick={onClick}
      className={`relative panel cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden
        ${selected ? 'border-purple-500/60 glow-purple' : 'hover:border-purple-500/40'}
        ${planet.inactive ? 'opacity-60' : ''}`}
      style={{ padding:16 }}>

      {planet.inactive && (
        <div className="absolute inset-0 bg-red-900/20 z-10 flex items-center justify-center rounded-xl">
          <span style={{ color:'#f87171', fontFamily:'Orbitron,monospace', fontSize:'11px', letterSpacing:'0.1em' }}>💀 INACTIVE</span>
        </div>
      )}

      {planet.monsterPower > 0 && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"/>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={52} hasRing={hasRing}/>
          {planet.colonized && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-panel animate-pulse"/>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1">
            <span className="badge" style={{ color:colors.primary, background:`${colors.glow}20`, borderColor:`${colors.primary}40`, fontSize:'9px' }}>{planet.planetType}</span>
            <span className="badge" style={{ color:rarityColor, background:`${rarityColor}15`, borderColor:`${rarityColor}30`, fontSize:'9px' }}>{planet.rarity}</span>
            <span className="badge badge-gray" style={{ fontSize:'9px' }}>Lv {planet.level}</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">{planet.publicKey.slice(0,10)}...</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-slate-500" style={{ fontFamily:'Orbitron,monospace', fontSize:'8px' }}>PWR</div>
          <div className="text-white text-sm font-semibold font-mono">{formatNumber(planet.power)}</div>
        </div>
      </div>

      {/* Threat */}
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color:threatColors[threat], fontSize:'10px' }}>{getThreatLabel(live.threatLevel >= 50 ? threat : 'safe')}</span>
        {planet.monsterPower > 0 && (
          <span className="text-xs text-red-400 animate-pulse ml-auto">
            {MONSTER_EMOJIS[planet.planetType]} {MONSTER_NAMES[planet.planetType]}!
          </span>
        )}
      </div>

      {/* Live resource bars */}
      <div className="space-y-2 mb-3">
        {[
          { label:'Fe', value:live.iron,    pending:live.pendingIron,    color:'#f59e0b' },
          { label:'Au', value:live.gold,    pending:live.pendingGold,    color:'#eab308' },
          { label:'U',  value:live.uranium, pending:live.pendingUranium, color:'#22d3ee' },
        ].map(({ label, value, pending, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-4 font-mono" style={{ color }}>{label}</span>
            <div className="flex-1 resource-bar">
              <div className="resource-fill" style={{ width:`${Math.min((value/maxStorage)*100,100)}%`, background:color }}/>
            </div>
            <div className="text-right w-20">
              <span className="text-xs text-slate-300 font-mono">{formatNumber(Math.floor(value))}</span>
              {planet.colonized && pending > 0 && (
                <span className="text-xs ml-1 font-mono" style={{ color, fontSize:'9px' }}>+{planet.productionRate}/s</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">{planet.monstersKilled} kills</span>
        <div className="flex gap-1">
          {planet.listed && <span className="badge badge-amber" style={{ fontSize:'8px' }}>Listed</span>}
          {planet.productionBoost > 0 && <span className="badge badge-green" style={{ fontSize:'8px' }}>+{planet.productionBoost}%</span>}
          {threat === 'critical' && <span className="badge badge-red animate-pulse" style={{ fontSize:'8px' }}>⚠ Critical</span>}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background:`linear-gradient(to right,transparent,${colors.primary}60,transparent)` }}/>
    </div>
  )
}
