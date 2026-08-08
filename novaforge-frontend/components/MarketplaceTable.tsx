'use client'
import { useState } from 'react'
import { MOCK_LISTINGS, PLANET_COLORS, RARITY_COLORS, formatNumber, lamportsToSOL, Listing } from '@/lib/types'
import PlanetCanvas from './PlanetCanvas'

export default function MarketplaceTable() {
  const [sort, setSort] = useState<string>('price')
  const [filterType, setFilterType] = useState<string>('All')
  const [filterRarity, setFilterRarity] = useState<string>('All')

  const types = ['All','Mining','Luxury','Research','Energy','Military']
  const rarities = ['All','Common','Uncommon','Rare','Legendary']

  const filtered = MOCK_LISTINGS
    .filter(l => filterType === 'All' || l.planet.planetType === filterType)
    .filter(l => filterRarity === 'All' || l.planet.rarity === filterRarity)
    .sort((a, b) => sort === 'price' ? a.priceSOL - b.priceSOL : b.planet.level - a.planet.level)

  const SortBtn = ({ k, label }: { k: string; label: string }) => (
    <button onClick={() => setSort(k)}
      className="text-xs px-2 py-1 rounded transition-colors"
      style={{ background: sort===k?'rgba(124,58,237,0.3)':'transparent', color: sort===k?'#a78bfa':'#475569', fontFamily:'Orbitron,monospace', fontSize:'9px' }}>
      {label}
    </button>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="panel p-4 flex flex-wrap gap-4 items-center">
        <div>
          <div className="text-xs text-slate-500 mb-1" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>TYPE</div>
          <div className="flex gap-1 flex-wrap">
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ background: filterType===t?'rgba(124,58,237,0.3)':'rgba(255,255,255,0.04)', color: filterType===t?'#a78bfa':'#475569', fontFamily:'Orbitron,monospace', fontSize:'9px', border: filterType===t?'1px solid rgba(124,58,237,0.4)':'1px solid transparent' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>RARITY</div>
          <div className="flex gap-1 flex-wrap">
            {rarities.map(r => (
              <button key={r} onClick={() => setFilterRarity(r)}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ background: filterRarity===r?'rgba(124,58,237,0.3)':'rgba(255,255,255,0.04)', color: filterRarity===r?'#a78bfa':'#475569', fontFamily:'Orbitron,monospace', fontSize:'9px', border: filterRarity===r?'1px solid rgba(124,58,237,0.4)':'1px solid transparent' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex gap-1">
          <SortBtn k="price" label="PRICE" />
          <SortBtn k="level" label="LEVEL" />
        </div>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="grid text-xs text-slate-500 px-4 py-2 border-b border-purple-500/10"
          style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 1fr', fontFamily:'Orbitron,monospace', fontSize:'9px', letterSpacing:'0.05em' }}>
          <span>PLANET</span><span>TYPE</span><span>RARITY</span><span>LVL</span><span>POWER</span><span>MIL</span><span>PRICE</span>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600 text-sm">No listings match your filters</div>
        )}
        {filtered.map((listing, i) => {
          const { planet } = listing
          const colors = PLANET_COLORS[planet.planetType]
          const rarityColor = RARITY_COLORS[planet.rarity]
          return (
            <div key={listing.publicKey}
              className="grid items-center px-4 py-3 border-b border-purple-500/10 hover:bg-purple-900/10 transition-colors cursor-pointer group"
              style={{ gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr 1fr', background: i%2===0?'transparent':'rgba(124,58,237,0.02)' }}>
              <div className="flex items-center gap-3">
                <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={36} />
                <div>
                  <div className="text-white text-xs font-mono">{planet.publicKey.slice(0,10)}...</div>
                  <div className="text-slate-500 text-xs">{planet.monstersKilled} kills</div>
                </div>
              </div>
              <span style={{ color: colors.primary, fontFamily:'Orbitron,monospace', fontSize:'10px' }}>{planet.planetType}</span>
              <span style={{ color: rarityColor, fontFamily:'Orbitron,monospace', fontSize:'10px' }}>{planet.rarity}</span>
              <span className="text-white font-mono">{planet.level}</span>
              <span className="text-slate-300 font-mono">{formatNumber(planet.power)}</span>
              <span className="text-purple-300 font-mono">{formatNumber(planet.militaryPower)}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{listing.priceSOL} ◎</span>
                <button className="btn-teal opacity-0 group-hover:opacity-100 transition-opacity" style={{ padding:'4px 10px', fontSize:'9px' }}>
                  BUY
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
