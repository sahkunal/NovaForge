import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title:'NovaForge — Build. Colonize. Conquer. On-Chain.', description:'Solana idle strategy game.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning style={{background:'#03020f',minHeight:'100vh'}}>{children}</body></html>
}
