'use client'
import { useState, useEffect } from 'react'
import { Planet, MOCK_PLANETS } from '@/lib/types'

// Real implementation will fetch from Solana RPC
// For now returns mock data — replace with Anchor account fetch
export function usePlanets(walletAddress: string | null) {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) { setPlanets([]); return }
    setLoading(true)
    // Simulate RPC fetch delay
    const t = setTimeout(() => {
      // TODO: Replace with real Anchor getProgramAccounts call
      // const conn = new Connection(process.env.NEXT_PUBLIC_RPC_URL!)
      // const provider = new AnchorProvider(conn, wallet, {})
      // const program = new Program(IDL, PROGRAM_ID, provider)
      // const accounts = await program.account.planet.all([
      //   { memcmp: { offset: 8, bytes: walletAddress } }
      // ])
      setPlanets(MOCK_PLANETS)
      setLoading(false)
    }, 800)
    return () => clearTimeout(t)
  }, [walletAddress])

  const refetch = () => {
    if (!walletAddress) return
    setLoading(true)
    setTimeout(() => { setPlanets([...MOCK_PLANETS]); setLoading(false) }, 400)
  }

  return { planets, loading, error, refetch }
}

export function usePlanet(publicKey: string | null) {
  const [planet, setPlanet] = useState<Planet | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!publicKey) { setPlanet(null); return }
    setLoading(true)
    setTimeout(() => {
      setPlanet(MOCK_PLANETS.find(p => p.publicKey === publicKey) ?? null)
      setLoading(false)
    }, 400)
  }, [publicKey])

  return { planet, loading }
}
