'use client'
import { useCallback, useState } from 'react'
import {
  Connection, PublicKey, SystemProgram,
  Transaction, TransactionInstruction, Keypair
} from '@solana/web3.js'
import { PROGRAM_ID, MPL_CORE_ID, findPlanetPda, findTreasuryPda } from '@/lib/pda'

export type ActionStatus = 'idle' | 'pending' | 'success' | 'error'

const RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'

function getPhantom() {
  const p = (window as any).solana
  if (!p?.isPhantom || !p.isConnected) throw new Error('Phantom not connected')
  return p
}

function getConn() {
  return new Connection(RPC, { commitment: 'confirmed', confirmTransactionInitialTimeout: 120000 })
}

async function disc(name: string): Promise<Buffer> {
  const encoded = new TextEncoder().encode(`global:${name}`)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  return Buffer.from(new Uint8Array(hash).slice(0, 8))
}

function encodeEnum(variants: string[], name: string): Buffer {
  const idx = variants.indexOf(name)
  if (idx < 0) throw new Error(`Unknown variant: ${name}`)
  return Buffer.from([idx])
}

// Send with retry on blockhash expiry
async function sendTx(
  conn: Connection,
  phantom: any,
  instructions: TransactionInstruction[],
  extraSigners: Keypair[] = []
): Promise<string> {
  let lastErr: any
  // Try up to 3 times with fresh blockhash each time
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('finalized')
      const tx = new Transaction()
      tx.recentBlockhash = blockhash
      tx.feePayer = phantom.publicKey
      instructions.forEach(ix => tx.add(ix))
      if (extraSigners.length > 0) tx.partialSign(...extraSigners)

      const signed = await phantom.signTransaction(tx)
      let sig: string
      try {
        sig = await conn.sendRawTransaction(signed.serialize(), { 
          skipPreflight: false, 
          preflightCommitment: 'confirmed' 
        })
      } catch(sendErr: any) {
        // Extract program logs from simulation error
        const logs = sendErr?.logs || sendErr?.message || ''
        console.error('Send/simulate error:', logs)
        throw new Error(
          sendErr?.logs?.find((l: string) => l.includes('Error') || l.includes('error') || l.includes('custom program error')) 
          || sendErr?.message 
          || 'Simulation failed'
        )
      }
      console.log(`TX sent (attempt ${attempt + 1}):`, sig)

      // Poll for confirmation with searchTransactionHistory
      for (let i = 0; i < 45; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const status = await conn.getSignatureStatus(sig, { searchTransactionHistory: true })
        const cs = status?.value?.confirmationStatus
        console.log(`Poll ${i+1}: ${cs || 'pending'}`)
        if (cs === 'confirmed' || cs === 'finalized') {
          console.log('✅ Confirmed!')
          return sig
        }
        if (status?.value?.err) {
          throw new Error(`TX failed on-chain: ${JSON.stringify(status.value.err)}`)
        }
      }
      throw new Error('Timeout waiting for confirmation')
    } catch (e: any) {
      lastErr = e
      const msg = e?.message || ''
      // Only retry on blockhash expiry errors
      if (msg.includes('block height exceeded') || msg.includes('Blockhash not found')) {
        console.log(`Attempt ${attempt + 1} failed (blockhash expired), retrying...`)
        continue
      }
      // Any other error — don't retry
      throw e
    }
  }
  throw lastErr
}

function useAction() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(async (fn: () => Promise<string>) => {
    setStatus('pending'); setError(null)
    try {
      const sig = await fn()
      console.log('✅ TX:', sig)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
      return sig
    } catch (e: any) {
      console.error('❌', e)
      setError((e?.message || 'Failed').slice(0, 200))
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }, [])
  return { status, error, run }
}

export function useInitializePlanet() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const execute = useCallback(async (planetType: string, rarity: string) => {
    setStatus('pending'); setError(null)
    try {
      const phantom = getPhantom(), conn = getConn()
      const asset = Keypair.generate()
      const [planet] = findPlanetPda(asset.publicKey)
      const PLANET_TYPES = ['Mining','Energy','Luxury','Research','Military']
      const RARITIES     = ['Common','Rare','Epic','Legendary']
      const d = await disc('initialize_planet')
      const data = Buffer.concat([d, encodeEnum(PLANET_TYPES, planetType), encodeEnum(RARITIES, rarity)])
      const ix = new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: phantom.publicKey,       isSigner: true,  isWritable: true  },
          { pubkey: planet,                  isSigner: false, isWritable: true  },
          { pubkey: asset.publicKey,         isSigner: false, isWritable: true  },
          { pubkey: MPL_CORE_ID,             isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data,
      })
      console.log('Minting:', planetType, rarity, '| planet:', planet.toString())
      const sig = await sendTx(conn, phantom, [ix])
      console.log('✅ Planet minted! PDA:', planet.toString())
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
      return planet.toString()
    } catch (e: any) {
      console.error('❌ Mint:', e)
      setError((e?.message || 'Mint failed').slice(0, 200))
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }, [])
  return { execute, status, error }
}

export function useColonize() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [{ pubkey: phantom.publicKey, isSigner: true, isWritable: true }, { pubkey: new PublicKey(pda), isSigner: false, isWritable: true }],
        data: await disc('colonize_planet'),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useUncolonize() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [{ pubkey: phantom.publicKey, isSigner: true, isWritable: true }, { pubkey: new PublicKey(pda), isSigner: false, isWritable: true }],
        data: await disc('uncolonize_planet'),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useClaimResources() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [{ pubkey: phantom.publicKey, isSigner: true, isWritable: true }, { pubkey: new PublicKey(pda), isSigner: false, isWritable: true }],
        data: await disc('claim_resources'),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useUpgradePlanet() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [{ pubkey: phantom.publicKey, isSigner: true, isWritable: true }, { pubkey: new PublicKey(pda), isSigner: false, isWritable: true }],
        data: await disc('upgrade_planet'),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useUpgradeMilitary() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [{ pubkey: phantom.publicKey, isSigner: true, isWritable: true }, { pubkey: new PublicKey(pda), isSigner: false, isWritable: true }],
        data: await disc('upgrade_military'),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useRepairPlanet() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [{ pubkey: phantom.publicKey, isSigner: true, isWritable: true }, { pubkey: new PublicKey(pda), isSigner: false, isWritable: true }],
        data: await disc('repair_planet'),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useListPlanet() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string, assetKey: string, priceSOL: number) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      const d = await disc('list_planet')
      const priceBytes = Buffer.allocUnsafe(8)
      priceBytes.writeBigUInt64LE(BigInt(Math.floor(priceSOL * 1e9)))
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: phantom.publicKey,        isSigner: true,  isWritable: true  },
          { pubkey: new PublicKey(pda),       isSigner: false, isWritable: true  },
          { pubkey: new PublicKey(assetKey),  isSigner: false, isWritable: true  },
          { pubkey: MPL_CORE_ID,              isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId,  isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([d, priceBytes]),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useBuyPlanet() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string, assetKey: string, sellerKey: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      const [treasury] = findTreasuryPda()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: phantom.publicKey,        isSigner: true,  isWritable: true  },
          { pubkey: new PublicKey(sellerKey), isSigner: false, isWritable: true  },
          { pubkey: treasury,                 isSigner: false, isWritable: true  },
          { pubkey: new PublicKey(pda),       isSigner: false, isWritable: true  },
          { pubkey: new PublicKey(assetKey),  isSigner: false, isWritable: true  },
          { pubkey: MPL_CORE_ID,              isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId,  isSigner: false, isWritable: false },
        ],
        data: await disc('buy_planet'),
      })])
    })
  }, [run]); return { execute, status, error }
}

export function useCancelListing() {
  const { status, error, run } = useAction()
  const execute = useCallback(async (pda: string, assetKey: string) => {
    await run(async () => {
      const phantom = getPhantom(), conn = getConn()
      return sendTx(conn, phantom, [new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
          { pubkey: phantom.publicKey,        isSigner: true,  isWritable: true  },
          { pubkey: new PublicKey(pda),       isSigner: false, isWritable: true  },
          { pubkey: new PublicKey(assetKey),  isSigner: false, isWritable: true  },
          { pubkey: MPL_CORE_ID,              isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId,  isSigner: false, isWritable: false },
        ],
        data: await disc('cancel_listing'),
      })])
    })
  }, [run]); return { execute, status, error }
}