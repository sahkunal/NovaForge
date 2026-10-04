'use client'
import{usePathname}from'next/navigation'
import Link from'next/link'
import{LayoutGrid,ShoppingCart,User,Map,Trophy}from'lucide-react'
const NAV=[{href:'/',icon:Map,label:'Star Map'},{href:'/dashboard',icon:LayoutGrid,label:'Dashboard'},{href:'/leaderboard',icon:Trophy,label:'Leaderboard'},{href:'/marketplace',icon:ShoppingCart,label:'Market'},{href:'/profile',icon:User,label:'Profile'}]
export default function NavigationBar(){
 const path=usePathname()
 return <aside className="nf-nav-shell fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-5 gap-2" style={{width:64}}>
   <Link href="/" className="mb-7 text-center"><div className="w-9 h-9 border border-[#7e9a68]/35 flex items-center justify-center rotate-45"><span className="-rotate-45 font-[Orbitron] font-bold text-[#9ab483]">N</span></div><span className="block mt-3 font-mono text-[7px] tracking-[.2em] text-[#566252]">NOVA</span></Link>
   {NAV.map(({href,icon:Icon,label})=>{const active=path===href;return <Link key={href} href={href} title={label} className={`nav-item group ${active?'active':''}`} style={active?{color:'#a8bf8e',background:'rgba(126,154,104,.10)'}:{}}>{active&&<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r bg-[#91aa76]"/>}<Icon size={18}/><div className="absolute left-[58px] rounded-sm px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 bg-[#080d08] border border-[#7e9a68]/25 font-mono text-[9px] text-[#cbd5c4] top-1/2 -translate-y-1/2">{label}</div></Link>})}
 </aside>
}
