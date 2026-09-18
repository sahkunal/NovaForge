import { PublicKey } from '@solana/web3.js'
export const PROGRAM_ID = new PublicKey('4RmfPaedo1BpddXzwASa2LU6YJ9pZ6XafwJGxRm22bsB')
export const MPL_CORE_ID = new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d')
export function findPlanetPda(asset: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('planet'), asset.toBuffer()], PROGRAM_ID)
}
export function findTreasuryPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('treasury')], PROGRAM_ID)
}