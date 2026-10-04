'use client'
import {useState} from 'react'
import {Planet,PLANET_COLORS} from '@/lib/types'
import {useListPlanet} from '@/lib/hooks/useAnchorActions'
import ActionButton from './ActionButton'
import PlanetCanvas from './PlanetCanvas'
import {X,Tag,Shield,Zap,Skull} from 'lucide-react'
interface Props{planet:Planet;onClose:()=>void}
export default function ListingModal({planet,onClose}:Props){
 const[price,setPrice]=useState('');const{execute:list,status,error}=useListPlanet();const col=PLANET_COLORS[planet.planetType];const sol=parseFloat(price)||0
 return <div className="nf-modal-backdrop"><div className="nf-sell-modal">
  <div className="nf-modal-topline" style={{background:`linear-gradient(90deg,transparent,${col.primary},#fff,${col.primary},transparent)`}}/>
  <header className="nf-modal-header"><div><div className="nf-kicker">MARKET PROTOCOL // ASSET DISPOSAL</div><h2>LIST YOUR WORLD</h2></div><button className="nf-icon-btn" onClick={onClose}><X size={17}/></button></header>
  <div className="nf-sell-preview"><div className="nf-sell-orbit"><div className="nf-sell-grid"/><PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={130} hasRing={planet.rarity==='Legendary'||planet.planetType==='Military'}/></div><div><div className="nf-tag-row"><span style={{color:col.primary}}>{planet.planetType}</span><span>LV.{planet.level}</span><span>{planet.rarity}</span></div><h3>OPEN MARKET ORDER</h3><p>Uncolonize first. The planet asset will be frozen by MPL-Core while the listing is active.</p><div className="nf-mini-stats"><span><Shield/> {planet.militaryPower}</span><span><Zap/> {planet.productionRate}/s</span><span><Skull/> {planet.monsterTier}</span></div></div></div>
  <label className="nf-price-label">ASKING PRICE <span>SOL</span></label><div className="nf-price-input"><input autoFocus type="number" value={price} onChange={e=>setPrice(e.target.value)} min="0" step="0.01" placeholder="0.000"/><b>◎</b></div>
  {sol>0?<div className="nf-settlement"><div><span>ASK</span><b>{sol.toFixed(3)} ◎</b></div><div><span>PROTOCOL FEE</span><b>-{(sol*.01).toFixed(3)} ◎</b></div><div className="total"><span>YOU RECEIVE</span><strong>{(sol*.99).toFixed(3)} ◎</strong></div></div>:<div className="nf-price-empty">SET AN ASK TO PREVIEW SETTLEMENT</div>}
  {error&&<div className="nf-action-error">LISTING FAILED // {error}</div>}
  <footer className="nf-modal-footer"><button className="nf-secondary-btn" onClick={onClose}>CANCEL</button><div className="nf-buy-cta"><ActionButton label="DEPLOY LISTING" loadingLabel="SIGNING…" successLabel="LISTED" status={status} onClick={()=>list(planet.publicKey,planet.asset,sol)} disabled={sol<=0} variant="primary"/></div></footer>
 </div></div>
}
