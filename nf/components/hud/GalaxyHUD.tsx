'use client'
import React from 'react'

type Props={planetCount:number;threatCount:number;solBalance:number;walletAddress:string|null;connected?:boolean}
export default function GalaxyHUD({planetCount,threatCount,solBalance,walletAddress,connected=true}:Props){
 const wallet=walletAddress?`${walletAddress.slice(0,5)}…${walletAddress.slice(-4)}`:'NO WALLET'
 return <div className="nf-hud-layer">
   <div className="nf-brand"><div className="nf-brand-title">NOVAFORGE</div><div className="nf-brand-sub">PLANETARY CONQUEST <span>//</span> DEVNET</div></div>
   <div className="nf-wallet"><i className={connected?'online':'offline'}/><span>{connected?'CHAIN LINK':'OFFLINE'}</span><b>{wallet}</b><strong>{solBalance.toFixed(2)} SOL</strong></div>
   <div className="nf-command"><div className="nf-eyebrow">ORBITAL COMMAND <span>//</span> SECTOR 07</div><div className="nf-command-title">GALACTIC CONTROL</div><div className="nf-stat-row"><div><span>PLANETS</span><b>{planetCount}</b></div><div><span>THREATS</span><b className={threatCount?'danger':''}>{threatCount}</b></div><div><span>SOL</span><b>{solBalance.toFixed(2)}</b></div></div><div className="nf-sync">● ON-CHAIN STATE SYNCHRONIZED</div></div>
 </div>
}
