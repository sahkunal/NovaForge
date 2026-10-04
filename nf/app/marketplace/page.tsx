'use client'
import{useState,useEffect}from'react'
import dynamic from'next/dynamic'
import{Connection,PublicKey}from'@solana/web3.js'
import{useNovaWallet}from'@/lib/hooks/useWallet'
import{useCancelListing}from'@/lib/hooks/useAnchorActions'
import{Planet,PLANET_COLORS,RARITY_COLORS,formatNumber}from'@/lib/types'
import{PROGRAM_ID}from'@/lib/pda'
import NavigationBar from'@/components/NavigationBar'
import TopBar from'@/components/TopBar'
import EntryScreen from'@/components/EntryScreen'
import PlanetCanvas from'@/components/PlanetCanvas'
import ActionButton from'@/components/ActionButton'
import PlanetPurchaseModal from'@/components/PlanetPurchaseModal'
const StarField=dynamic(()=>import('@/components/StarField'),{ssr:false})
const RPC=process.env.NEXT_PUBLIC_RPC_URL||'https://api.devnet.solana.com'
function parseListed(data:Buffer,pk:string):Planet|null{
  try{
    let o=8
    const pk32=()=>{const v=new PublicKey(data.slice(o,o+32)).toString();o+=32;return v}
    const u8=()=>{const v=data.readUInt8(o);o+=1;return v}
    const u16=()=>{const v=data.readUInt16LE(o);o+=2;return v}
    const u32=()=>{const v=data.readUInt32LE(o);o+=4;return v}
    const u64=()=>{const lo=data.readUInt32LE(o),hi=data.readUInt32LE(o+4);o+=8;return hi*0x100000000+lo}
    const i64=()=>{const lo=data.readUInt32LE(o),hi=data.readInt32LE(o+4);o+=8;return hi*0x100000000+lo}
    const bool=()=>{const v=data.readUInt8(o)!==0;o+=1;return v}
    const TM:Record<number,string>={0:'Mining',1:'Energy',2:'Luxury',3:'Research',4:'Military'}
    const RM:Record<number,string>={0:'Common',1:'Rare',2:'Epic',3:'Legendary'}
    const owner=pk32(),asset=pk32(),level=u16(),power=u32(),militaryPower=u32(),planetTypeIdx=u8(),rarityIdx=u8()
    const ib=u64(),gb=u64(),ub=u64(),pr=u64(),pop=u64(),res=u64()
    const colonized=bool(),lastClaimTs=i64(),createdAt=i64(),bump=u8(),threatLevel=u8(),inactive=bool(),listed=bool()
    if(!listed)return null
    const price=u64(),monsterPower=u32(),monsterTier=u8(),monstersKilled=u32(),lmk=i64(),productionBoost=u8(),boostExpiry=i64()
    return{publicKey:pk,asset,owner,level,power,militaryPower,planetType:(TM[planetTypeIdx]||'Mining') as any,rarity:(RM[rarityIdx]||'Common') as any,ironBalance:ib,goldBalance:gb,uraniumBalance:ub,productionRate:pr,population:pop,researchers:res,colonized,inactive,listed,price,lastClaimTs,createdAt,threatLevel,monsterPower,monsterTier,monstersKilled,productionBoost,boostExpiry}
  }catch{return null}
}
export default function Marketplace(){
  const[mounted,setMounted]=useState(false)
  const[listings,setListings]=useState<Planet[]>([])
  const[selectedBuy,setSelectedBuy]=useState<Planet|null>(null)
  const[loading,setLoading]=useState(false)
  const{connected,publicKey}=useNovaWallet()
  const{execute:cancel,status:cs}=useCancelListing()
  useEffect(()=>{setMounted(true)},[])
  const fetchListings=async()=>{
    setLoading(true)
    try{
      const conn=new Connection(RPC,'confirmed')
      const accounts=await conn.getProgramAccounts(PROGRAM_ID,{commitment:'confirmed',filters:[{dataSize:187}]})
      const parsed=accounts.map(a=>parseListed(Buffer.from(a.account.data),a.pubkey.toString())).filter((p):p is Planet=>p!==null)
      setListings(parsed)
    }catch(e){console.error(e)}finally{setLoading(false)}
  }
  useEffect(()=>{if(connected)fetchListings()},[connected])
  if(!mounted)return null
  if(!connected)return<EntryScreen/>
  return(
    <div className="fixed inset-0 overflow-hidden">
      <StarField/><NavigationBar/><TopBar/>
      <div className="absolute inset-0 overflow-y-auto" style={{left:64,top:54}}>
        <div className="nf-market-shell">
          <div className="nf-market-grid"/>
          <div className="nf-market-header">
            <div><div className="nf-market-kicker">ASSET EXCHANGE // ORBITAL REAL ESTATE</div><h1 className="nf-market-title">PLANET <em>EXCHANGE</em></h1><p className="nf-market-sub">Acquire production worlds · inspect hostile history · settle in SOL</p></div>
            <div className="nf-market-scan"><i/> MARKET FEED // LIVE <button onClick={fetchListings} className="ml-3 text-[#a8bf8e] hover:text-white">↻</button></div>
          </div>
          <div className="nf-market-toolbar"><span className="nf-market-count"><strong>{listings.length}</strong> WORLDS ON EXCHANGE</span><span>1% PROTOCOL SETTLEMENT · DEVNET</span></div>
          {loading&&<div className="flex items-center justify-center py-20 gap-3"><svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#91aa76" strokeWidth="2.5" strokeDasharray="40" strokeDashoffset="20"/></svg><span style={{fontFamily:'Orbitron,monospace',fontSize:'11px',color:'#566252',letterSpacing:'0.15em'}}>SCANNING MARKET...</span></div>}
          {!loading&&listings.length===0&&<div className="text-center py-16"><div style={{fontSize:'56px',marginBottom:16}}>🏪</div><p style={{fontFamily:'Orbitron,monospace',fontSize:'13px',color:'#566252'}}>NO LISTINGS YET</p><p className="text-xs text-slate-600 mt-2">Uncolonize a planet and list it from the Dashboard to be the first seller</p></div>}
          {!loading&&listings.length>0&&(
            <div className="grid gap-5 p-8" style={{gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))'}}>
              {listings.map(p=>{
                const col=PLANET_COLORS[p.planetType],rc=RARITY_COLORS[p.rarity],isOwn=p.owner===publicKey,sol=(p.price/1e9).toFixed(3)
                return(
                  <div key={p.publicKey} className="nf-market-card rounded-2xl overflow-hidden" style={{background:'rgba(8,6,22,0.92)',border:`1px solid ${col.primary}30`,boxShadow:`0 0 20px ${col.glow}15`}}>
                    <div className="h-0.5" style={{background:`linear-gradient(to right,transparent,${col.primary},transparent)`}}/>
                    <div className="p-5 nf-market-card-body">
                      <div className="flex items-center gap-3 mb-4"><PlanetCanvas planetType={p.planetType} rarity={p.rarity} size={52}/><div className="flex-1"><div className="flex gap-1 flex-wrap mb-1"><span className="badge" style={{color:col.primary,borderColor:`${col.primary}40`,fontSize:'8px'}}>{p.planetType}</span><span className="badge" style={{color:rc,borderColor:`${rc}40`,fontSize:'8px'}}>{p.rarity}</span><span className="badge badge-purple" style={{fontSize:'8px'}}>Lv{p.level}</span></div><div className="text-xs text-slate-500 font-mono">{p.publicKey.slice(0,14)}...</div></div>{isOwn&&<span className="badge badge-teal" style={{fontSize:'8px'}}>YOURS</span>}</div>
                      <div className="grid grid-cols-3 gap-2 mb-4">{[{l:'Power',v:formatNumber(p.power),c:'#a8bf8e'},{l:'Military',v:formatNumber(p.militaryPower),c:'#f43f5e'},{l:'Kills',v:p.monstersKilled,c:'#c4a56a'}].map(({l,v,c})=><div key={l} className="text-center rounded-lg py-2" style={{background:'rgba(255,255,255,0.03)'}}><div style={{fontFamily:'Orbitron,monospace',fontSize:'14px',fontWeight:700,color:c}}>{v}</div><div className="text-xs text-slate-600">{l}</div></div>)}</div>
                      <div className="flex items-center justify-between mb-3"><div><div className="text-[8px] tracking-[.18em] text-[#566252] mb-1">SETTLEMENT</div><div className="nf-market-price">{sol} <span className="text-[#91aa76] text-sm">◎ SOL</span></div></div>{isOwn?<ActionButton label="Cancel" loadingLabel="..." successLabel="✓" status={cs} onClick={()=>cancel(p.publicKey,p.asset)} variant="ghost" className="w-auto px-4"/>:<button className="nf-market-buy" onClick={()=>setSelectedBuy(p)}>ACQUIRE {sol} ◎ <span>→</span></button>}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      {selectedBuy&&<PlanetPurchaseModal planet={selectedBuy} onClose={()=>setSelectedBuy(null)} onSuccess={()=>{setSelectedBuy(null);fetchListings()}}/>}
    </div>
  )
}
