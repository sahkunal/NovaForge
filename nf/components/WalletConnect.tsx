'use client'
import { useNovaWallet } from '@/lib/hooks/useWallet'
export default function WalletConnect(){
  const{connected,publicKey,balance,connect,disconnect}=useNovaWallet()
  if(!connected)return<button onClick={connect} className="btn-primary flex items-center gap-2" style={{padding:'7px 18px',fontSize:'11px'}}><span>◎</span>Connect Wallet</button>
  return(
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{background:'rgba(124,58,237,0.14)',border:'1px solid rgba(124,58,237,0.28)'}}>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
        <span className="text-xs text-white font-mono">{publicKey?.slice(0,4)}...{publicKey?.slice(-4)}</span>
        <span className="text-xs text-slate-500">·</span>
        <span className="text-xs text-purple-300 font-mono font-semibold">{balance.toFixed(2)} ◎</span>
      </div>
      <button onClick={disconnect} className="btn-ghost" style={{padding:'6px 11px',fontSize:'10px',color:'#f43f5e',borderColor:'rgba(244,63,94,0.3)'}}>✕</button>
    </div>
  )
}
