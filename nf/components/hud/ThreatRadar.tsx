'use client'
import React from 'react'
export type RadarThreat={id:string;name:string;power:number;level:number;severity:'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'}
export default function ThreatRadar({threats,onSelect}:{threats:RadarThreat[];onSelect?:(t:RadarThreat)=>void}){
 return <div className="nf-radar"><div className="nf-eyebrow">THREAT RADAR</div><div className="nf-radar-title">{threats.length?'HOSTILE CONTACTS':'SECTOR CLEAR'}</div><div className="nf-radar-screen"><span className="r r1"/><span className="r r2"/><span className="r r3"/><span className="cross h"/><span className="cross v"/><span className="sweep"/><span className="radar-center"/>{threats.slice(0,7).map((t,i)=><button key={t.id} className={`contact ${t.severity.toLowerCase()}`} style={{left:`${18+((i*31)%65)}%`,top:`${22+((i*43)%56)}%`}} onClick={()=>onSelect?.(t)} aria-label={t.name}><i/></button>)}</div><div className="nf-contact-list">{threats.slice(0,4).map(t=><button key={t.id} onClick={()=>onSelect?.(t)}><i className={t.severity.toLowerCase()}/><span>{t.name}</span><small>PWR {t.power}</small></button>)}</div></div>
}
