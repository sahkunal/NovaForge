'use client'
import { useState, useEffect, useCallback } from 'react'

export interface WalletState {
  connected: boolean
  publicKey: string | null
  balance: number
  connect: () => Promise<void>
  disconnect: () => void
}

export function useNovaWallet(): WalletState {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)

  const connect = useCallback(async () => {
    try {
      const phantom = (window as any).solana
      if (!phantom?.isPhantom) {
        window.open('https://phantom.app/', '_blank')
        return
      }
      const resp = await phantom.connect()
      setPublicKey(resp.publicKey.toString())
      setConnected(true)
      // Mock balance for now — replace with real RPC call
      setBalance(12.4)
    } catch (e) {
      console.error('Wallet connect failed:', e)
    }
  }, [])

  const disconnect = useCallback(() => {
    try { (window as any).solana?.disconnect() } catch {}
    setConnected(false)
    setPublicKey(null)
    setBalance(0)
  }, [])

  useEffect(() => {
    const phantom = (window as any).solana
    if (phantom?.isPhantom) {
      phantom.on('connect', (pk: any) => { setPublicKey(pk.toString()); setConnected(true) })
      phantom.on('disconnect', () => { setConnected(false); setPublicKey(null) })
      // Auto-connect if previously connected
      phantom.connect({ onlyIfTrusted: true }).catch(() => {})
    }
  }, [])

  return { connected, publicKey, balance, connect, disconnect }
}
