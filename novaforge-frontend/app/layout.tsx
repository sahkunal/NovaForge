import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NovaForge — On-Chain Idle Strategy',
  description: 'Mine resources, upgrade planets, fight monsters. Built on Solana.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background:'#060614', minHeight:'100vh' }}>
        {children}
      </body>
    </html>
  )
}
