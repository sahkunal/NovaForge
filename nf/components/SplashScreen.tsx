'use client'
import{useEffect,useState}from'react'
export default function SplashScreen({onDone}:{onDone:()=>void}){
 const[progress,setProgress]=useState(0)
 useEffect(()=>{const start=performance.now();const raf=(t:number)=>{const p=Math.min(1,(t-start)/2200);setProgress(p);if(p<1)requestAnimationFrame(raf);else setTimeout(onDone,250)};requestAnimationFrame(raf)},[onDone])
 return <div className="splash" style={{background:'#020402'}}>
  <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(126,154,104,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(126,154,104,.045) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(circle,black,transparent 75%)'}}/>
  <div className="absolute w-[430px] h-[430px] rounded-full border border-[#7e9a68]/15" style={{boxShadow:'0 0 120px rgba(126,154,104,.06)'}}/>
  <div className="relative z-10 text-center">
   <div className="font-mono text-[8px] tracking-[.4em] text-[#687663] mb-5">NOVA FORGE // INITIALIZING ORBITAL NETWORK</div>
   <div className="font-[Orbitron] text-6xl md:text-8xl font-black tracking-[.18em] text-[#e7eee2]">NOVA<span className="text-[#91aa76]">FORGE</span></div>
   <div className="mt-5 font-mono text-[9px] tracking-[.32em] text-[#667360]">BUILD · COLONIZE · CONQUER · ON-CHAIN</div>
   <div className="w-[300px] mx-auto mt-9"><div className="h-px bg-[#526548]/25 overflow-hidden"><div className="h-full bg-[#91aa76]" style={{width:`${progress*100}%`,boxShadow:'0 0 12px #91aa76'}}/></div><div className="mt-3 flex justify-between font-mono text-[7px] tracking-[.18em] text-[#52604d]"><span>BOOT SEQUENCE</span><span>{Math.floor(progress*100).toString().padStart(3,'0')}%</span></div></div>
  </div>
 </div>
}
