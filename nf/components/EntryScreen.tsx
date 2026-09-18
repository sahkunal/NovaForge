'use client'
import{useState}from 'react'
import{useNovaWallet}from '@/lib/hooks/useWallet'
export default function EntryScreen(){
  const{connect}=useNovaWallet()
  const[connecting,setConnecting]=useState(false)
  const handle=async()=>{setConnecting(true);await connect();setConnecting(false)}
  return(
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden" style={{background:'radial-gradient(ellipse at 50% 40%,#0e0720 0%,#03020f 75%)'}}>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(120)].map((_,i)=><div key={i} className="absolute rounded-full" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${Math.random()*2+0.5}px`,height:`${Math.random()*2+0.5}px`,background:i%5===0?'#a78bfa':i%5===1?'#5eead4':i%5===2?'#fbbf24':'#fff',opacity:Math.random()*0.8+0.15,animation:`star-twinkle ${1.5+Math.random()*3}s ease-in-out infinite`,animationDelay:`${Math.random()*4}s`}}/>)}
      </div>
      {[{s:200,x:'4%',y:'8%',c:'#1e40af,#60a5fa,#1e3a5f',d:18},{s:150,x:'76%',y:'6%',c:'#b45309,#fbbf24,#7c2d12',d:24},{s:100,x:'82%',y:'62%',c:'#6d28d9,#a78bfa,#3b0764',d:16},{s:75,x:'3%',y:'70%',c:'#15803d,#4ade80,#052e16',d:20}].map((p,i)=>(
        <div key={i} className="absolute rounded-full pointer-events-none" style={{width:p.s,height:p.s,left:p.x,top:p.y,opacity:0.35,background:`radial-gradient(circle at 32% 32%,${p.c})`,animation:`float ${p.d}s ease-in-out infinite`,animationDelay:`${i*2.5}s`,filter:'blur(0.5px)'}}/>
      ))}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        <div className="mb-8" style={{animation:'float 5s ease-in-out infinite'}}>
          <svg width="100" height="100" viewBox="0 0 140 140"><defs><linearGradient id="elg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="50%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#0f9e8a"/></linearGradient><filter id="egf"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="epg" cx="35%" cy="35%"><stop offset="0%" stopColor="#fff"/><stop offset="20%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#1e0a4e"/></radialGradient></defs><polygon points="70,5 122,33 122,105 70,133 18,105 18,33" fill="none" stroke="url(#elg)" strokeWidth="3" filter="url(#egf)"/><circle cx="70" cy="70" r="28" fill="url(#epg)" filter="url(#egf)"/><ellipse cx="70" cy="70" rx="40" ry="10" fill="none" stroke="rgba(94,234,212,0.75)" strokeWidth="2.5"/><circle cx="70" cy="70" r="8" fill="#fff" opacity="0.9"/><circle cx="70" cy="70" r="4" fill="#7c3aed"/></svg>
        </div>
        <h1 className="mb-1" style={{fontFamily:'Orbitron,monospace',fontSize:'48px',fontWeight:900,letterSpacing:'0.18em',color:'#fff',textShadow:'0 0 50px rgba(124,58,237,0.9)',lineHeight:1.1}}>NOVA<span style={{color:'#0f9e8a',textShadow:'0 0 50px rgba(15,158,138,0.9)'}}>FORGE</span></h1>
        <h2 className="mb-1" style={{fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:700,color:'#e2e8f0',letterSpacing:'0.05em'}}>BUILD. COLONIZE. CONQUER.</h2>
        <p style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#7c3aed',letterSpacing:'0.2em',marginBottom:12}}>ON-CHAIN.</p>
        <p className="text-slate-400 text-sm leading-relaxed mb-8" style={{maxWidth:420}}>A Solana strategy game where every action is real.<br/>Mint planets, generate resources, fight monsters, trade NFTs.<br/><span style={{color:'#0f9e8a'}}>Everything lives on Solana devnet.</span></p>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {['⛏ Mine Resources','⚔️ Fight Monsters','▲ Upgrade Planets','🏪 Trade NFTs','💀 Conquer Worlds'].map(f=><span key={f} className="badge badge-purple" style={{fontSize:'10px',padding:'5px 12px'}}>{f}</span>)}
        </div>
        <button onClick={handle} disabled={connecting} style={{background:'linear-gradient(135deg,#7c3aed,#5b21b6,#0f9e8a)',border:'1px solid rgba(167,139,250,0.4)',borderRadius:14,padding:'16px 52px',fontFamily:'Orbitron,monospace',fontSize:'14px',fontWeight:700,color:'#fff',letterSpacing:'0.1em',cursor:connecting?'not-allowed':'pointer',boxShadow:'0 0 50px rgba(124,58,237,0.5)',transition:'all 0.3s',opacity:connecting?0.7:1,marginBottom:12}}>
          {connecting?<span className="flex items-center gap-3"><svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="14"/></svg>Connecting...</span>:'⬡ Connect Phantom Wallet'}
        </button>
        <p className="text-slate-600 text-xs mb-8">Don't have Phantom? <a href="https://phantom.app" target="_blank" className="text-purple-400 hover:text-purple-300 transition-colors">Download here →</a></p>
        <div className="flex gap-10 pt-6 border-t border-purple-500/15">
          {[['1%','Fee'],['10','Max Planets'],['5','Planet Types'],['4','Monster Tiers']].map(([v,l])=>(
            <div key={l} className="text-center"><div style={{fontFamily:'Orbitron,monospace',fontSize:'20px',fontWeight:700,color:'#7c3aed'}}>{v}</div><div className="text-xs text-slate-500 mt-1">{l}</div></div>
          ))}
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}@keyframes star-twinkle{0%,100%{opacity:0.2}50%{opacity:1}}`}</style>
    </div>
  )
}
