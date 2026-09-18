'use client'
import { useState, useEffect, useCallback } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
const RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'
interface WalletState { connected:boolean; publicKey:string|null; balance:number; connect:()=>Promise<void>; disconnect:()=>void }
export function useNovaWallet(): WalletState {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string|null>(null)
  const [balance, setBalance]     = useState(0)

  const fetchBalance = useCallback(async (pk: string) => {
    try {
      const conn = new Connection(RPC, 'confirmed')
      const bal  = await conn.getBalance(new PublicKey(pk))
      setBalance(bal / 1e9)
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const phantom = (window as any).solana
    if (!phantom?.isPhantom) return
    if (phantom.isConnected && phantom.publicKey) {
      const pk = phantom.publicKey.toString()
      setConnected(true); setPublicKey(pk); fetchBalance(pk)
    }
    const onConnect = (pk: PublicKey) => { const s=pk.toString(); setConnected(true); setPublicKey(s); fetchBalance(s) }
    const onDisconnect = () => { setConnected(false); setPublicKey(null); setBalance(0) }
    phantom.on('connect', onConnect)
    phantom.on('disconnect', onDisconnect)
    return () => { phantom.off?.('connect', onConnect); phantom.off?.('disconnect', onDisconnect) }
  }, [fetchBalance])

  const connect = useCallback(async () => {
    const phantom = (window as any).solana
    if (!phantom?.isPhantom) { window.open('https://phantom.app','_blank'); return }
    try {
      const resp = await phantom.connect()
      const pk   = resp.publicKey.toString()
      setConnected(true); setPublicKey(pk); fetchBalance(pk)
    } catch (e) { console.error('connect error:', e) }
  }, [fetchBalance])

  const disconnect = useCallback(() => {
    (window as any).solana?.disconnect?.()
    setConnected(false); setPublicKey(null); setBalance(0)
  }, [])

  return { connected, publicKey, balance, connect, disconnect }
}
