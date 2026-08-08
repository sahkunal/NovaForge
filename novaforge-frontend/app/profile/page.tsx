'use client'
import dynamic from 'next/dynamic'
import { useNovaWallet } from '@/lib/hooks/useWallet'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import EntryScreen from '@/components/EntryScreen'
import PlanetCanvas from '@/components/PlanetCanvas'
import { useLiveTicker } from '@/lib/hooks/useLiveTicker'
import { MOCK_PLANETS, MOCK_LISTINGS, formatNumber } from '@/lib/types'

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false })

function PlanetRow({ planet }: { planet: typeof MOCK_PLANETS[0] }) {
  const live = useLiveTicker(planet)
  return (
    <div className="panel p-3 flex items-center gap-3 hover:border-purple-500/40 transition-colors cursor-pointer">
      <PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={40} />
      <div className="flex-1">
        <div className="flex gap-1 mb-1 flex-wrap">
          <span className="badge badge-purple" style={{ fontSize:'8px' }}>{planet.planetType}</span>
          <span className="badge badge-gray" style={{ fontSize:'8px' }}>Lv {planet.level}</span>
          {planet.colonized && <span className="badge badge-green" style={{ fontSize:'8px' }}>Active</span>}
          {planet.listed && <span className="badge badge-amber" style={{ fontSize:'8px' }}>Listed</span>}
        </div>
        <div className="text-xs text-slate-500 font-mono">{planet.publicKey.slice(0,14)}...</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-400">Fe/Au/U</div>
        <div className="text-xs text-white font-mono">{formatNumber(Math.floor(live.iron))}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-slate-400">Kills</div>
        <div className="text-sm text-green-400 font-mono">{planet.monstersKilled}</div>
      </div>
    </div>
  )
}

export default function Profile() {
  const { connected, publicKey } = useNovaWallet()
  if (!connected) return <EntryScreen />

  const totalPower = MOCK_PLANETS.reduce((a,p)=>a+p.power,0)
  const totalMil   = MOCK_PLANETS.reduce((a,p)=>a+p.militaryPower,0)
  const totalKills = MOCK_PLANETS.reduce((a,p)=>a+p.monstersKilled,0)

  const txHistory = [
    { type:'Claim',   amount:'+1,204 Fe', time:'2h ago',  color:'#f59e0b' },
    { type:'Upgrade', amount:'Level 5',   time:'1d ago',  color:'#a78bfa' },
    { type:'Kill',    amount:'Rock Golem',time:'3d ago',  color:'#4ade80' },
    { type:'Listed',  amount:'2.0 ◎',    time:'5d ago',  color:'#22d3ee' },
    { type:'Minted',  amount:'Research',  time:'7d ago',  color:'#5eead4' },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden">
      <StarField />
      <NavigationBar />
      <TopBar />
      <div className="absolute inset-0 overflow-y-auto" style={{ left:64, top:48 }}>
        <div className="p-6 max-w-4xl">
          {/* Profile header */}
          <div className="panel p-6 mb-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background:'linear-gradient(135deg,#7c3aed,#0f9e8a)', boxShadow:'0 0 30px rgba(124,58,237,0.5)' }}>⬡</div>
            <div className="flex-1">
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'15px', fontWeight:700, color:'#e2e8f0', letterSpacing:'0.08em' }}>COMMANDER</div>
              <div className="text-slate-400 text-sm font-mono mt-1">{publicKey?.slice(0,20)}...</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="badge badge-purple">Lv {Math.max(...MOCK_PLANETS.map(p=>p.level))} Max</span>
                <span className="badge badge-green">{totalKills} Kills</span>
                <span className="badge badge-teal">{MOCK_PLANETS.length} Planets</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
              {[
                { label:'Total Power', value:formatNumber(totalPower), color:'#a78bfa' },
                { label:'Military',    value:formatNumber(totalMil),   color:'#f43f5e' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="text-xs text-slate-500" style={{ fontFamily:'Orbitron,monospace', fontSize:'8px' }}>{label}</div>
                  <div className="font-bold text-sm font-mono" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-3">
              <h3 style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', color:'#a78bfa', letterSpacing:'0.1em' }}>OWNED PLANETS</h3>
              {MOCK_PLANETS.map(p => <PlanetRow key={p.publicKey} planet={p} />)}

              {MOCK_LISTINGS.length > 0 && (
                <>
                  <h3 className="pt-2" style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', color:'#fbbf24', letterSpacing:'0.1em' }}>ACTIVE LISTINGS</h3>
                  {MOCK_LISTINGS.slice(0,2).map(l => (
                    <div key={l.publicKey} className="panel p-3 flex items-center gap-3">
                      <PlanetCanvas planetType={l.planet.planetType} rarity={l.planet.rarity} size={40}/>
                      <div className="flex-1">
                        <span className="badge badge-amber" style={{ fontSize:'8px' }}>For Sale</span>
                        <div className="text-xs text-slate-500 font-mono mt-1">{l.planet.publicKey.slice(0,14)}...</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{l.priceSOL} ◎</div>
                        <div className="text-xs text-slate-500">{new Date(l.listedAt*1000).toLocaleDateString()}</div>
                      </div>
                      <button className="btn-ghost" style={{ fontSize:'9px', padding:'4px 10px', color:'#f43f5e', borderColor:'rgba(244,63,94,0.3)' }}>Cancel</button>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div>
              <h3 className="mb-3" style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', color:'#5eead4', letterSpacing:'0.1em' }}>HISTORY</h3>
              <div className="panel overflow-hidden">
                {txHistory.map((tx, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3 border-b border-purple-500/10 hover:bg-purple-900/10 transition-colors">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background:`${tx.color}18`, border:`1px solid ${tx.color}35`, color:tx.color, fontFamily:'Orbitron,monospace', fontSize:'9px' }}>
                      {tx.type[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', color:'#e2e8f0' }}>{tx.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color:tx.color }}>{tx.amount}</div>
                      <div className="text-xs text-slate-600">{tx.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
