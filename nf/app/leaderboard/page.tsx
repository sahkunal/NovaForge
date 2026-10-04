'use client'
import{useState,useEffect}from'react'
import dynamic from'next/dynamic'
import{useNovaWallet}from'@/lib/hooks/useWallet'
import{useLeaderboard}from'@/lib/hooks/useLeaderboard'
import NavigationBar from'@/components/NavigationBar'
import TopBar from'@/components/TopBar'
import EntryScreen from'@/components/EntryScreen'
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
const PC:Record<string,string>={Mining:'#60a5fa',Energy:'#f97316',Luxury:'#a855f7',Research:'#4ade80',Military:'#f43f5e'}
const RC:Record<string,string>={Common:'#94a3b8',Rare:'#4ade80',Epic:'#a78bfa',Legendary:'#fbbf24'}
const RS=[{bg:'rgba(251,191,36,0.12)',border:'rgba(251,191,36,0.4)',text:'#fbbf24',crown:'👑'},{bg:'rgba(148,163,184,0.1)',border:'rgba(148,163,184,0.3)',text:'#94a3b8',crown:'🥈'},{bg:'rgba(180,83,9,0.1)',border:'rgba(180,83,9,0.3)',text:'#f59e0b',crown:'🥉'}]
const short=(a:string)=>`${a.slice(0,4)}...${a.slice(-4)}`
const fmt=(n:number)=>n>=1000?(n/1000).toFixed(1)+'K':n.toString()
export default function Leaderboard(){
  const[mounted,setMounted]=useState(false)
  const{connected,publicKey}=useNovaWallet()
  const{players,loading,lastUpdated,refetch}=useLeaderboard()
  useEffect(()=>{setMounted(true)},[])
  if(!mounted)return null
  if(!connected)return<EntryScreen/>
  const me=players.find(p=>p.owner===publicKey)
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:48}}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div><h1 style={{fontFamily:'Orbitron,monospace',fontSize:'20px',fontWeight:900,color:'#e2e8f0',letterSpacing:'0.1em'}}>🏆 GALACTIC LEADERBOARD</h1><p className="text-xs text-slate-500 mt-1">{players.length} commanders · live from Solana devnet · updates every 30s</p></div>
            <button onClick={refetch} className="btn-ghost" style={{padding:'7px 14px',fontSize:'9px'}}>↻ REFRESH</button>
          </div>
          {me&&(
            <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(124,58,237,0.3)'}}>
              <div style={{fontSize:'32px'}}>{me.rank<=3?['👑','🥈','🥉'][me.rank-1]:'⬡'}</div>
              <div className="flex-1"><div style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#a78bfa',letterSpacing:'0.1em'}}>YOUR RANKING</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'22px',fontWeight:900,color:'#fff'}}>#{me.rank} <span style={{fontSize:'14px',color:'#475569'}}>of {players.length}</span></div></div>
              <div className="grid grid-cols-3 gap-4 text-right">{[{l:'Planets',v:me.totalPlanets,c:'#a78bfa'},{l:'Kills',v:me.totalKills,c:'#f97316'},{l:'Power',v:fmt(me.totalPower),c:'#60a5fa'}].map(({l,v,c})=><div key={l}><div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569'}}>{l}</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:700,color:c}}>{v}</div></div>)}</div>
            </div>
          )}
          {loading&&<div className="flex items-center justify-center py-20 gap-3"><svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="40" strokeDashoffset="20"/></svg><span style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#334155',letterSpacing:'0.15em'}}>SCANNING DEVNET...</span></div>}
          {!loading&&players.length===0&&<div className="text-center py-16"><div style={{fontSize:'56px',marginBottom:16}}>🌌</div><p style={{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#334155'}}>NO COMMANDERS YET</p><p className="text-xs text-slate-600 mt-2">Be first to mint and claim #1</p></div>}
          {!loading&&players.length>0&&(
            <div className="rounded-2xl overflow-hidden" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.15)'}}>
              <div className="grid px-5 py-3 border-b" style={{gridTemplateColumns:'48px 1fr 70px 70px 70px 70px 90px',borderColor:'rgba(124,58,237,0.12)'}}>{['RANK','COMMANDER','PLANETS','KILLS','POWER','MIL','TOP PLANET'].map(h=><span key={h} style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155',letterSpacing:'0.1em'}}>{h}</span>)}</div>
              {players.map((p,i)=>{
                const isMe=p.owner===publicKey,rs=i<3?RS[i]:null
                return(
                  <div key={p.owner} className="grid items-center px-5 py-3 transition-all hover:bg-white/[0.02]" style={{gridTemplateColumns:'48px 1fr 70px 70px 70px 70px 90px',borderBottom:'1px solid rgba(124,58,237,0.06)',background:isMe?'rgba(124,58,237,0.08)':rs?rs.bg:'transparent'}}>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:i<3?'18px':'13px',fontWeight:900,color:rs?.text||'#334155',textAlign:'center'}}>{i<3?rs?.crown:p.rank}</div>
                    <div className="flex items-center gap-2 min-w-0"><div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{background:rs?rs.bg:'rgba(124,58,237,0.1)',border:`1px solid ${rs?.border||'rgba(124,58,237,0.2)'}`}}>{isMe?'👤':'⬡'}</div><div className="min-w-0"><div className="text-xs font-mono truncate" style={{color:isMe?'#a78bfa':'#e2e8f0'}}>{isMe?'YOU — ':''}{short(p.owner)}</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155'}}>{p.colonizedCount} active · Lv{p.topLevel}</div></div></div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#a78bfa'}}>{p.totalPlanets}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#f97316'}}>{p.totalKills}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#60a5fa'}}>{fmt(p.totalPower)}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#f43f5e'}}>{fmt(p.totalMilitary)}</div>
                    <div className="flex flex-col gap-0.5"><span style={{color:PC[p.topPlanetType]||'#60a5fa',fontFamily:'Orbitron,monospace',fontSize:'9px'}}>{p.topPlanetType}</span><span style={{color:RC[p.topRarity]||'#94a3b8',fontFamily:'Orbitron,monospace',fontSize:'8px'}}>{p.topRarity}</span></div>
                  </div>
                )
              })}
            </div>
          )}
          {lastUpdated&&<p className="text-center text-xs text-slate-700 mt-4 font-mono">Updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
      </div>
    </div>
  )
}
