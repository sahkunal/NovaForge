'use client'
import { useEffect, useRef } from 'react'
import { PlanetType, Rarity, PLANET_COLORS, RARITY_COLORS } from '@/lib/types'
interface Props{planetType:PlanetType;rarity:Rarity;size?:number;animated?:boolean;hasRing?:boolean;className?:string}
export default function PlanetCanvas({planetType,rarity,size=80,animated=true,hasRing=false,className=''}:Props){
  const ref=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const canvas=ref.current!,ctx=canvas.getContext('2d')!
    const dpr=window.devicePixelRatio||1
    canvas.width=size*2*dpr;canvas.height=size*2*dpr;canvas.style.width=`${size*2}px`;canvas.style.height=`${size*2}px`
    ctx.scale(dpr,dpr)
    const cx=size,cy=size,r=size*0.74,col=PLANET_COLORS[planetType],rc=RARITY_COLORS[rarity]
    let angle=0,t=0,raf:number
    function draw(){
      ctx.clearRect(0,0,size*2,size*2)
      for(const[gr,ga] of [[r*3.2,0.06],[r*2.5,0.1],[r*2.0,0.16]]){
        const g=ctx.createRadialGradient(cx,cy,r*0.4,cx,cy,gr as number);g.addColorStop(0,col.glow);g.addColorStop(1,'transparent')
        ctx.globalAlpha=ga as number;ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,gr as number,0,Math.PI*2);ctx.fill()
      }
      ctx.globalAlpha=1
      if(hasRing){ctx.save();ctx.translate(cx,cy);ctx.scale(1,0.26);ctx.beginPath();ctx.arc(0,0,r*1.6,0,Math.PI*2);ctx.strokeStyle='rgba(210,185,110,0.6)';ctx.lineWidth=7;ctx.stroke();ctx.restore()}
      const main=ctx.createRadialGradient(cx-r*0.38,cy-r*0.38,r*0.03,cx+r*0.12,cy+r*0.12,r*1.25)
      main.addColorStop(0,'#fff');main.addColorStop(0.06,col.primary);main.addColorStop(0.3,col.secondary);main.addColorStop(1,'#00000a')
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=main;ctx.fill()
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip()
      for(let i=0;i<6;i++){const y=cy-r+(r*2/6)*i+r*0.08,wv=Math.sin(angle*0.6+i*1.1)*9;ctx.beginPath();ctx.moveTo(cx-r,y+wv);ctx.bezierCurveTo(cx-r*0.3,y+wv+16,cx+r*0.3,y-wv-12,cx+r,y+wv);ctx.strokeStyle=`rgba(255,255,255,${0.03+i*0.015})`;ctx.lineWidth=r*0.16;ctx.stroke()}
      const sh=ctx.createRadialGradient(cx+r*0.45,cy+r*0.45,0,cx,cy,r*1.12);sh.addColorStop(0,'transparent');sh.addColorStop(0.52,'transparent');sh.addColorStop(1,'rgba(0,0,15,0.75)')
      ctx.fillStyle=sh;ctx.fillRect(cx-r,cy-r,r*2,r*2)
      const sp=ctx.createRadialGradient(cx-r*0.4,cy-r*0.4,0,cx-r*0.3,cy-r*0.3,r*0.52);sp.addColorStop(0,'rgba(255,255,255,0.3)');sp.addColorStop(1,'transparent')
      ctx.fillStyle=sp;ctx.fillRect(cx-r,cy-r,r*2,r*2);ctx.restore()
      if(rarity!=='Common'){const pulse=0.6+0.4*Math.sin(t*0.04);ctx.beginPath();ctx.arc(cx,cy,r+4+Math.sin(t*0.05)*2,0,Math.PI*2);ctx.strokeStyle=rc;ctx.lineWidth=rarity==='Legendary'?2.5:1.5;ctx.globalAlpha=(rarity==='Legendary'?0.9:0.55)*pulse;ctx.stroke();ctx.globalAlpha=1}
      if(animated){angle+=0.004;t++;raf=requestAnimationFrame(draw)}
    }
    draw();return()=>cancelAnimationFrame(raf)
  },[planetType,rarity,size,animated,hasRing])
  return <canvas ref={ref} className={className} style={{width:`${size}px`,height:`${size}px`}}/>
}
