'use client'
import { useState, useEffect, useCallback } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { PROGRAM_ID } from '@/lib/pda'

const RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'

export interface PlayerStats {
  owner: string
  totalPlanets: number
  totalPower: number
  totalMilitary: number
  totalKills: number
  topPlanetType: string
  topRarity: string
  topLevel: number
  colonizedCount: number
  rank: number
}

const TYPE_NAMES = ['Mining','Energy','Luxury','Research','Military']
const RARITY_NAMES = ['Common','Rare','Epic','Legendary']

function parseBasic(data: Buffer) {
  try {
    if (data.length < 187) return null
    return {
      owner:          new PublicKey(data.slice(8,40)).toString(),
      level:          data.readUInt16LE(72),
      power:          data.readUInt32LE(74),
      militaryPower:  data.readUInt32LE(78),
      planetType:     data.readUInt8(82),
      rarity:         data.readUInt8(83),
      colonized:      data.readUInt8(132) !== 0,
      monstersKilled: data.readUInt32LE(166),
    }
  } catch { return null }
}

export function useLeaderboard() {
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date|null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const conn = new Connection(RPC, 'confirmed')
      const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [{ dataSize: 187 }],
      })
      const byOwner = new Map<string, PlayerStats>()
      for (const acc of accounts) {
        const p = parseBasic(Buffer.from(acc.account.data))
        if (!p) continue
        if (!byOwner.has(p.owner)) {
          byOwner.set(p.owner, { owner:p.owner, totalPlanets:0, totalPower:0, totalMilitary:0, totalKills:0, topPlanetType:TYPE_NAMES[p.planetType]||'Mining', topRarity:RARITY_NAMES[p.rarity]||'Common', topLevel:0, colonizedCount:0, rank:0 })
        }
        const s = byOwner.get(p.owner)!
        s.totalPlanets++
        s.totalPower += p.power
        s.totalMilitary += p.militaryPower
        s.totalKills += p.monstersKilled
        s.colonizedCount += p.colonized ? 1 : 0
        if (p.level > s.topLevel) { s.topLevel=p.level; s.topPlanetType=TYPE_NAMES[p.planetType]||'Mining'; s.topRarity=RARITY_NAMES[p.rarity]||'Common' }
      }
      const sorted = Array.from(byOwner.values()).sort((a,b)=>(b.totalKills*200+b.totalPower)-(a.totalKills*200+a.totalPower)).map((p,i)=>({...p,rank:i+1}))
      setPlayers(sorted)
      setLastUpdated(new Date())
    } catch(e) { console.error('Leaderboard error:', e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch(); const id=setInterval(fetch,30000); return()=>clearInterval(id) }, [fetch])
  return { players, loading, lastUpdated, refetch: fetch }
}