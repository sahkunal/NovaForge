'use client'
import WalletConnect from'./WalletConnect'
import{useNovaWallet}from'@/lib/hooks/useWallet'
import{usePlanets}from'@/lib/hooks/usePlanets'
import{formatNumber}from'@/lib/types'
export default function TopBar(){
 const{connected,publicKey}=useNovaWallet();const{planets}=usePlanets(connected?publicKey:null)
 const t={iron:planets.reduce((a,p)=>a+p.ironBalance,0),gold:planets.reduce((a,p)=>a+p.goldBalance,0),uranium:planets.reduce((a,p)=>a+p.uraniumBalance,0)}
 return <div className="nf-topbar fixed top-0 right-0 z-40 flex items-center gap-3 px-5" style={{left:64,height:54,backdropFilter:'blur(18px)'}}>
   <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-[#91b875]" style={{boxShadow:'0 0 12px #91b875'}}/><span className="font-[Orbitron] text-[13px] font-bold tracking-[.16em] text-[#dce4d6]">NOVA<span className="text-[#91aa76]">FORGE</span></span><span className="hidden md:inline font-mono text-[7px] tracking-[.22em] text-[#566252]">COMMAND NETWORK</span></div>
   <div className="flex-1"/>
   {connected&&planets.length>0&&<div className="flex items-center gap-1.5 mr-2">{[['FE',t.iron,'#a8bf8e'],['AU',t.gold,'#c4a56a'],['U',t.uranium,'#91b875']].map(([l,v,c])=><div key={String(l)} className="px-3 py-1.5 border border-[#7e9a68]/15 bg-[#7e9a68]/[.035]" style={{color:String(c)}}><span className="font-mono text-[8px] tracking-[.12em]">{l}</span><b className="ml-2 font-mono text-[11px] text-[#dce4d6]">{formatNumber(Number(v))}</b></div>)}</div>}
   <WalletConnect/>
 </div>
}
