'use client'
import { Planet, PLANET_COLORS, RARITY_COLORS, formatNumber } from '@/lib/types'
import { useBuyPlanet } from '@/lib/hooks/useAnchorActions'
import PlanetCanvas from './PlanetCanvas'
import ActionButton from './ActionButton'
import { X, Shield, Zap, Skull, ShoppingCart, Hexagon } from 'lucide-react'

interface Props { planet: Planet; onClose:()=>void; onSuccess?:()=>void }

export default function PlanetPurchaseModal({planet,onClose,onSuccess}:Props){
 const {execute:buy,status,error}=useBuyPlanet()
 const col=PLANET_COLORS[planet.planetType], rc=RARITY_COLORS[planet.rarity]
 const sol=planet.price/1e9
 const fee=sol*.01
 return <div className="nf-modal-backdrop">
   <div className="nf-buy-modal">
    <div className="nf-modal-grid"/>
    <div className="nf-modal-topline" style={{background:`linear-gradient(90deg,transparent,${col.primary},#fff,${col.primary},transparent)`}}/>
    <header className="nf-modal-header">
      <div><div className="nf-kicker">ACQUISITION PROTOCOL // MPL-CORE ASSET</div><h2>PLANET ACQUISITION</h2></div>
      <button className="nf-icon-btn" onClick={onClose}><X size={17}/></button>
    </header>
    <section className="nf-buy-hero">
      <div className="nf-buy-planet"><div className="nf-scan-ring"/><PlanetCanvas planetType={planet.planetType} rarity={planet.rarity} size={150} hasRing={planet.rarity==='Legendary'||planet.planetType==='Military'}/><div className="nf-buy-planet-id">{planet.publicKey.slice(0,6)}…{planet.publicKey.slice(-6)}</div></div>
      <div className="nf-buy-copy">
        <div className="nf-tag-row"><span style={{color:col.primary,borderColor:`${col.primary}55`}}>{planet.planetType}</span><span style={{color:rc,borderColor:`${rc}55`}}>{planet.rarity}</span><span>LV.{planet.level}</span></div>
        <h3>CLAIM THIS WORLD</h3>
        <p>Acquire the on-chain planet asset and inherit its production profile, military state and future upgrade path.</p>
        <div className="nf-buy-stats">
          <div><Shield size={14}/><b>{formatNumber(planet.militaryPower)}</b><span>DEFENSE</span></div>
          <div><Zap size={14}/><b>{formatNumber(planet.productionRate)}</b><span>OUTPUT</span></div>
          <div><Skull size={14}/><b>{planet.monsterTier||0}</b><span>THREAT TIER</span></div>
        </div>
      </div>
    </section>
    <section className="nf-buy-price">
      <div><span>LIST PRICE</span><strong>{sol.toFixed(3)} <em>◎</em></strong></div>
      <div><span>PROTOCOL FEE</span><b>{fee.toFixed(3)} ◎</b></div>
      <div className="nf-buy-total"><span>TOTAL</span><strong>{sol.toFixed(3)} <em>◎</em></strong></div>
    </section>
    {error&&<div className="nf-action-error">TRANSACTION REJECTED // {error}</div>}
    <footer className="nf-modal-footer">
      <button className="nf-secondary-btn" onClick={onClose}>ABORT</button>
      <div className="nf-buy-cta"><ActionButton label={`ACQUIRE ${sol.toFixed(3)} ◎`} loadingLabel="SIGNING TRANSACTION…" successLabel="ASSET ACQUIRED" status={status} onClick={async()=>{await buy(planet.publicKey,planet.asset,planet.owner);setTimeout(()=>onSuccess?.(),1500)}} variant="primary"/></div>
    </footer>
   </div>
 </div>
}
