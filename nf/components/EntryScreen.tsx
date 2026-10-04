'use client'
import{useState}from'react'
import{useNovaWallet}from'@/lib/hooks/useWallet'

export default function EntryScreen(){
 const{connect}=useNovaWallet()
 const[connecting,setConnecting]=useState(false)
 const handle=async()=>{setConnecting(true);await connect();setConnecting(false)}
 return <div className="nf-entry">
   <div className="nf-entry-grid"/><div className="nf-entry-vignette"/><div className="nf-entry-core"/>
   <div className="absolute top-7 left-8 font-mono text-[8px] tracking-[.3em] text-[#566252]">NOVA FORGE // SOLANA DEVNET</div>
   <div className="absolute top-7 right-8 font-mono text-[8px] tracking-[.25em] text-[#566252]">SYSTEM STATUS <span className="text-[#91b875]">● ONLINE</span></div>
   <main className="min-h-full flex items-center justify-center px-5 py-16">
    <section className="nf-entry-panel">
      <div className="nf-entry-label">ORBITAL COLONIZATION PROTOCOL // 07</div>
      <h1 className="nf-entry-title">NOVA<span>FORGE</span></h1>
      <div className="nf-entry-rule"/>
      <p className="nf-entry-copy">Build an economy. Claim worlds. Survive hostile entities. Every planet, upgrade and settlement is an on-chain asset.</p>
      <div className="nf-entry-actions">
       <button onClick={handle} disabled={connecting} className="nf-connect">{connecting?'ESTABLISHING LINK…':'ENTER THE FORGE  →'}</button>
       <span className="font-mono text-[8px] tracking-[.14em] text-[#566252]">PHANTOM // READY</span>
      </div>
      <div className="nf-entry-metrics">{[['01','WORLD OWNERSHIP'],['02','RESOURCE ECONOMY'],['03','HOSTILE CONTACT'],['04','ON-CHAIN TRADE']].map(([n,l])=><div key={n}><b>{n}</b><span>{l}</span></div>)}</div>
    </section>
   </main>
 </div>
}
