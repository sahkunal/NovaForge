'use client'
import WalletConnect from './WalletConnect'
import { useNovaWallet } from '@/lib/hooks/useWallet'
import { usePlanets } from '@/lib/hooks/usePlanets'
import { formatNumber } from '@/lib/types'
import { useAllPlanetsAlert } from '@/lib/hooks/useAttackTimer'

export default function TopBar(){
  const{connected,publicKey}=useNovaWallet()
  const{planets}=usePlanets(connected?publicKey:null)
  const alerts=useAllPlanetsAlert(planets)
  const t={iron:planets.reduce((a,p)=>a+p.ironBalance,0),gold:planets.reduce((a,p)=>a+p.goldBalance,0),uranium:planets.reduce((a,p)=>a+p.uraniumBalance,0)}
  const topAlert=alerts[0]
  const alertColor=topAlert?.urgency==='attack'?'#f43f5e':topAlert?.urgency==='critical'?'#f87171':topAlert?.urgency==='danger'?'#f97316':'#fbbf24'

  return(
    <div className="fixed top-0 right-0 z-40 flex items-center gap-3 px-5"
      style={{left:64,height:48,background:'rgba(6,4,18,0.94)',borderBottom:`1px solid ${topAlert?`${alertColor}40`:'rgba(124,58,237,0.12)'}`,backdropFilter:'blur(20px)',transition:'border-color 0.5s'}}>
      <span style={{fontFamily:'Orbitron,monospace',fontSize:'14px',fontWeight:700,color:'#7c3aed',letterSpacing:'0.12em'}}>⬡ NOVAFORGE</span>
      <div className="flex-1"/>
      {connected&&planets.length>0&&(
        <div className="flex items-center gap-2 mr-2">
          {[{i:'⚡',v:t.iron,c:'#f59e0b',l:'Fe'},{i:'💧',v:t.gold,c:'#60a5fa',l:'Au'},{i:'☢️',v:t.uranium,c:'#4ade80',l:'U'}].map(({i,v,c,l})=>(
            <div key={l} className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
              style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${c}20`}}>
              <span style={{fontSize:'13px'}}>{i}</span>
              <span style={{color:'#e2e8f0',fontFamily:'JetBrains Mono,monospace',fontSize:'12px',fontWeight:600}}>{formatNumber(v)}</span>
              <span style={{color:'#334155',fontSize:'10px'}}>{l}</span>
            </div>
          ))}
          <div className="w-px h-5 bg-purple-500/20"/>
        </div>
      )}
      <WalletConnect/>
    </div>
  )
}