'use client'
import { useState, useEffect, useCallback } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { Planet } from '@/lib/types'
import { PROGRAM_ID } from '@/lib/pda'

const RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'

function parsePlanet(data: Buffer, pk: string): Planet | null {
  try {

    let o = 8
    const pk32 = () => { const v = new PublicKey(data.slice(o, o+32)).toString(); o+=32; return v }
    const u8   = () => { const v = data.readUInt8(o); o+=1; return v }
    const u16  = () => { const v = data.readUInt16LE(o); o+=2; return v }
    const u32  = () => { const v = data.readUInt32LE(o); o+=4; return v }
    const u64  = () => { const lo=data.readUInt32LE(o), hi=data.readUInt32LE(o+4); o+=8; return hi*0x100000000+lo }
    const i64  = () => { const lo=data.readUInt32LE(o), hi=data.readInt32LE(o+4); o+=8; return hi*0x100000000+lo }
    const bool = () => { const v = data.readUInt8(o) !== 0; o+=1; return v }
    const typeMap:   Record<number,string> = {0:'Mining',1:'Energy',2:'Luxury',3:'Research',4:'Military'}
    const rarityMap: Record<number,string> = {0:'Common',1:'Rare',2:'Epic',3:'Legendary'}

    const owner          = pk32()
    const asset          = pk32()
    const level          = u16()
    const power          = u32()
    const militaryPower  = u32()
    const planetTypeIdx  = u8()
    const rarityIdx      = u8()
    const ironBalance    = u64()
    const goldBalance    = u64()
    const uraniumBalance = u64()
    const productionRate = u64()
    const population     = u64()
    const researchers    = u64()
    const colonized      = bool()
    const lastClaimTs    = i64()   // CORRECT ORDER: last_claim_ts before inactive
    const createdAt      = i64()
    const bump           = u8()
    const threatLevel    = u8()
    const inactive       = bool()  // inactive comes AFTER created_at/bump/threat_level
    const listed         = bool()
    const price          = u64()
    const monsterPower   = u32()
    const monsterTier    = u8()
    const monstersKilled = u32()
    const lastMonsterKill= i64()   // EXTRA FIELD in struct
    const productionBoost= u8()
    const boostExpiry    = i64()

    return {
      publicKey: pk, asset, owner, level, power, militaryPower,
      planetType: (typeMap[planetTypeIdx] || 'Mining') as any,
      rarity: (rarityMap[rarityIdx] || 'Common') as any,
      ironBalance, goldBalance, uraniumBalance,
      productionRate, population, researchers,
      colonized, inactive, listed, price,
      lastClaimTs, createdAt, threatLevel,
      monsterPower, monsterTier, monstersKilled,
      productionBoost, boostExpiry,
    }
  } catch(e) {
    console.error('Planet parse error:', e)
    return null
  }
}

// Known minted planets - add here for direct fetch fallback
const KNOWN_PLANETS: string[] = [
  '2ag4kRaz2rUUyY5AL53FAq4VNeaCJtwJJzpen8BdrPsH',
  '99zgi7M9WGQCtJZYEfV5mGuoivbd9oPakJozTWLegQEY',
]

export function usePlanets(walletAddress: string | null) {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string|null>(null)

  const fetch = useCallback(async () => {
    if (!walletAddress || typeof window === 'undefined') { setPlanets([]); return }
    setLoading(true); setError(null)
    try {
      const conn = new Connection(RPC, 'confirmed')
      const ownerPk = new PublicKey(walletAddress)

      // Strategy 1: getProgramAccounts with size+owner filter
      console.log('Fetching planets, owner:', walletAddress)
      let found: Planet[] = []

      for (const size of [187]) {
        const accs = await conn.getProgramAccounts(PROGRAM_ID, {
          commitment: 'confirmed',
          filters: [
            { dataSize: size },
            { memcmp: { offset: 8, bytes: ownerPk.toBase58() } },
          ],
        })
        if (accs.length > 0) {
          console.log(`Found ${accs.length} accounts at size ${size}`)
          found = accs
            .map(a => parsePlanet(Buffer.from(a.account.data), a.pubkey.toString()))
            .filter((p): p is Planet => p !== null)
          break
        }
      }

      // Strategy 2: no size filter at all
      if (found.length === 0) {
        console.log('Trying no size filter...')
        const accs = await conn.getProgramAccounts(PROGRAM_ID, {
          commitment: 'confirmed',
          filters: [{ memcmp: { offset: 8, bytes: ownerPk.toBase58() } }],
        })
        console.log(`No-size-filter: ${accs.length} accounts`)
        accs.forEach(a => console.log(`  size=${a.account.data.length} key=${a.pubkey.toString().slice(0,8)}`))
        found = accs
          .map(a => parsePlanet(Buffer.from(a.account.data), a.pubkey.toString()))
          .filter((p): p is Planet => p !== null)
      }

      // Strategy 3: direct fetch of known planet PDAs
      if (found.length === 0 && KNOWN_PLANETS.length > 0) {
        console.log('Trying direct fetch of known planets...')
        for (const pda of KNOWN_PLANETS) {
          try {
            const info = await conn.getAccountInfo(new PublicKey(pda), 'confirmed')
            if (info?.data) {
              console.log(`Direct fetch ${pda.slice(0,8)}: size=${info.data.length}`)
              const p = parsePlanet(Buffer.from(info.data), pda)
              if (p && p.owner === walletAddress) {
                found.push(p)
              } else if (p) {
                console.log(`Owner mismatch: got ${p.owner.slice(0,8)}, expected ${walletAddress.slice(0,8)}`)
              }
            }
          } catch(e) { console.log(`Direct fetch ${pda.slice(0,8)} failed:`, e) }
        }
      }

      console.log(`Final: ${found.length} planets`)
      setPlanets(found)
    } catch(e: any) {
      console.error('Fetch failed:', e)
      setError(e.message)
      setPlanets([])
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => { fetch() }, [fetch])
  return { planets, loading, error, refetch: fetch }
}