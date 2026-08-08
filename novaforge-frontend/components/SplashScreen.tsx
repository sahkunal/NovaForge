'use client'
import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'fade'>('logo')
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1400)
    const t2 = setTimeout(() => setPhase('fade'), 3000)
    const t3 = setTimeout(() => onDone(), 3600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])
  return (
    <div className={`splash transition-opacity duration-700 ${phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(ellipse at center, #0f0d2a 0%, #060614 80%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${Math.random()*2+0.5}px`, height: `${Math.random()*2+0.5}px`,
              left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
              background: i%3===0?'#a78bfa':i%3===1?'#5eead4':'#ffffff',
              opacity: Math.random()*0.8+0.2,
              animation: `star-twinkle ${2+Math.random()*2}s ease-in-out infinite`,
              animationDelay: `${Math.random()*3}s`
            }} />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[96,72,48].map((s,i) => (
          <div key={i} className="absolute rounded-full border border-purple-500/10"
            style={{ width:s*4, height:s*4, animation:`spin ${20+i*8}s linear infinite`, animationDirection: i%2===0?'normal':'reverse' }} />
        ))}
      </div>
      <div className="relative flex flex-col items-center gap-6 z-10">
        <div className={`transition-all duration-1000 ${phase==='logo'?'scale-100 opacity-100':'scale-110 opacity-100'}`}>
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ animation:'float 4s ease-in-out infinite' }}>
            <defs>
              <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed"/><stop offset="50%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#0f9e8a"/>
              </linearGradient>
              <filter id="gf"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <polygon points="70,6 122,36 122,104 70,134 18,104 18,36" fill="none" stroke="url(#hg)" strokeWidth="2" filter="url(#gf)"/>
            <polygon points="70,22 106,42 106,92 70,112 34,92 34,42" fill="rgba(124,58,237,0.08)" stroke="rgba(167,139,250,0.3)" strokeWidth="1"/>
            <circle cx="70" cy="70" r="28" fill="url(#hg)" filter="url(#gf)"/>
            <ellipse cx="70" cy="70" rx="40" ry="10" fill="none" stroke="rgba(94,234,212,0.7)" strokeWidth="2.5"/>
            <circle cx="70" cy="70" r="7" fill="#ffffff"/>
            <circle cx="70" cy="70" r="3" fill="#7c3aed"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontFamily:'Orbitron,monospace', fontSize:'52px', fontWeight:900, letterSpacing:'0.22em', color:'#fff', textShadow:'0 0 40px rgba(124,58,237,0.8)' }}>
            NOVA<span style={{ color:'#0f9e8a' }}>FORGE</span>
          </h1>
        </div>
        <div className={`transition-all duration-800 ${phase==='logo'?'opacity-0 translate-y-3':'opacity-100 translate-y-0'}`}>
          <p style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'12px', letterSpacing:'0.35em', color:'#a78bfa', textAlign:'center' }}>
            ON-CHAIN · IDLE STRATEGY · SOLANA
          </p>
        </div>
        <div className={`transition-all duration-600 ${phase==='logo'?'opacity-0':'opacity-100'}`} style={{ width:200 }}>
          <div style={{ height:1, background:'rgba(124,58,237,0.3)', borderRadius:1, overflow:'hidden', marginTop:8 }}>
            <div style={{ height:'100%', background:'linear-gradient(to right,#7c3aed,#0f9e8a)', animation:'loadbar 2s ease-out forwards', borderRadius:1 }}/>
          </div>
          <p style={{ fontFamily:'Orbitron,monospace', fontSize:'9px', color:'#475569', letterSpacing:'0.2em', textAlign:'center', marginTop:8 }}>INITIALIZING FORGE ENGINE...</p>
        </div>
      </div>
      <style>{`@keyframes loadbar{from{width:0}to{width:100%}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes star-twinkle{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  )
}
