'use client'
import { Planet, PLANET_COLORS, formatNumber } from '@/lib/types'
import { X } from 'lucide-react'
import ActionButton from './ActionButton'
import { useUpgradePlanet, useUpgradeMilitary } from '@/lib/hooks/useAnchorActions'

interface Props { planet: Planet; onClose: () => void }

export default function UpgradeModal({ planet, onClose }: Props) {
  const { execute: upgradePlanet, status: planetStatus } = useUpgradePlanet()
  const { execute: upgradeMilitary, status: milStatus } = useUpgradeMilitary()
  const colors = PLANET_COLORS[planet.planetType]
  const isResearch = planet.planetType === 'Research'
  const discount = isResearch ? 0.9 : 1

  const planetCosts = [
    { label:'Iron',    cost: Math.floor(100 * planet.level * discount), has: planet.ironBalance,    color:'#f59e0b' },
    { label:'Gold',    cost: Math.floor(20  * planet.level * discount), has: planet.goldBalance,    color:'#eab308' },
    { label:'Uranium', cost: Math.floor(10  * planet.level * discount), has: planet.uraniumBalance, color:'#22d3ee' },
  ]
  const milCosts = [
    { label:'Iron',    cost: 80,  has: planet.ironBalance,    color:'#f59e0b' },
    { label:'Gold',    cost: 40,  has: planet.goldBalance,    color:'#eab308' },
    { label:'Uranium', cost: 25,  has: planet.uraniumBalance, color:'#22d3ee' },
  ]
  const canUpgradePlanet = planetCosts.every(c => c.has >= c.cost) && planet.level < 10
  const canUpgradeMil = milCosts.every(c => c.has >= c.cost)

  const CostRow = ({ costs }: { costs: typeof planetCosts }) => (
    <div className="space-y-1.5">
      {costs.map(({ label, cost, has, color }) => (
        <div key={label} className="flex justify-between items-center text-xs">
          <span style={{ color }}>{label}</span>
          <div className="flex items-center gap-2">
            <span className={has >= cost ? 'text-green-400' : 'text-red-400'}>{formatNumber(has)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold">{formatNumber(cost)}</span>
            <span>{has >= cost ? '✓' : '✗'}</span>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(6,6,20,0.85)', backdropFilter:'blur(8px)' }}>
      <div className="panel w-full max-w-md mx-4" style={{ background:'rgba(10,9,32,0.98)' }}>
        <div className="flex items-center justify-between p-5 border-b border-purple-500/20">
          <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:'13px', fontWeight:700, color:'#e2e8f0' }}>▲ UPGRADES</h2>
          <button onClick={onClose}><X size={16} className="text-slate-500 hover:text-white" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Planet upgrade */}
          <div className="rounded-xl p-4" style={{ border:`1px solid ${colors.primary}30`, background:`${colors.glow}10` }}>
            <div className="flex justify-between items-center mb-3">
              <div>
                <div style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', color: colors.primary, fontWeight:700 }}>PLANET LEVEL {planet.level} → {planet.level + 1}</div>
                <div className="text-xs text-slate-400 mt-0.5">+Production · +Power · +Population</div>
              </div>
              {isResearch && <span className="badge badge-teal" style={{ fontSize:'8px' }}>-10% COST</span>}
            </div>
            <CostRow costs={planetCosts} />
            <div className="mt-3">
              <ActionButton label={planet.level >= 10 ? 'MAX LEVEL' : '▲ Upgrade Planet'} loadingLabel="Upgrading..." successLabel="✓ Upgraded!"
                status={planetStatus} onClick={() => upgradePlanet(planet.publicKey)}
                disabled={!canUpgradePlanet || planet.level >= 10} />
            </div>
          </div>

          {/* Military upgrade */}
          <div className="rounded-xl p-4" style={{ border:'1px solid rgba(244,63,94,0.2)', background:'rgba(244,63,94,0.05)' }}>
            <div className="mb-3">
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', color:'#fb7185', fontWeight:700 }}>MILITARY POWER +25</div>
              <div className="text-xs text-slate-400 mt-0.5">Increases defense against monster attacks</div>
            </div>
            <CostRow costs={milCosts} />
            <div className="mt-3">
              <ActionButton label="⚔️ Upgrade Military" loadingLabel="Training..." successLabel="✓ Strengthened!"
                status={milStatus} onClick={() => upgradeMilitary(planet.publicKey)}
                disabled={!canUpgradeMil} variant="danger" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
