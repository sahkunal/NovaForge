'use client'
import{useState,useEffect,useRef}from'react'
import{Planet,PLANET_COLORS,MONSTER_EMOJIS}from'@/lib/types'
interface Event{id:number;msg:string;color:string;icon:string;time:Date}
interface Props{planets:Planet[]}
let eid=0
export default function ActivityFeed({planets}:Props){
  const[events,setEvents]=useState<Event[]>([])
  const prev=useRef<Planet[]>([])
  useEffect(()=>{
    if(!planets.length)return
    const ne:Event[]=[]
    for(const p of planets){
      const old=prev.current.find(x=>x.publicKey===p.publicKey)
      const col=PLANET_COLORS[p.planetType].primary
      if(!old)ne.push({id:eid++,msg:`${p.rarity} ${p.planetType} planet minted`,color:col,icon:'🪐',time:new Date()})
      else{
        if(!old.colonized&&p.colonized)ne.push({id:eid++,msg:`${p.planetType} colonized — resources flowing`,color:'#4ade80',icon:'🌐',time:new Date()})
        if(old.monstersKilled<p.monstersKilled)ne.push({id:eid++,msg:`${MONSTER_EMOJIS[p.planetType]} Monster defeated! +${p.monstersKilled-old.monstersKilled} kill`,color:'#f43f5e',icon:'⚔️',time:new Date()})
        if(!old.inactive&&p.inactive)ne.push({id:eid++,msg:`${p.planetType} went INACTIVE — repair needed`,color:'#f43f5e',icon:'💀',time:new Date()})
        if(old.level<p.level)ne.push({id:eid++,msg:`${p.planetType} leveled up to Lv ${p.level}!`,color:'#a78bfa',icon:'▲',time:new Date()})
        if(!old.listed&&p.listed)ne.push({id:eid++,msg:`${p.planetType} listed on marketplace`,color:'#fbbf24',icon:'🏪',time:new Date()})
      }
    }
    if(ne.length)setEvents(ev=>[...ne,...ev].slice(0,8))
    prev.current=planets
  },[planets])
  if(!events.length)return null
  return(
    <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-1.5" style={{width:250}}>
      <div style={{fontFamily:'Orbitron,monospace',fontSize:'8px',color:'#1e293b',letterSpacing:'0.12em',marginBottom:4}}>ACTIVITY FEED</div>
      {events.slice(0,5).map(e=>(
        <div key={e.id} className="rounded-xl px-3 py-2 flex items-center gap-2 animate-fade-in-up" style={{background:'rgba(6,4,18,0.92)',border:`1px solid ${e.color}20`,backdropFilter:'blur(12px)'}}>
          <span style={{fontSize:'13px',flexShrink:0}}>{e.icon}</span>
          <span className="text-xs text-slate-300 leading-tight flex-1">{e.msg}</span>
          <span className="text-slate-600 font-mono flex-shrink-0" style={{fontSize:'9px'}}>{e.time.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      ))}
    </div>
  )
}
