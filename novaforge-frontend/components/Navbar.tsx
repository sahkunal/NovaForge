'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Store, User, Globe, Zap } from 'lucide-react'
import { MOCK_PLANETS, formatNumber } from '@/lib/types'

const totalIron = MOCK_PLANETS.reduce((a, p) => a + p.ironBalance, 0)
const totalGold = MOCK_PLANETS.reduce((a, p) => a + p.goldBalance, 0)
const totalUranium = MOCK_PLANETS.reduce((a, p) => a + p.uraniumBalance, 0)

const NAV = [
  { icon: Globe, label: 'Map', href: '/' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Store, label: 'Marketplace', href: '/marketplace' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  const [tooltip, setTooltip] = useState('')

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center px-4 gap-3"
        style={{ background: 'rgba(6,6,20,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
        {/* Logo */}
        <button onClick={() => router.push('/')} className="flex items-center gap-2 mr-4">
          <span className="text-xl text-purple-400" style={{ textShadow: '0 0 15px rgba(124,58,237,0.8)' }}>⬡</span>
          <span className="text-sm font-black tracking-widest text-white" style={{ fontFamily: 'Orbitron' }}>NOVAFORGE</span>
        </button>
        {/* Resources */}
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <span className="text-amber-400 text-xs">⬡</span>
            <span className="text-xs font-mono text-amber-300">{formatNumber(totalIron)}</span>
            <span className="text-xs text-amber-600">Fe</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <span className="text-yellow-400 text-xs">◈</span>
            <span className="text-xs font-mono text-yellow-300">{formatNumber(totalGold)}</span>
            <span className="text-xs text-yellow-600">Au</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <span className="text-cyan-400 text-xs">▸</span>
            <span className="text-xs font-mono text-cyan-300">{formatNumber(totalUranium)}</span>
            <span className="text-xs text-cyan-600">U</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Zap size={10} className="text-purple-400" />
            <span className="text-xs font-mono text-purple-300">{MOCK_PLANETS.length}</span>
            <span className="text-xs text-purple-600">Planets</span>
          </div>
        </div>
        {/* Wallet */}
        <button className="btn-primary text-xs px-3 py-1.5">
          Connect Wallet
        </button>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#0f9e8a)' }}>T</div>
      </div>

      {/* Side nav */}
      <div className="fixed left-0 top-12 bottom-0 z-40 w-14 flex flex-col items-center py-4 gap-2"
        style={{ background: 'rgba(6,6,20,0.85)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(124,58,237,0.1)' }}>
        {NAV.map(({ icon: Icon, label, href }) => (
          <div key={href} className="relative">
            <button
              onClick={() => router.push(href)}
              onMouseEnter={() => setTooltip(label)}
              onMouseLeave={() => setTooltip('')}
              className={`nav-item ${path === href ? 'active' : ''}`}>
              <Icon size={18} />
            </button>
            {tooltip === label && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-50"
                style={{ background: 'rgba(18,17,46,0.95)', border: '1px solid rgba(124,58,237,0.3)', fontFamily: 'Orbitron' }}>
                {label}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
