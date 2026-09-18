'use client'
import{useEffect,useState}from 'react'
export default function SplashScreen({onDone}:{onDone:()=>void}){
  const[phase,setPhase]=useState<'logo'|'tagline'|'fade'>('logo')
  useEffect(()=>{const t1=setTimeout(()=>setPhase('tagline'),1400),t2=setTimeout(()=>setPhase('fade'),3000),t3=setTimeout(()=>onDone(),3600);return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3)}},[onDone])
  return(
    <div className={`splash transition-opacity duration-700 ${phase==='fade'?'opacity-0 pointer-events-none':'opacity-100'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_,i)=><div key={i} className="absolute rounded-full" style={{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${Math.random()*2+0.5}px`,height:`${Math.random()*2+0.5}px`,background:i%4===0?'#a78bfa':i%4===1?'#5eead4':i%4===2?'#fbbf24':'#fff',opacity:Math.random()*0.8+0.2,animation:`star-twinkle ${1.5+Math.random()*2}s ease-in-out infinite`,animationDelay:`${Math.random()*3}s`}}/>)}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[320,240,160].map((s,i)=><div key={i} className="absolute rounded-full border border-purple-500/10" style={{width:s,height:s,animation:`${i%2===0?'spin-slow':'spin-rev'} ${18+i*10}s linear infinite`}}/>)}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className={`transition-all duration-1000 ${phase==='logo'?'scale-100 opacity-100':'scale-110 opacity-100'}`} style={{animation:'float 4s ease-in-out infinite'}}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="50%" stopColor="#5b21b6"/><stop offset="100%" stopColor="#0f9e8a"/></linearGradient><filter id="sf"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="pg" cx="35%" cy="35%"><stop offset="0%" stopColor="#fff"/><stop offset="20%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#1e0a4e"/></radialGradient></defs>
            <polygon points="70,6 122,36 122,104 70,134 18,104 18,36" fill="none" stroke="url(#sg)" strokeWidth="2.5" filter="url(#sf)"/>
            <polygon points="70,22 110,44 110,96 70,118 30,96 30,44" fill="rgba(124,58,237,0.08)" stroke="rgba(167,139,250,0.3)" strokeWidth="1.5"/>
            <circle cx="70" cy="70" r="28" fill="url(#pg)" filter="url(#sf)"/>
            <ellipse cx="70" cy="70" rx="40" ry="10" fill="none" stroke="rgba(94,234,212,0.8)" strokeWidth="2.5"/>
            <circle cx="70" cy="70" r="8" fill="#fff" opacity="0.9"/><circle cx="70" cy="70" r="4" fill="#7c3aed"/>
          </svg>
        </div>
        <h1 style={{fontFamily:'Orbitron,monospace',fontSize:'52px',fontWeight:900,letterSpacing:'0.2em',color:'#fff',textShadow:'0 0 50px rgba(124,58,237,0.9)',lineHeight:1}}>NOVA<span style={{color:'#0f9e8a',textShadow:'0 0 50px rgba(15,158,138,0.9)'}}>FORGE</span></h1>
        <div className={`transition-all duration-800 ${phase==='logo'?'opacity-0 translate-y-3':'opacity-100 translate-y-0'}`}>
          <p style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#a78bfa',letterSpacing:'0.3em',textAlign:'center'}}>BUILD · COLONIZE · CONQUER · ON-CHAIN</p>
        </div>
        <div className={`transition-all duration-600 ${phase==='logo'?'opacity-0':'opacity-100'}`} style={{width:220}}>
          <div style={{height:2,background:'rgba(124,58,237,0.2)',borderRadius:2,overflow:'hidden',marginTop:8}}><div style={{height:'100%',background:'linear-gradient(to right,#7c3aed,#0f9e8a)',animation:'loadbar 2.2s ease-out forwards',borderRadius:2}}/></div>
          <p style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#334155',letterSpacing:'0.2em',textAlign:'center',marginTop:8}}>INITIALIZING FORGE ENGINE...</p>
        </div>
      </div>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes spin-rev{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}@keyframes star-twinkle{0%,100%{opacity:0.2}50%{opacity:1}}@keyframes loadbar{from{width:0}to{width:100%}}`}</style>
    </div>
  )
}
