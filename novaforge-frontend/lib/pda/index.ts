// PDA derivation helpers — mirrors the on-chain seeds exactly
import { PublicKey } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey('9BoQLMAxw2xbgXp5mNdVmnErcQmi7ZKZXPqfq9VLuK3P')
export const MPL_CORE_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d')

export async function findPlanetPda(asset: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('planet'), asset.toBuffer()],
    PROGRAM_ID
  ) as unknown as [PublicKey, number]
}

export async function findListingPda(asset: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), asset.toBuffer()],
    PROGRAM_ID
  ) as unknown as [PublicKey, number]
}

export async function findEscrowPda(asset: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), asset.toBuffer()],
    PROGRAM_ID
  ) as unknown as [PublicKey, number]
}

export async function findTreasuryPda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    PROGRAM_ID
  ) as unknown as [PublicKey, number]
}
