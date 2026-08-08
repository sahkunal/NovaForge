'use client'
import dynamic from 'next/dynamic'
import { useNovaWallet } from '@/lib/hooks/useWallet'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import MarketplaceTable from '@/components/MarketplaceTable'
import EntryScreen from '@/components/EntryScreen'
import { MOCK_LISTINGS } from '@/lib/types'

const StarField = dynamic(() => import('@/components/StarField'), { ssr: false })

export default function Marketplace() {
  const { connected } = useNovaWallet()
  if (!connected) return <EntryScreen />

  const vol = MOCK_LISTINGS.reduce((a,l) => a + l.priceSOL, 0)

  return (
    <div className="fixed inset-0 overflow-hidden">
      <StarField />
      <NavigationBar />
      <TopBar />
      <div className="absolute inset-0 overflow-y-auto" style={{ left:64, top:48 }}>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label:'Listed Planets', value:MOCK_LISTINGS.length, color:'#a78bfa' },
              { label:'Total Volume',   value:`${vol.toFixed(1)} ◎`, color:'#5eead4' },
              { label:'Protocol Fee',   value:'1%',  color:'#fbbf24' },
            ].map(({ label, value, color }) => (
              <div key={label} className="panel p-4">
                <div className="text-xs text-slate-500 mb-1" style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', letterSpacing:'0.1em' }}>{label.toUpperCase()}</div>
                <div className="text-2xl font-bold" style={{ color, fontFamily:'Orbitron,monospace' }}>{value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:'13px', fontWeight:700, color:'#e2e8f0', letterSpacing:'0.1em' }}>🏪 MARKETPLACE</h2>
            <span className="text-xs text-slate-500 font-mono">Live on-chain listings</span>
          </div>
          <MarketplaceTable />
        </div>
      </div>
    </div>
  )
}
