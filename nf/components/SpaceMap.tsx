'use client'
import{useEffect,useRef,useState,useCallback}from'react'
import{Planet,PLANET_COLORS,MONSTER_EMOJIS}from'@/lib/types'
interface Props{planets:Planet[];selectedId?:string|null;onSelectPlanet?:(id:string)=>void}
interface Particle{x:number;y:number;vx:number;vy:number;life:number;r:number;color:string}
interface Monster{pi:number;x:number;y:number;tx:number;ty:number;emoji:string;tier:number;flash:boolean}
const ORBIT_RADII=[0,95,145,190,230,265]
export default function SpaceMap({planets,selectedId,onSelectPlanet}:Props){
  const ref=useRef<HTMLCanvasElement>(null)
  const particlesRef=useRef<Particle[]>([])
  const monstersRef=useRef<Monster[]>([])
  const[dims,setDims]=useState({w:0,h:0})
  const getPPos=useCallback((i:number)=>{
    if(!dims.w)return{x:0,y:0}
    const cx=dims.w/2,cy=dims.h/2,r=ORBIT_RADII[i+1]||280
    const angle=(i/Math.max(planets.length,1))*Math.PI*2-Math.PI/2
    return{x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r}
  },[dims,planets.length])
  const spawnParticle=useCallback((x:number,y:number,color:string)=>{
    for(let i=0;i<6;i++)particlesRef.current.push({x,y,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4-1,life:1,r:Math.random()*3+1,color})
  },[])
  useEffect(()=>{
    const canvas=ref.current!
    const onResize=()=>{canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;setDims({w:canvas.offsetWidth,h:canvas.offsetHeight})}
    onResize();window.addEventListener('resize',onResize);return()=>window.removeEventListener('resize',onResize)
  },[])
  useEffect(()=>{
    if(!dims.w||!planets.length)return
    monstersRef.current=planets.map((p,i)=>{
      const pos=getPPos(i),angle=Math.random()*Math.PI*2
      const threatPct=Math.min(100,p.threatLevel)/100
      const d=p.monsterPower>0?18:Math.max(50,280-threatPct*220)
      return{pi:i,x:pos.x+Math.cos(angle)*d,y:pos.y+Math.sin(angle)*d,tx:pos.x,ty:pos.y,emoji:MONSTER_EMOJIS[p.planetType],tier:p.monsterTier||1,flash:false}
    })
  },[dims,planets,getPPos])
  useEffect(()=>{
    const canvas=ref.current!;if(!canvas||!dims.w)return
    const ctx=canvas.getContext('2d')!
    let t=0,raf:number
    function draw(){
      ctx.clearRect(0,0,dims.w,dims.h)
      const cx=dims.w/2,cy=dims.h/2
      // Background
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,dims.w*.6);bg.addColorStop(0,'#0d0820');bg.addColorStop(0.5,'#08051a');bg.addColorStop(1,'#03020f');ctx.fillStyle=bg;ctx.fillRect(0,0,dims.w,dims.h)
      // Stars
      ctx.fillStyle='#fff'
      for(let i=0;i<200;i++){const sx=(Math.sin(i*127.1)*43758.5)%1*dims.w,sy=(Math.sin(i*269.5)*43758.5)%1*dims.h,sr=i%7===0?1.4:i%3===0?0.9:0.5;ctx.globalAlpha=(0.2+0.6*Math.sin(t*0.008+i*0.8));ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1
      // Orbits
      for(let i=0;i<Math.min(planets.length,5);i++){
        ctx.save();ctx.beginPath();ctx.arc(cx,cy,ORBIT_RADII[i+1],0,Math.PI*2);const sel=planets[i]?.publicKey===selectedId;ctx.strokeStyle=sel?'rgba(124,58,237,0.4)':'rgba(124,58,237,0.1)';ctx.lineWidth=sel?1.5:0.5;ctx.setLineDash([4,12]);ctx.stroke();ctx.setLineDash([]);ctx.restore()
      }
      // Particles — update then draw
      particlesRef.current=particlesRef.current.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.life-=0.025;return p.life>0})
      for(const p of particlesRef.current){ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1
      // Monsters
      monstersRef.current.forEach(m=>{
        const pos=getPPos(m.pi);m.tx=pos.x;m.ty=pos.y
        const dx=m.tx-m.x,dy=m.ty-m.y,dist=Math.sqrt(dx*dx+dy*dy)
        const distFactor=Math.max(0.2,1-dist/280)
        const spd=(m.tier===3?1.2:m.tier===2?0.8:0.5)*(0.3+distFactor*0.7)
        if(dist>18){m.x+=(dx/dist)*spd;m.y+=(dy/dist)*spd}else{m.flash=true;spawnParticle(pos.x,pos.y,'#f43f5e');setTimeout(()=>{m.flash=false},450);const a=Math.random()*Math.PI*2,nd=100+Math.random()*60;m.x=pos.x+Math.cos(a)*nd;m.y=pos.y+Math.sin(a)*nd}
        ctx.save();ctx.font=`${m.flash?24:18}px serif`;ctx.globalAlpha=m.flash?1:0.88;ctx.textAlign='center';ctx.textBaseline='middle';if(m.flash){ctx.shadowColor='#f43f5e';ctx.shadowBlur=20}ctx.fillText(m.emoji,m.x,m.y);ctx.restore()
      })
      // Sun
      ctx.save()
      const sunG=ctx.createRadialGradient(cx,cy,0,cx,cy,26);sunG.addColorStop(0,'#fff');sunG.addColorStop(0.3,'#fde68a');sunG.addColorStop(0.7,'#f59e0b');sunG.addColorStop(1,'rgba(245,158,11,0)');ctx.fillStyle=sunG;ctx.beginPath();ctx.arc(cx,cy,26,0,Math.PI*2);ctx.fill()
      const corona=ctx.createRadialGradient(cx,cy,22,cx,cy,55);corona.addColorStop(0,'rgba(251,191,36,0.35)');corona.addColorStop(1,'transparent');ctx.fillStyle=corona;ctx.beginPath();ctx.arc(cx,cy,55,0,Math.PI*2);ctx.fill()
      ctx.restore()
      // Planets
      planets.forEach((p,i)=>{
        const pos=getPPos(i),col=PLANET_COLORS[p.planetType],sel=p.publicKey===selectedId
        // Glow
        if(sel||p.monsterPower>0){const g=ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,34);g.addColorStop(0,p.monsterPower>0?'rgba(244,63,94,0.4)':col.glow);g.addColorStop(1,'transparent');ctx.globalAlpha=0.7+0.3*Math.sin(t*0.08);ctx.fillStyle=g;ctx.beginPath();ctx.arc(pos.x,pos.y,34,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
        // Planet circle
        const pg=ctx.createRadialGradient(pos.x-6,pos.y-6,1,pos.x,pos.y,18)
        pg.addColorStop(0,'#fff');pg.addColorStop(0.15,col.primary);pg.addColorStop(1,col.secondary)
        ctx.beginPath();ctx.arc(pos.x,pos.y,18,0,Math.PI*2);ctx.fillStyle=pg;ctx.fill()
        if(sel){ctx.strokeStyle=col.primary;ctx.lineWidth=2;ctx.stroke()}
        // Status dot
        const dotColor=p.inactive?'#f43f5e':p.colonized?'#4ade80':'#475569'
        ctx.beginPath();ctx.arc(pos.x+14,pos.y-14,4,0,Math.PI*2);ctx.fillStyle=dotColor;ctx.fill()
        if(p.colonized&&!p.inactive){ctx.globalAlpha=0.5+0.5*Math.abs(Math.sin(t*0.06));ctx.beginPath();ctx.arc(pos.x+14,pos.y-14,6,0,Math.PI*2);ctx.strokeStyle='#4ade80';ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1}
        // Label
        ctx.font=sel?'bold 9px Orbitron,monospace':'8px Orbitron,monospace';ctx.fillStyle=sel?col.primary:'#475569';ctx.textAlign='center';ctx.fillText(p.planetType.slice(0,3).toUpperCase(),pos.x,pos.y+30)
        ctx.font='7px JetBrains Mono,monospace';ctx.fillStyle='#334155';ctx.fillText(`Lv${p.level}`,pos.x,pos.y+40)
      })
      t++;raf=requestAnimationFrame(draw)
    }
    draw();return()=>cancelAnimationFrame(raf)
  },[dims,planets,selectedId,getPPos,spawnParticle])
  const handleClick=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const rect=ref.current!.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top
    for(let i=0;i<planets.length;i++){const pos=getPPos(i),dx=mx-pos.x,dy=my-pos.y;if(dx*dx+dy*dy<26*26){onSelectPlanet?.(planets[i].publicKey);return}}
  },[planets,getPPos,onSelectPlanet])
  return<canvas ref={ref} onClick={handleClick} className="absolute inset-0 w-full h-full cursor-crosshair"/>
}
