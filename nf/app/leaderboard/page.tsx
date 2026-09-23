'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useNovaWallet } from '@/lib/hooks/useWallet'
import { useLeaderboard } from '@/lib/hooks/useLeaderboard'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import EntryScreen from '@/components/EntryScreen'
const StarField = dynamic(()=>import('@/components/StarField'),{ssr:false})

const PLANET_COLORS: Record<string,string> = {Mining:'#60a5fa',Energy:'#f97316',Luxury:'#a855f7',Research:'#4ade80',Military:'#f43f5e'}
const RARITY_COLORS: Record<string,string> = {Common:'#94a3b8',Rare:'#4ade80',Epic:'#a78bfa',Legendary:'#fbbf24'}
const RANK_STYLES = [
  {bg:'rgba(251,191,36,0.12)',border:'rgba(251,191,36,0.4)',text:'#fbbf24',crown:'👑'},
  {bg:'rgba(148,163,184,0.1)',border:'rgba(148,163,184,0.3)',text:'#94a3b8',crown:'🥈'},
  {bg:'rgba(180,83,9,0.1)',border:'rgba(180,83,9,0.3)',text:'#f59e0b',crown:'🥉'},
]

function shortAddr(a:string){ return `${a.slice(0,4)}...${a.slice(-4)}` }
function fmtNum(n:number){ return n>=1000?(n/1000).toFixed(1)+'K':n.toString() }

export default function Leaderboard() {
  const [mounted,setMounted]=useState(false)
  const {connected,publicKey}=useNovaWallet()
  const {players,loading,lastUpdated,refetch}=useLeaderboard()
  useEffect(()=>{setMounted(true)},[])
  if(!mounted) return null
  if(!connected) return <EntryScreen/>

  const myRank=players.find(p=>p.owner===publicKey)
  const topKiller=players.reduce((a,p)=>p.totalKills>a.totalKills?p:a,players[0]||{totalKills:0,owner:''})
  const topPower=players.reduce((a,p)=>p.totalPower>a.totalPower?p:a,players[0]||{totalPower:0,owner:''})

  return (
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:48}}>
        <div className="p-6 max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 style={{fontFamily:'Orbitron,monospace',fontSize:'20px',fontWeight:900,color:'#e2e8f0',letterSpacing:'0.1em'}}>🏆 GALACTIC LEADERBOARD</h1>
              <p className="text-xs text-slate-500 mt-1">Live rankings from Solana devnet · {players.length} commanders · updates every 30s</p>
            </div>
            <button onClick={refetch} className="btn-ghost" style={{padding:'7px 14px',fontSize:'9px'}}>↻ Refresh</button>
          </div>

          {/* My rank banner */}
          {myRank && (
            <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(124,58,237,0.3)'}}>
              <div className="text-3xl">{myRank.rank<=3?['👑','🥈','🥉'][myRank.rank-1]:'⬡'}</div>
              <div className="flex-1">
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#a78bfa',letterSpacing:'0.1em'}}>YOUR RANKING</div>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'22px',fontWeight:900,color:'#fff'}}>#{myRank.rank} <span style={{fontSize:'14px',color:'#475569'}}>of {players.length}</span></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-right">
                {[{l:'Planets',v:myRank.totalPlanets,c:'#a78bfa'},{l:'Kills',v:myRank.totalKills,c:'#f97316'},{l:'Power',v:fmtNum(myRank.totalPower),c:'#60a5fa'}].map(({l,v,c})=>(
                  <div key={l}><div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569'}}>{l}</div><div style={{fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:700,color:c}}>{v}</div></div>
                ))}
              </div>
            </div>
          )}

          {/* Stat highlights */}
          {players.length>0&&(
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                {label:'Top Monster Slayer',value:`${topKiller.totalKills} kills`,player:topKiller.owner,icon:'⚔️',color:'#f43f5e'},
                {label:'Most Powerful Empire',value:fmtNum(topPower.totalPower)+' PWR',player:topPower.owner,icon:'⚡',color:'#fbbf24'},
                {label:'Total Planets on Devnet',value:players.reduce((a,p)=>a+p.totalPlanets,0).toString(),player:'Across all commanders',icon:'🪐',color:'#a78bfa'},
              ].map(({label,value,player,icon,color})=>(
                <div key={label} className="rounded-2xl p-4" style={{background:'rgba(8,6,22,0.9)',border:`1px solid ${color}20`}}>
                  <div style={{fontSize:'22px',marginBottom:8}}>{icon}</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#475569',marginBottom:4,letterSpacing:'0.1em'}}>{label.toUpperCase()}</div>
                  <div style={{fontFamily:'Orbitron,monospace',fontSize:'16px',fontWeight:700,color}}>{value}</div>
                  <div className="text-xs text-slate-600 mt-1 font-mono truncate">{shortAddr(player)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Main leaderboard */}
          {loading&&<div className="flex items-center justify-center py-20 gap-3"><svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="40" strokeDashoffset="20"/></svg><span style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#334155',letterSpacing:'0.15em'}}>SCANNING DEVNET...</span></div>}

          {!loading&&players.length===0&&(
            <div className="text-center py-16">
              <div style={{fontSize:'56px',marginBottom:16}}>🌌</div>
              <p style={{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#334155',letterSpacing:'0.1em'}}>NO COMMANDERS YET</p>
              <p className="text-xs text-slate-600 mt-2">Be the first to mint a planet and claim the #1 spot</p>
            </div>
          )}

          {!loading&&players.length>0&&(
            <div className="rounded-2xl overflow-hidden" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.15)'}}>
              {/* Table header */}
              <div className="grid px-5 py-3 border-b" style={{gridTemplateColumns:'48px 1fr 80px 80px 80px 80px 100px',borderColor:'rgba(124,58,237,0.12)'}}>
                {['RANK','COMMANDER','PLANETS','KILLS','POWER','MIL','TOP PLANET'].map(h=>(
                  <span key={h} style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155',letterSpacing:'0.1em'}}>{h}</span>
                ))}
              </div>
              {players.map((p,i)=>{
                const isMe = p.owner===publicKey
                const rs = i<3?RANK_STYLES[i]:null
                return (
                  <div key={p.owner} className="grid items-center px-5 py-4 border-b transition-all" style={{
                    gridTemplateColumns:'48px 1fr 80px 80px 80px 80px 100px',
                    borderColor:'rgba(124,58,237,0.06)',
                    background:isMe?'rgba(124,58,237,0.08)':rs?rs.bg:'transparent',
                    border:isMe?'1px solid rgba(124,58,237,0.3)':rs?`1px solid ${rs.border}`:'none',
                    borderRadius:isMe||rs?8:0,
                    margin:isMe||rs?'4px 8px':'0',
                  }}>
                    {/* Rank */}
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:i<3?'18px':'13px',fontWeight:900,color:rs?.text||'#334155',textAlign:'center'}}>
                      {i<3?rs?.crown:p.rank}
                    </div>
                    {/* Commander */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{background:rs?rs.bg:'rgba(124,58,237,0.1)',border:`1px solid ${rs?.border||'rgba(124,58,237,0.2)'}`}}>
                        {isMe?'👤':'⬡'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono truncate" style={{color:isMe?'#a78bfa':'#e2e8f0'}}>{isMe?'YOU — ':''}{shortAddr(p.owner)}</div>
                        <div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#334155'}}>{p.colonizedCount} active · Lv{p.topLevel} max</div>
                      </div>
                    </div>
                    {/* Stats */}
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#a78bfa'}}>{p.totalPlanets}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#f97316'}}>{p.totalKills}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#60a5fa'}}>{fmtNum(p.totalPower)}</div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:'13px',fontWeight:700,color:'#f43f5e'}}>{fmtNum(p.totalMilitary)}</div>
                    {/* Top planet */}
                    <div className="flex flex-col gap-1">
                      <span style={{color:PLANET_COLORS[p.topPlanetType]||'#60a5fa',fontFamily:'Orbitron,monospace',fontSize:'9px'}}>{p.topPlanetType}</span>
                      <span style={{color:RARITY_COLORS[p.topRarity]||'#94a3b8',fontFamily:'Orbitron,monospace',fontSize:'8px'}}>{p.topRarity}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {lastUpdated&&(
            <p className="text-center text-xs text-slate-700 mt-4 font-mono">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
      </div>
    </div>
  )
}