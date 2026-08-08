'use client'
import { useState } from 'react'
import { Planet, PLANET_COLORS, lamportsToSOL, SOLToLamports } from '@/lib/types'
import { useListPlanet } from '@/lib/hooks/useAnchorActions'
import ActionButton from './ActionButton'
import { X } from 'lucide-react'
import PlanetCanvas from './PlanetCanvas'

interface Props { planet: Planet; onClose: () => void }

export default function ListingModal({ planet, onClose }: Props) {
  const [priceSOL, setPriceSOL] = useState('')
  const { execute: listPlanet, status } = useListPlanet()
  const colors = PLANET_COLORS[planet.planetType]
  const price = parseFloat(priceSOL) || 0
  const fee = price * 0.01
  const sellerGets = price - fee

  const handleList = async () => {
    if (!price || price <= 0) return
    await listPlanet(planet.publicKey, planet.asset, price)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(6,6,20,0.85)', backdropFilter:'blur(8px)' }}>
      <div className="panel w-full max-w-sm mx-4" style={{ background:'rgba(10,9,32,0.98)' }}>
        <div className="flex items-center justify-between p-5 border-b border-purple-500/20">
          <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:'13px', fontWeight:700, color:'#e2e8f0' }}>🏪 LIST FOR SALE</h2>
          <button onClick={onClose}><X size={16} className="text-slate-500 hover:text-white"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background:`${colors.glow}15`, border:`1px solid ${colors.primary}30` }}>
            <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={44}/>
            <div>
              <div className="badge" style={{ color:colors.primary, borderColor:`${colors.primary}40` }}>{planet.planetType} · Lv {planet.level}</div>
              <div className="text-xs text-slate-400 mt-1 font-mono">{planet.publicKey.slice(0,14)}...</div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>PRICE (SOL)</label>
            <div className="relative">
              <input type="number" value={priceSOL} onChange={e => setPriceSOL(e.target.value)}
                placeholder="0.0" min="0" step="0.1"
                className="w-full rounded-lg px-4 py-3 text-white text-lg font-mono pr-12 focus:outline-none"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(124,58,237,0.3)' }}/>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400">◎</span>
            </div>
          </div>

          {price > 0 && (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400"><span>Listing price</span><span className="text-white">{price.toFixed(3)} ◎</span></div>
              <div className="flex justify-between text-slate-400"><span>Protocol fee (1%)</span><span className="text-amber-400">-{fee.toFixed(3)} ◎</span></div>
              <div className="h-px bg-purple-500/20 my-1"/>
              <div className="flex justify-between"><span className="text-slate-300">You receive</span><span className="text-green-400 font-semibold">{sellerGets.toFixed(3)} ◎</span></div>
            </div>
          )}

          <div className="rounded-lg p-3" style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
            <div className="text-xs text-amber-400" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>⚠ IMPORTANT</div>
            <div className="text-xs text-slate-400 mt-1">Planet must be uncolonized before listing. NFT will be frozen in escrow until sold or cancelled.</div>
          </div>

          <ActionButton label="🏪 List Planet" loadingLabel="Listing..." successLabel="✓ Listed!"
            status={status} onClick={handleList} disabled={!price || price <= 0}/>
        </div>
      </div>
    </div>
  )
}
