'use client'
import { formatNumber } from '@/lib/utils/format'
import WalletConnect from './WalletConnect'
import { useNovaWallet } from '@/lib/hooks/useWallet'
import { MOCK_PLANETS } from '@/lib/types'

export default function TopBar() {
  const { connected } = useNovaWallet()
  const totals = {
    iron: MOCK_PLANETS.reduce((a,p)=>a+p.ironBalance,0),
    gold: MOCK_PLANETS.reduce((a,p)=>a+p.goldBalance,0),
    uranium: MOCK_PLANETS.reduce((a,p)=>a+p.uraniumBalance,0),
  }

  return (
    <div className="fixed top-0 right-0 z-40 flex items-center gap-3 px-5 py-3"
      style={{ left:64, background:'rgba(6,6,20,0.92)', borderBottom:'1px solid rgba(124,58,237,0.12)', backdropFilter:'blur(16px)', height:48 }}>
      <span style={{ fontFamily:'Orbitron,monospace', fontSize:'13px', fontWeight:700, color:'#7c3aed', letterSpacing:'0.12em' }}>⬡ NOVAFORGE</span>
      <div className="flex-1" />
      {connected && (
        <div className="flex items-center gap-2">
          {[
            { icon:'⬡', val:totals.iron, color:'#f59e0b', label:'Fe' },
            { icon:'◈', val:totals.gold, color:'#eab308', label:'Au' },
            { icon:'⬟', val:totals.uranium, color:'#22d3ee', label:'U' },
          ].map(({ icon, val, color, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
              style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${color}22` }}>
              <span style={{ color, fontSize:'12px' }}>{icon}</span>
              <span style={{ color:'#e2e8f0', fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{formatNumber(val)}</span>
              <span style={{ color:'#475569', fontSize:'10px' }}>{label}</span>
            </div>
          ))}
          <div className="w-px h-4 bg-purple-500/20" />
        </div>
      )}
      <WalletConnect />
    </div>
  )
}
