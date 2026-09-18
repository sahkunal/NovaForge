'use client'
import{useState,useEffect}from 'react'
import dynamic from 'next/dynamic'
import{useNovaWallet}from '@/lib/hooks/useWallet'
import{usePlanets}from '@/lib/hooks/usePlanets'
import{useBuyPlanet}from '@/lib/hooks/useAnchorActions'
import NavigationBar from '@/components/NavigationBar'
import TopBar from '@/components/TopBar'
import EntryScreen from '@/components/EntryScreen'
import PlanetCanvas from '@/components/PlanetCanvas'
import{PLANET_COLORS,RARITY_COLORS,formatNumber,lamportsToSOL}from '@/lib/types'
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
export default function Marketplace(){
  const[mounted,setMounted]=useState(false)
  const{connected,publicKey}=useNovaWallet()
  const{planets,loading,refetch}=usePlanets(connected?publicKey:null)
  const{execute:buy,status:bs}=useBuyPlanet()
  const[fType,setFType]=useState('All'),[sort,setSort]=useState('price')
  useEffect(()=>{setMounted(true)},[])
  if(!mounted) return null
  if(!connected) return <EntryScreen/>
  const listings=planets.filter(p=>p.listed).filter(p=>fType==='All'||p.planetType===fType).sort((a,b)=>sort==='price'?a.price-b.price:b.level-a.level)
  const types=['All','Mining','Luxury','Research','Energy','Military']
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:48}}>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[{label:'Listed',value:listings.length,color:'#a78bfa'},{label:'Total Volume',value:`${listings.reduce((a,p)=>a+(p.price/1e9),0).toFixed(2)} ◎`,color:'#5eead4'},{label:'Protocol Fee',value:'1%',color:'#fbbf24'}].map(({label,value,color})=>(
              <div key={label} className="rounded-2xl p-4" style={{background:'rgba(8,6,22,0.9)',border:`1px solid ${color}18`}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'9px',color:'#334155',letterSpacing:'0.12em',marginBottom:6}}>{label.toUpperCase()}</div>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:'26px',fontWeight:700,color}}>{loading?'—':value}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{fontFamily:'Orbitron,monospace',fontSize:'15px',fontWeight:700,color:'#e2e8f0',letterSpacing:'0.1em'}}>🏪 MARKETPLACE</h2>
            <div className="flex gap-2">
              <button onClick={refetch} className="btn-ghost" style={{padding:'6px 12px',fontSize:'9px'}}>↻</button>
              {['price','level'].map(s=><button key={s} onClick={()=>setSort(s)} className="text-xs px-3 py-1.5 rounded-lg transition-colors" style={{background:sort===s?'rgba(124,58,237,0.22)':'transparent',color:sort===s?'#a78bfa':'#334155',fontFamily:'Orbitron,monospace',fontSize:'9px',border:sort===s?'1px solid rgba(124,58,237,0.4)':'1px solid transparent'}}>{s.toUpperCase()}</button>)}
            </div>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {types.map(t=><button key={t} onClick={()=>setFType(t)} className="text-xs px-3 py-1.5 rounded-lg transition-colors" style={{background:fType===t?'rgba(124,58,237,0.22)':'rgba(255,255,255,0.03)',color:fType===t?'#a78bfa':'#334155',fontFamily:'Orbitron,monospace',fontSize:'9px',border:fType===t?'1px solid rgba(124,58,237,0.4)':'1px solid rgba(255,255,255,0.06)'}}>{t}</button>)}
          </div>
          {loading&&<div className="flex justify-center py-20"><svg className="animate-spin" width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="#7c3aed" strokeWidth="3" strokeDasharray="48" strokeDashoffset="24"/></svg></div>}
          {!loading&&listings.length===0&&<div className="flex flex-col items-center justify-center py-20 gap-4"><div style={{fontSize:'56px'}}>🏪</div><p style={{fontFamily:'Orbitron,monospace',fontSize:'12px',color:'#334155',letterSpacing:'0.1em'}}>NO LISTINGS YET</p><p className="text-xs text-slate-600">List a planet from your dashboard to sell it here</p></div>}
          {!loading&&listings.length>0&&(
            <div className="rounded-2xl overflow-hidden" style={{background:'rgba(8,6,22,0.9)',border:'1px solid rgba(124,58,237,0.15)'}}>
              <div className="grid text-xs text-slate-600 px-5 py-3 border-b" style={{gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr',fontFamily:'Orbitron,monospace',fontSize:'9px',letterSpacing:'0.08em',borderColor:'rgba(124,58,237,0.12)'}}>
                <span>PLANET</span><span>TYPE</span><span>RARITY</span><span>LVL</span><span>PWR</span><span>PRICE</span>
              </div>
              {listings.map((planet,i)=>{
                const c=PLANET_COLORS[planet.planetType],rc=RARITY_COLORS[planet.rarity]
                return(
                  <div key={planet.publicKey} className="grid items-center px-5 py-4 border-b transition-colors cursor-pointer group" style={{gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr',borderColor:'rgba(124,58,237,0.08)',background:i%2===0?'transparent':'rgba(124,58,237,0.015)'}}>
                    <div className="flex items-center gap-3"><PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={38}/><div><div className="text-white text-xs font-mono">{planet.publicKey.slice(0,10)}...</div><div className="text-slate-600 text-xs">{planet.monstersKilled} kills</div></div></div>
                    <span style={{color:c.primary,fontFamily:'Orbitron,monospace',fontSize:'10px'}}>{planet.planetType}</span>
                    <span style={{color:rc,fontFamily:'Orbitron,monospace',fontSize:'10px'}}>{planet.rarity}</span>
                    <span className="text-white font-mono">{planet.level}</span>
                    <span className="text-slate-300 font-mono">{formatNumber(planet.power)}</span>
                    <div className="flex items-center gap-2"><span className="text-white font-bold">{lamportsToSOL(planet.price)} ◎</span><button onClick={()=>buy(planet.publicKey,planet.asset,planet.owner)} className="btn-teal opacity-0 group-hover:opacity-100 transition-opacity" style={{padding:'4px 12px',fontSize:'9px',whiteSpace:'nowrap'}}>{bs==='pending'?'...':'BUY'}</button></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
