'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, ShoppingCart, User, Map, Settings } from 'lucide-react'

const NAV = [
  { href: '/', icon: Map, label: 'Map' },
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/marketplace', icon: ShoppingCart, label: 'Market' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function NavigationBar() {
  const path = usePathname()
  return (
    <div className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-6 gap-2"
      style={{ width:64, background:'rgba(10,9,32,0.95)', borderRight:'1px solid rgba(124,58,237,0.15)', backdropFilter:'blur(16px)' }}>
      {/* Logo */}
      <div className="mb-4 flex flex-col items-center">
        <svg width="32" height="32" viewBox="0 0 80 80">
          <defs><linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#0f9e8a"/></linearGradient></defs>
          <polygon points="40,4 70,20 70,60 40,76 10,60 10,20" fill="none" stroke="url(#ng)" strokeWidth="2"/>
          <circle cx="40" cy="40" r="16" fill="url(#ng)"/>
          <ellipse cx="40" cy="40" rx="23" ry="6" fill="none" stroke="rgba(94,234,212,0.6)" strokeWidth="1.5"/>
        </svg>
        <span style={{ fontFamily:'Orbitron,monospace', fontSize:'7px', color:'#7c3aed', letterSpacing:'0.1em', marginTop:4 }}>NF</span>
      </div>
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = path === href
        return (
          <Link key={href} href={href} title={label} className="nav-item relative group" style={{ ...(active ? { color:'#a78bfa', background:'rgba(124,58,237,0.15)' } : {}) }}>
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-purple-500 rounded-r" />}
            <Icon size={18} />
            <span className="absolute left-14 bg-panel border border-purple-500/30 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ fontFamily:'Orbitron,monospace', fontSize:'9px' }}>{label}</span>
          </Link>
        )
      })}
    </div>
  )
}
