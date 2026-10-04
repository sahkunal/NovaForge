'use client'
import{useState,useEffect,useCallback}from'react'
import{Connection,PublicKey}from'@solana/web3.js'
import{Planet}from'@/lib/types'
import{PROGRAM_ID}from'@/lib/pda'
const RPC=process.env.NEXT_PUBLIC_RPC_URL||'https://api.devnet.solana.com'
function parse(data:Buffer,pk:string):Planet|null{
  try{
    let o=8
    const pk32=()=>{const v=new PublicKey(data.slice(o,o+32)).toString();o+=32;return v}
    const u8=()=>{const v=data.readUInt8(o);o+=1;return v}
    const u16=()=>{const v=data.readUInt16LE(o);o+=2;return v}
    const u32=()=>{const v=data.readUInt32LE(o);o+=4;return v}
    const u64=()=>{const lo=data.readUInt32LE(o),hi=data.readUInt32LE(o+4);o+=8;return hi*0x100000000+lo}
    const i64=()=>{const lo=data.readUInt32LE(o),hi=data.readInt32LE(o+4);o+=8;return hi*0x100000000+lo}
    const bool=()=>{const v=data.readUInt8(o)!==0;o+=1;return v}
    const T:Record<number,string>={0:'Mining',1:'Energy',2:'Luxury',3:'Research',4:'Military'}
    const R:Record<number,string>={0:'Common',1:'Rare',2:'Epic',3:'Legendary'}
    const owner=pk32(),asset=pk32(),level=u16(),power=u32(),militaryPower=u32()
    const planetTypeIdx=u8(),rarityIdx=u8()
    const ironBalance=u64(),goldBalance=u64(),uraniumBalance=u64()
    const productionRate=u64(),population=u64(),researchers=u64()
    const colonized=bool(),lastClaimTs=i64(),createdAt=i64()
    const bump=u8(),threatLevel=u8(),inactive=bool(),listed=bool()
    const price=u64(),monsterPower=u32(),monsterTier=u8(),monstersKilled=u32()
    const lastMonsterKill=i64(),productionBoost=u8(),boostExpiry=i64()
    return{publicKey:pk,asset,owner,level,power,militaryPower,planetType:(T[planetTypeIdx]||'Mining') as any,rarity:(R[rarityIdx]||'Common') as any,ironBalance,goldBalance,uraniumBalance,productionRate,population,researchers,colonized,inactive,listed,price,lastClaimTs,createdAt,threatLevel,monsterPower,monsterTier,monstersKilled,productionBoost,boostExpiry}
  }catch(e){console.error('parse:',e);return null}
}
export function usePlanets(walletAddress:string|null){
  const[planets,setPlanets]=useState<Planet[]>([])
  const[loading,setLoading]=useState(false)
  const[error,setError]=useState<string|null>(null)
  const fetch=useCallback(async()=>{
    if(!walletAddress||typeof window==='undefined'){setPlanets([]);return}
    setLoading(true);setError(null)
    try{
      const conn=new Connection(RPC,'confirmed')
      const ownerPk=new PublicKey(walletAddress)
      let accounts:any[]=[]
      for(const size of[187,188,189,190]){
        const r=await conn.getProgramAccounts(PROGRAM_ID,{commitment:'confirmed',filters:[{dataSize:size},{memcmp:{offset:8,bytes:ownerPk.toBase58()}}]})
        if(r.length>0){accounts=r;break}
      }
      if(!accounts.length){
        accounts=await conn.getProgramAccounts(PROGRAM_ID,{commitment:'confirmed',filters:[{memcmp:{offset:8,bytes:ownerPk.toBase58()}}]})
      }
      const parsed=accounts.map(a=>parse(Buffer.from(a.account.data),a.pubkey.toString())).filter((p):p is Planet=>p!==null)
      setPlanets(parsed)
    }catch(e:any){setError(e.message);setPlanets([])}
    finally{setLoading(false)}
  },[walletAddress])
  useEffect(()=>{fetch()},[fetch])
  return{planets,loading,error,refetch:fetch}
}
