'use client'
import { useCallback, useState } from 'react'

export type ActionStatus = 'idle' | 'pending' | 'success' | 'error'

// Stub action hooks — wire to real Anchor CPIs when deploying
// Each returns { execute, status, error }

export function useColonize() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (planetPda: string) => {
    setStatus('pending')
    setError(null)
    try {
      // TODO: const tx = await program.methods.colonizePlanet().accounts({ owner, planet: planetPda }).rpc()
      await new Promise(r => setTimeout(r, 1200)) // sim tx time
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (e: any) {
      setError(e.message)
      setStatus('error')
    }
  }, [])

  return { execute, status, error }
}

export function useClaimResources() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const execute = useCallback(async (planetPda: string) => {
    setStatus('pending')
    try {
      await new Promise(r => setTimeout(r, 1500))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch { setStatus('error') }
  }, [])
  return { execute, status }
}

export function useUpgradePlanet() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const execute = useCallback(async (planetPda: string) => {
    setStatus('pending')
    try {
      await new Promise(r => setTimeout(r, 1800))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch { setStatus('error') }
  }, [])
  return { execute, status }
}

export function useUpgradeMilitary() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const execute = useCallback(async (planetPda: string) => {
    setStatus('pending')
    try {
      await new Promise(r => setTimeout(r, 1500))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch { setStatus('error') }
  }, [])
  return { execute, status }
}

export function useListPlanet() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const execute = useCallback(async (planetPda: string, assetKey: string, priceSOL: number) => {
    setStatus('pending')
    try {
      await new Promise(r => setTimeout(r, 1800))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch { setStatus('error') }
  }, [])
  return { execute, status }
}

export function useBuyPlanet() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const execute = useCallback(async (listingPda: string) => {
    setStatus('pending')
    try {
      await new Promise(r => setTimeout(r, 2000))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch { setStatus('error') }
  }, [])
  return { execute, status }
}

export function useRepairPlanet() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const execute = useCallback(async (planetPda: string) => {
    setStatus('pending')
    try {
      await new Promise(r => setTimeout(r, 1500))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch { setStatus('error') }
  }, [])
  return { execute, status }
}
