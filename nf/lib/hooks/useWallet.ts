'use client'
import{useState,useEffect,useCallback}from'react'
import{Connection,PublicKey}from'@solana/web3.js'
const RPC=process.env.NEXT_PUBLIC_RPC_URL||'https://api.devnet.solana.com'
interface WalletState{connected:boolean;publicKey:string|null;balance:number;connect:()=>Promise<void>;disconnect:()=>void}
export function useNovaWallet():WalletState{
  const[connected,setConnected]=useState(false)
  const[publicKey,setPublicKey]=useState<string|null>(null)
  const[balance,setBalance]=useState(0)
  const fetchBalance=useCallback(async(pk:string)=>{try{const conn=new Connection(RPC,'confirmed');setBalance(await conn.getBalance(new PublicKey(pk))/1e9)}catch{}},[])
  useEffect(()=>{
    if(typeof window==='undefined')return
    const p=(window as any).solana
    if(!p?.isPhantom)return
    if(p.isConnected&&p.publicKey){const pk=p.publicKey.toString();setConnected(true);setPublicKey(pk);fetchBalance(pk)}
    const onC=(pk:PublicKey)=>{const s=pk.toString();setConnected(true);setPublicKey(s);fetchBalance(s)}
    const onD=()=>{setConnected(false);setPublicKey(null);setBalance(0)}
    p.on('connect',onC);p.on('disconnect',onD)
    return()=>{p.off?.('connect',onC);p.off?.('disconnect',onD)}
  },[fetchBalance])
  const connect=useCallback(async()=>{const p=(window as any).solana;if(!p?.isPhantom){window.open('https://phantom.app','_blank');return}try{const r=await p.connect();const pk=r.publicKey.toString();setConnected(true);setPublicKey(pk);fetchBalance(pk)}catch(e){console.error(e)}},[fetchBalance])
  const disconnect=useCallback(()=>{(window as any).solana?.disconnect?.();setConnected(false);setPublicKey(null);setBalance(0)},[])
  return{connected,publicKey,balance,connect,disconnect}
}
