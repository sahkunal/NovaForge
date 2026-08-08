'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { MOCK_PLANETS, Planet } from '@/lib/types'
import { useNovaWallet } from '@/lib/hooks/useWallet'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import PlanetCard from '@/components/PlanetCard'
import PlanetDetailPanel from '@/components/PlanetDetailPanel'
import MintModal from '@/components/MintModal'
import EntryScreen from '@/components/EntryScreen'

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false })

export default function Dashboard() {
  const { connected } = useNovaWallet()
  const [selected, setSelected] = useState<Planet | null>(null)
  const [showMint, setShowMint] = useState(false)
  const [minting, setMinting] = useState(false)

  if (!connected) return <EntryScreen />

  const planets = MOCK_PLANETS
  const stats = [
    { label:'Planets',    value:planets.length,                              sub:'/ 10 max',      color:'#a78bfa' },
    { label:'Colonized',  value:planets.filter(p=>p.colonized).length,       sub:'active',        color:'#4ade80' },
    { label:'Kills',      value:planets.reduce((a,p)=>a+p.monstersKilled,0), sub:'lifetime',      color:'#f97316' },
    { label:'At Risk',    value:planets.filter(p=>p.threatLevel>=50).length, sub:'need attention',color:'#f43f5e' },
  ]

  const handleMint = async () => {
    setMinting(true)
    await new Promise(r => setTimeout(r, 2200))
    setMinting(false)
    setShowMint(false)
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <StarField />
      <NavigationBar />
      <TopBar />

      <div className="absolute inset-0 overflow-y-auto" style={{ left:64, top:48, paddingRight:selected?280:0 }}>
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, sub, color }) => (
              <div key={label} className="panel p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
                  style={{ background:`${color}10`, filter:'blur(20px)', transform:'translate(20%,-20%)' }}/>
                <div className="text-xs text-slate-500 mb-1" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', letterSpacing:'0.1em' }}>{label.toUpperCase()}</div>
                <div className="text-3xl font-bold" style={{ color, fontFamily:'Orbitron,monospace' }}>{value}</div>
                <div className="text-xs text-slate-500 mt-1">{sub}</div>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:'14px', fontWeight:700, color:'#e2e8f0', letterSpacing:'0.1em' }}>MY PLANETS</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click a planet card to manage it</p>
            </div>
            <button onClick={() => setShowMint(true)} className="btn-primary flex items-center gap-2" style={{ padding:'8px 16px', fontSize:'10px' }}>
              <span>⬡</span> Mint Planet
            </button>
          </div>

          {/* Grid */}
          {planets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="text-5xl animate-float">🪐</div>
              <p style={{ fontFamily:'Orbitron,monospace', fontSize:'12px', color:'#475569', letterSpacing:'0.1em' }}>NO PLANETS YET</p>
              <button onClick={() => setShowMint(true)} className="btn-primary" style={{ padding:'10px 24px' }}>Mint your first planet</button>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))' }}>
              {planets.map(planet => (
                <PlanetCard key={planet.publicKey} planet={planet}
                  selected={selected?.publicKey === planet.publicKey}
                  onClick={() => setSelected(p => p?.publicKey === planet.publicKey ? null : planet)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="absolute right-0 bottom-0 z-30 border-l border-purple-500/20 overflow-hidden"
          style={{ top:48, width:280, background:'rgba(10,9,32,0.97)', backdropFilter:'blur(20px)' }}>
          <PlanetDetailPanel planet={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {showMint && <MintModal onClose={() => setShowMint(false)} onMint={handleMint} minting={minting} />}
    </div>
  )
}
