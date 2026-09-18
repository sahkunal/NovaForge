'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutGrid, ShoppingCart, User, Map } from 'lucide-react'
const NAV=[{href:'/',icon:Map,label:'Star Map'},{href:'/dashboard',icon:LayoutGrid,label:'Dashboard'},{href:'/marketplace',icon:ShoppingCart,label:'Market'},{href:'/profile',icon:User,label:'Profile'}]
export default function NavigationBar(){
  const path=usePathname()
  return(
    <div className="fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center py-5 gap-1" style={{width:64,background:'rgba(6,4,18,0.96)',borderRight:'1px solid rgba(124,58,237,0.12)',backdropFilter:'blur(20px)'}}>
      <div className="mb-5 flex flex-col items-center">
        <svg width="36" height="36" viewBox="0 0 80 80"><defs><linearGradient id="nlg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#0f9e8a"/></linearGradient></defs><polygon points="40,4 70,20 70,60 40,76 10,60 10,20" fill="none" stroke="url(#nlg)" strokeWidth="2.5"/><circle cx="40" cy="40" r="16" fill="url(#nlg)"/><ellipse cx="40" cy="40" rx="23" ry="6" fill="none" stroke="rgba(94,234,212,0.6)" strokeWidth="1.5"/><circle cx="40" cy="40" r="5" fill="#fff"/></svg>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:'7px',color:'#7c3aed',letterSpacing:'0.1em',marginTop:4}}>NF</span>
      </div>
      {NAV.map(({href,icon:Icon,label})=>{
        const active=path===href
        return(
          <Link key={href} href={href} title={label} className={`nav-item relative group ${active?'active':''}`} style={active?{color:'#a78bfa',background:'rgba(124,58,237,0.18)'}:{}}>
            {active&&<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 rounded-r" style={{background:'linear-gradient(to bottom,#7c3aed,#0f9e8a)'}}/>}
            <Icon size={19}/>
            <div className="absolute left-[58px] rounded-lg px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50" style={{background:'rgba(12,9,32,0.95)',border:'1px solid rgba(124,58,237,0.3)',fontFamily:'Orbitron,monospace',fontSize:'10px',color:'#e2e8f0',top:'50%',transform:'translateY(-50%)'}}>{label}</div>
          </Link>
        )
      })}
    </div>
  )
}
