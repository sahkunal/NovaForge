'use client'
import{useCallback,useState}from'react'
import{Connection,PublicKey,SystemProgram,Transaction,TransactionInstruction,Keypair}from'@solana/web3.js'
import{PROGRAM_ID,MPL_CORE_ID,findPlanetPda,findTreasuryPda}from'@/lib/pda'
export type ActionStatus='idle'|'pending'|'success'|'error'
const RPC=process.env.NEXT_PUBLIC_RPC_URL||'https://api.devnet.solana.com'
function getPhantom(){const p=(window as any).solana;if(!p?.isPhantom||!p.isConnected)throw new Error('Phantom not connected');return p}
function getConn(){return new Connection(RPC,{commitment:'confirmed',confirmTransactionInitialTimeout:120000})}
async function disc(name:string):Promise<Buffer>{const e=new TextEncoder().encode(`global:${name}`);const h=await crypto.subtle.digest('SHA-256',e);return Buffer.from(new Uint8Array(h).slice(0,8))}
function encEnum(variants:string[],name:string):Buffer{const i=variants.indexOf(name);if(i<0)throw new Error(`Unknown:${name}`);return Buffer.from([i])}
async function sendTx(conn:Connection,phantom:any,ixs:TransactionInstruction[],extra:Keypair[]=[]):Promise<string>{
  let lastErr:any
  for(let attempt=0;attempt<3;attempt++){
    try{
      const{blockhash,lastValidBlockHeight}=await conn.getLatestBlockhash('finalized')
      const tx=new Transaction();tx.recentBlockhash=blockhash;tx.feePayer=phantom.publicKey
      ixs.forEach(ix=>tx.add(ix));if(extra.length)tx.partialSign(...extra)
      const signed=await phantom.signTransaction(tx)
      let sig:string
      try{sig=await conn.sendRawTransaction(signed.serialize(),{skipPreflight:false,preflightCommitment:'confirmed'})}
      catch(e:any){const logs=e?.logs||[];console.error('Simulate error:',logs);throw new Error(logs.find((l:string)=>l.includes('Error')||l.includes('error'))||e?.message||'Simulation failed')}
      console.log(`TX sent (attempt ${attempt+1}):`,sig)
      for(let i=0;i<45;i++){
        await new Promise(r=>setTimeout(r,2000))
        const s=await conn.getSignatureStatus(sig,{searchTransactionHistory:true})
        const cs=s?.value?.confirmationStatus
        if(cs==='confirmed'||cs==='finalized'){console.log('✅ Confirmed!');return sig}
        if(s?.value?.err)throw new Error(`TX failed: ${JSON.stringify(s.value.err)}`)
      }
      throw new Error('Timeout')
    }catch(e:any){
      lastErr=e
      if(e?.message?.includes('block height exceeded')||e?.message?.includes('Blockhash not found')){continue}
      throw e
    }
  }
  throw lastErr
}
function useAction(){
  const[status,setStatus]=useState<ActionStatus>('idle')
  const[error,setError]=useState<string|null>(null)
  const run=useCallback(async(fn:()=>Promise<string>)=>{
    setStatus('pending');setError(null)
    try{const sig=await fn();console.log('✅ TX:',sig);setStatus('success');setTimeout(()=>setStatus('idle'),2500);return sig}
    catch(e:any){console.error('❌',e);setError((e?.message||'Failed').slice(0,200));setStatus('error');setTimeout(()=>setStatus('idle'),5000)}
  },[])
  return{status,error,run}
}
export function useInitializePlanet(){
  const[status,setStatus]=useState<ActionStatus>('idle')
  const[error,setError]=useState<string|null>(null)
  const execute=useCallback(async(planetType:string,rarity:string)=>{
    setStatus('pending');setError(null)
    try{
      const phantom=getPhantom(),conn=getConn()
      const asset=Keypair.generate()
      const[planet]=findPlanetPda(asset.publicKey)
      const PT=['Mining','Energy','Luxury','Research','Military']
      const RA=['Common','Rare','Epic','Legendary']
      const d=await disc('initialize_planet')
      const data=Buffer.concat([d,encEnum(PT,planetType),encEnum(RA,rarity)])
      const ix=new TransactionInstruction({programId:PROGRAM_ID,keys:[{pubkey:phantom.publicKey,isSigner:true,isWritable:true},{pubkey:planet,isSigner:false,isWritable:true},{pubkey:asset.publicKey,isSigner:false,isWritable:true},{pubkey:MPL_CORE_ID,isSigner:false,isWritable:false},{pubkey:SystemProgram.programId,isSigner:false,isWritable:false}],data})
      const sig=await sendTx(conn,phantom,[ix])
      console.log('✅ Planet:',planet.toString())
      setStatus('success');setTimeout(()=>setStatus('idle'),2500);return planet.toString()
    }catch(e:any){console.error('❌ Mint:',e);setError((e?.message||'Mint failed').slice(0,200));setStatus('error');setTimeout(()=>setStatus('idle'),5000)}
  },[])
  return{execute,status,error}
}
function makeHook(ixName:string,getKeys:(ph:any,...a:any[])=>any[]){
  return()=>{
    const{status,error,run}=useAction()
    const execute=useCallback(async(...params:any[])=>{
      await run(async()=>{
        const phantom=getPhantom(),conn=getConn()
        return sendTx(conn,phantom,[new TransactionInstruction({programId:PROGRAM_ID,keys:getKeys(phantom,...params),data:await disc(ixName)})])
      })
    },[run])
    return{execute,status,error}
  }
}
export const useColonize=makeHook('colonize_planet',(ph,pda)=>[{pubkey:ph.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true}])
export const useUncolonize=makeHook('uncolonize_planet',(ph,pda)=>[{pubkey:ph.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true}])
export const useClaimResources=makeHook('claim_resources',(ph,pda)=>[{pubkey:ph.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true}])
export const useUpgradePlanet=makeHook('upgrade_planet',(ph,pda)=>[{pubkey:ph.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true}])
export const useUpgradeMilitary=makeHook('upgrade_military',(ph,pda)=>[{pubkey:ph.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true}])
export const useRepairPlanet=makeHook('repair_planet',(ph,pda)=>[{pubkey:ph.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true}])
export function useListPlanet(){
  const{status,error,run}=useAction()
  const execute=useCallback(async(pda:string,assetKey:string,priceSOL:number)=>{
    await run(async()=>{
      const phantom=getPhantom(),conn=getConn(),d=await disc('list_planet')
      const pb=Buffer.allocUnsafe(8);pb.writeBigUInt64LE(BigInt(Math.floor(priceSOL*1e9)))
      return sendTx(conn,phantom,[new TransactionInstruction({programId:PROGRAM_ID,keys:[{pubkey:phantom.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true},{pubkey:new PublicKey(assetKey),isSigner:false,isWritable:true},{pubkey:MPL_CORE_ID,isSigner:false,isWritable:false},{pubkey:SystemProgram.programId,isSigner:false,isWritable:false}],data:Buffer.concat([d,pb])})])
    })
  },[run])
  return{execute,status,error}
}
export function useBuyPlanet(){
  const{status,error,run}=useAction()
  const execute=useCallback(async(pda:string,assetKey:string,sellerKey:string)=>{
    await run(async()=>{
      const phantom=getPhantom(),conn=getConn(),[treasury]=findTreasuryPda()
      return sendTx(conn,phantom,[new TransactionInstruction({programId:PROGRAM_ID,keys:[{pubkey:phantom.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(sellerKey),isSigner:false,isWritable:true},{pubkey:treasury,isSigner:false,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true},{pubkey:new PublicKey(assetKey),isSigner:false,isWritable:true},{pubkey:MPL_CORE_ID,isSigner:false,isWritable:false},{pubkey:SystemProgram.programId,isSigner:false,isWritable:false}],data:await disc('buy_planet')})])
    })
  },[run])
  return{execute,status,error}
}
export function useCancelListing(){
  const{status,error,run}=useAction()
  const execute=useCallback(async(pda:string,assetKey:string)=>{
    await run(async()=>{
      const phantom=getPhantom(),conn=getConn()
      return sendTx(conn,phantom,[new TransactionInstruction({programId:PROGRAM_ID,keys:[{pubkey:phantom.publicKey,isSigner:true,isWritable:true},{pubkey:new PublicKey(pda),isSigner:false,isWritable:true},{pubkey:new PublicKey(assetKey),isSigner:false,isWritable:true},{pubkey:MPL_CORE_ID,isSigner:false,isWritable:false},{pubkey:SystemProgram.programId,isSigner:false,isWritable:false}],data:await disc('cancel_listing')})])
    })
  },[run])
  return{execute,status,error}
}
