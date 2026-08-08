'use client'
import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Planet, MOCK_PLANETS } from '@/lib/types'
import { useNovaWallet } from '@/lib/hooks/useWallet'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import PlanetDetailPanel from '@/components/PlanetDetailPanel'

const SplashScreen   = dynamic(() => import('@/components/SplashScreen'),  { ssr: false })
const EntryScreen    = dynamic(() => import('@/components/EntryScreen'),   { ssr: false })
const StarField      = dynamic(() => import('@/components/StarField'),     { ssr: false })
const SpaceMap       = dynamic(() => import('@/components/SpaceMap'),      { ssr: false })

export default function Home() {
  const [splashDone, setSplashDone]   = useState(false)
  const [selected, setSelected]       = useState<Planet | null>(null)
  const { connected }                 = useNovaWallet()

  const handleSelect = useCallback((p: Planet) => {
    setSelected(prev => prev?.publicKey === p.publicKey ? null : p)
  }, [])

  // 1. Splash
  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />

  // 2. Entry (wallet gate)
  if (!connected) return <EntryScreen />

  // 3. Main game
  return (
    <div className="fixed inset-0 overflow-hidden">
      <StarField />
      <NavigationBar />
      <TopBar />

      <div className="absolute inset-0" style={{ left:64, top:48 }}>
        <div className="relative w-full h-full">
          <SpaceMap onSelectPlanet={handleSelect} selectedId={selected?.publicKey} />

          {/* HUD top-left */}
          <div className="absolute top-4 left-4 panel px-4 py-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', color:'#a78bfa', letterSpacing:'0.1em' }}>PLANETS</span>
              <span className="text-white font-semibold font-mono">{MOCK_PLANETS.length}<span className="text-slate-600">/10</span></span>
            </div>
            <div className="w-px h-4 bg-purple-500/20"/>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', color:'#4ade80', letterSpacing:'0.1em' }}>KILLS</span>
              <span className="text-white font-semibold font-mono">{MOCK_PLANETS.reduce((a,p)=>a+p.monstersKilled,0)}</span>
            </div>
            <div className="w-px h-4 bg-purple-500/20"/>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', color:'#f43f5e', letterSpacing:'0.1em' }}>AT RISK</span>
              <span className="text-white font-semibold font-mono">{MOCK_PLANETS.filter(p=>p.threatLevel>=50).length}</span>
            </div>
          </div>

          {/* Threat legend */}
          <div className="absolute bottom-6 left-4 panel px-3 py-3 flex flex-col gap-2">
            <div style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', color:'#475569', letterSpacing:'0.1em', marginBottom:2 }}>THREAT LEVEL</div>
            {[['#4ade80','Safe (0–48h)'],['#fbbf24','At Risk (48–75h)'],['#f97316','Danger (75–90h)'],['#f43f5e','Critical (90h+)']].map(([c,l])=>(
              <div key={l} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:c }}/>
                <span className="text-xs text-slate-400">{l}</span>
              </div>
            ))}
            <div className="mt-1 pt-1 border-t border-purple-500/10">
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'8px', color:'#475569', letterSpacing:'0.08em', marginBottom:4 }}>MONSTERS</div>
              {[['🪨','Scout'],['🏴‍☠️','Raider'],['👽','Warlord']].map(([e,l])=>(
                <div key={l} className="flex items-center gap-2">
                  <span style={{ fontSize:'12px' }}>{e}</span>
                  <span className="text-xs text-slate-400">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Click hint */}
          {!selected && (
            <div className="absolute bottom-6 right-4 panel px-4 py-2 flex items-center gap-2 animate-pulse">
              <span style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', color:'#475569' }}>Click a planet to manage</span>
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
    </div>
  )
}
