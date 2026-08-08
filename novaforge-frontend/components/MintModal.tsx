'use client'
import { useState } from 'react'
import { PlanetType, Rarity, PLANET_COLORS, RARITY_COLORS } from '@/lib/types'
import PlanetCanvas from './PlanetCanvas'
import { X } from 'lucide-react'

interface Props { onClose: () => void; onMint: (type: PlanetType, rarity: Rarity) => void; minting: boolean }

const TYPES: PlanetType[] = ['Mining','Luxury','Research','Energy','Military']
const TYPE_DESC: Record<PlanetType, string> = {
  Mining:   '+50% Iron · Rock Golem threat',
  Luxury:   '+50% Gold · Space Pirates threat',
  Research: '-10% Upgrade cost · Alien Swarm threat',
  Energy:   '+50% Uranium · Plasma Wraith threat',
  Military: 'High defense · Void Titan threat',
}

export default function MintModal({ onClose, onMint, minting }: Props) {
  const [selectedType, setSelectedType] = useState<PlanetType>('Mining')
  // Rarity is assigned randomly on-chain, shown here as preview
  const previewRarity: Rarity = 'Rare'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(6,6,20,0.85)', backdropFilter:'blur(8px)' }}>
      <div className="panel w-full max-w-md mx-4 overflow-hidden" style={{ background:'rgba(10,9,32,0.98)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-500/20">
          <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:'14px', fontWeight:700, color:'#e2e8f0', letterSpacing:'0.1em' }}>⬡ MINT PLANET</h2>
          <button onClick={onClose}><X size={16} className="text-slate-500 hover:text-white transition-colors" /></button>
        </div>

        {/* Planet preview */}
        <div className="flex justify-center py-6" style={{ background:'radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 70%)' }}>
          <div className="animate-float">
            <PlanetCanvas planetType={selectedType} rarity={previewRarity} size={100} hasRing={selectedType === 'Military'} />
          </div>
        </div>

        {/* Type selection */}
        <div className="px-5 pb-4">
          <div className="text-xs text-slate-500 mb-2" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', letterSpacing:'0.1em' }}>SELECT PLANET TYPE</div>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {TYPES.map(t => {
              const colors = PLANET_COLORS[t]
              const active = selectedType === t
              return (
                <button key={t} onClick={() => setSelectedType(t)}
                  className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
                  style={{ border:`1px solid ${active ? colors.primary : 'rgba(124,58,237,0.15)'}`, background: active ? `${colors.glow}20` : 'transparent' }}>
                  <PlanetCanvas planetType={t} rarity="Common" size={28} animated={false} />
                  <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', color: active ? colors.primary : '#475569' }}>{t.slice(0,3).toUpperCase()}</span>
                </button>
              )
            })}
          </div>

          <div className="rounded-lg p-3 mb-4" style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)' }}>
            <div className="text-xs text-purple-300 mb-1" style={{ fontFamily:'Orbitron,monospace', fontSize:'10px', fontWeight:600 }}>{selectedType} Planet</div>
            <div className="text-xs text-slate-400">{TYPE_DESC[selectedType]}</div>
          </div>

          <div className="rounded-lg p-3 mb-5" style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
            <div className="text-xs text-amber-400 mb-1" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>⚠ RARITY ASSIGNED ON-CHAIN</div>
            <div className="text-xs text-slate-400">Common · Uncommon · Rare · Legendary<br />Rarity determines production rate multiplier.</div>
          </div>

          <button onClick={() => onMint(selectedType, previewRarity)}
            disabled={minting}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ padding:'12px', fontSize:'12px', letterSpacing:'0.08em' }}>
            {minting ? (
              <><svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="24" strokeDashoffset="12"/></svg>Minting...</>
            ) : '⬡ Mint Planet NFT'}
          </button>
          <p className="text-center text-xs text-slate-600 mt-2">Creates MPL-Core Asset + Planet PDA on Solana</p>
        </div>
      </div>
    </div>
  )
}
