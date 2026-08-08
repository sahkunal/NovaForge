'use client'
import { useState, useEffect } from 'react'
import { useNovaWallet } from '@/lib/hooks/useWallet'

export default function EntryScreen() {
  const { connect, connected } = useNovaWallet()
  const [connecting, setConnecting] = useState(false)
  const [stars] = useState(() =>
    Array.from({ length: 120 }, (_, i) => ({
      x: Math.random() * 100, y: Math.random() * 100,
      r: Math.random() * 1.8 + 0.3,
      a: Math.random() * 0.8 + 0.2,
      d: Math.random() * 3 + 1.5,
      c: i % 4 === 0 ? '#a78bfa' : i % 4 === 1 ? '#5eead4' : i % 4 === 2 ? '#fbbf24' : '#fff',
    }))
  )

  const handleConnect = async () => {
    setConnecting(true)
    await connect()
    setConnecting(false)
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
      style={{ background:'radial-gradient(ellipse at 50% 40%, #0f0d2a 0%, #060614 70%)' }}>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s, i) => (
          <div key={i} className="absolute rounded-full"
            style={{ left:`${s.x}%`, top:`${s.y}%`, width:`${s.r*2}px`, height:`${s.r*2}px`,
              background:s.c, opacity:s.a, animation:`star-twinkle ${s.d}s ease-in-out infinite`, animationDelay:`${Math.random()*3}s` }} />
        ))}
      </div>

      {/* Floating planet orbs */}
      {[
        { size:180, x:'8%',  y:'15%', color:'#1e40af,#3b82f6', speed:18, opacity:0.6 },
        { size:120, x:'80%', y:'10%', color:'#b45309,#fbbf24', speed:22, opacity:0.5 },
        { size:90,  x:'85%', y:'70%', color:'#6d28d9,#a78bfa', speed:16, opacity:0.4 },
        { size:60,  x:'5%',  y:'75%', color:'#15803d,#4ade80', speed:20, opacity:0.45 },
        { size:140, x:'45%', y:'80%', color:'#be123c,#fb7185', speed:25, opacity:0.3 },
      ].map((p, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width:p.size, height:p.size, left:p.x, top:p.y, opacity:p.opacity,
            background:`radial-gradient(circle at 35% 35%, ${p.color})`,
            boxShadow:`0 0 ${p.size*0.4}px rgba(124,58,237,0.2)`,
            animation:`float ${p.speed}s ease-in-out infinite`, animationDelay:`${i*2}s`,
            filter:'blur(1px)' }} />
      ))}

      {/* Nebula glow */}
      <div className="absolute inset-0 pointer-events-none">
        {[['30%','20%','#7c3aed'],['70%','60%','#0f9e8a'],['50%','80%','#7c3aed']].map(([x,y,c],i)=>(
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{ width:400, height:400, left:x, top:y, transform:'translate(-50%,-50%)',
              background:`radial-gradient(circle, ${c}08 0%, transparent 70%)` }}/>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Logo */}
        <div className="mb-8 animate-float" style={{ animationDuration:'5s' }}>
          <svg width="96" height="96" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed"/><stop offset="50%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#0f9e8a"/>
              </linearGradient>
              <filter id="ef"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <polygon points="60,6 104,30 104,90 60,114 16,90 16,30" fill="none" stroke="url(#eg)" strokeWidth="2.5" filter="url(#ef)"/>
            <polygon points="60,20 96,40 96,80 60,100 24,80 24,40" fill="rgba(124,58,237,0.1)" stroke="rgba(167,139,250,0.3)" strokeWidth="1"/>
            <circle cx="60" cy="60" r="26" fill="url(#eg)" filter="url(#ef)"/>
            <ellipse cx="60" cy="60" rx="37" ry="9" fill="none" stroke="rgba(94,234,212,0.7)" strokeWidth="2.5"/>
            <circle cx="60" cy="60" r="7" fill="#fff"/>
            <circle cx="60" cy="60" r="3" fill="#7c3aed"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="mb-2" style={{ fontFamily:'Orbitron,monospace', fontSize:'48px', fontWeight:900,
          letterSpacing:'0.18em', color:'#fff', textShadow:'0 0 40px rgba(124,58,237,0.9), 0 0 80px rgba(124,58,237,0.4)' }}>
          NOVA<span style={{ color:'#0f9e8a', textShadow:'0 0 40px rgba(15,158,138,0.9)' }}>FORGE</span>
        </h1>

        <p style={{ fontFamily:'Orbitron,monospace', fontSize:'11px', color:'#a78bfa', letterSpacing:'0.3em', marginBottom:24 }}>
          ON-CHAIN IDLE STRATEGY · SOLANA
        </p>

        <p className="text-slate-400 text-sm leading-relaxed mb-10" style={{ maxWidth:380 }}>
          Mint Planet NFTs. Colonize worlds. Generate resources.<br/>
          Defend against monster attacks. Trade on the marketplace.<br/>
          <span style={{ color:'#5eead4' }}>Your empire lives entirely on Solana.</span>
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {['⛏ Mine Resources','⚔️ Fight Monsters','▲ Upgrade Planets','🏪 Trade NFTs','◎ Earn SOL'].map(f => (
            <span key={f} className="badge badge-purple" style={{ fontSize:'10px', padding:'4px 10px' }}>{f}</span>
          ))}
        </div>

        {/* Connect button */}
        <button onClick={handleConnect} disabled={connecting}
          className="relative overflow-hidden mb-4"
          style={{ background:'linear-gradient(135deg,#7c3aed,#5b21b6,#0f9e8a)',
            border:'1px solid rgba(167,139,250,0.4)', borderRadius:12, padding:'16px 48px',
            fontFamily:'Orbitron,monospace', fontSize:'14px', fontWeight:700, color:'#fff',
            letterSpacing:'0.1em', cursor:'pointer', boxShadow:'0 0 40px rgba(124,58,237,0.5)',
            transition:'all 0.3s', opacity: connecting ? 0.7 : 1 }}>
          {connecting ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="14"/>
              </svg>
              Connecting...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 128 128" fill="white">
                <path d="M64 8C33.1 8 8 33.1 8 64s25.1 56 56 56 56-25.1 56-56S94.9 8 64 8z"/>
              </svg>
              Connect Phantom Wallet
            </span>
          )}
          {/* Shimmer */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)',
              animation:'shimmer 2s infinite', backgroundSize:'200% 100%' }}/>
        </button>

        <p className="text-slate-600 text-xs">Don't have Phantom? <a href="https://phantom.app" target="_blank" className="text-purple-400 hover:text-purple-300 transition-colors">Download here →</a></p>

        {/* Stats bar */}
        <div className="flex gap-8 mt-12 pt-6 border-t border-purple-500/15">
          {[['1%','Marketplace Fee'],['10','Max Planets'],['5','Planet Types'],['4','Monster Tiers']].map(([v,l])=>(
            <div key={l} className="text-center">
              <div style={{ fontFamily:'Orbitron,monospace', fontSize:'20px', fontWeight:700, color:'#7c3aed' }}>{v}</div>
              <div className="text-xs text-slate-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes star-twinkle{0%,100%{opacity:0.3}50%{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
      `}</style>
    </div>
  )
}
