'use client'
import{useEffect,useRef,useState,useCallback}from 'react'
import{Planet,PLANET_COLORS,RARITY_COLORS,getThreatLevel,MONSTER_EMOJIS}from '@/lib/types'
interface Props{planets:Planet[];onSelectPlanet:(p:Planet)=>void;selectedId?:string}
interface Monster{pi:number;x:number;y:number;tx:number;ty:number;emoji:string;tier:number;flash:boolean}
interface Particle{x:number;y:number;vx:number;vy:number;life:number;r:number;color:string}
export default function SpaceMap({planets,onSelectPlanet,selectedId}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const monstersRef=useRef<Monster[]>([])
  const particlesRef=useRef<Particle[]>([])
  const anglesRef=useRef<number[]>([])
  const[hoverId,setHoverId]=useState<string|null>(null)
  const getOrbits=useCallback(()=>planets.map((_,i)=>({r:145+i*88,speed:0.00027+i*0.000062,tilt:0.35+i*0.04})),[planets])
  useEffect(()=>{
    if(!planets.length) return
    const canvas=canvasRef.current!,ctx=canvas.getContext('2d')!
    let raf:number,t=0
    const resize=()=>{canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight}
    resize();window.addEventListener('resize',resize)
    const orbits=getOrbits()
    if(anglesRef.current.length!==planets.length) anglesRef.current=planets.map((_,i)=>(i/planets.length)*Math.PI*2)
    const stars=Array.from({length:320},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.5+0.2,a:Math.random()*0.85+0.15,ph:Math.random()*Math.PI*2,c:Math.random()>0.92?'#a78bfa':Math.random()>0.88?'#5eead4':'#fff'}))
    const getSun=()=>({x:canvas.width*0.5,y:canvas.height*0.5})
    const getPPos=(i:number)=>{const s=getSun(),o=orbits[i],a=anglesRef.current[i];return{x:s.x+Math.cos(a)*o.r,y:s.y+Math.sin(a)*o.r*o.tilt}}
    monstersRef.current=[]
    planets.forEach((p,i)=>{
      // ALL planets have monsters lurking - distance depends on threat level
      // This makes the map always dramatic and alive
      const pos=getPPos(i)
      const angle=Math.random()*Math.PI*2
      // Safe = far away (300px), Critical = close (50px), Attacking = on planet
      const threatPct = Math.min(100, p.threatLevel) / 100
      const d = p.monsterPower > 0 ? 20 : Math.max(50, 300 - threatPct * 250)
      monstersRef.current.push({
        pi:i, x:pos.x+Math.cos(angle)*d, y:pos.y+Math.sin(angle)*d,
        tx:pos.x, ty:pos.y,
        emoji:MONSTER_EMOJIS[p.planetType],
        tier:p.monsterTier||1,
        flash:false
      })
    })
    const spawnP=(x:number,y:number,color:string)=>{for(let i=0;i<8;i++)particlesRef.current.push({x,y,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,life:1,r:Math.random()*3+1,color})}
    function drawPlanet(pos:{x:number,y:number},planet:Planet,r:number){
      const c=PLANET_COLORS[planet.planetType]
      for(const[gr,ga] of[[r*3,0.05],[r*2.2,0.1],[r*1.7,0.18]]){const g=ctx.createRadialGradient(pos.x,pos.y,r*0.3,pos.x,pos.y,gr as number);g.addColorStop(0,c.glow);g.addColorStop(1,'transparent');ctx.globalAlpha=ga as number;ctx.fillStyle=g;ctx.beginPath();ctx.arc(pos.x,pos.y,gr as number,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1
      const main=ctx.createRadialGradient(pos.x-r*0.38,pos.y-r*0.38,r*0.03,pos.x+r*0.1,pos.y+r*0.1,r*1.22)
      main.addColorStop(0,'#fff');main.addColorStop(0.08,c.primary);main.addColorStop(0.38,c.secondary);main.addColorStop(1,'#00000c')
      ctx.beginPath();ctx.arc(pos.x,pos.y,r,0,Math.PI*2);ctx.fillStyle=main;ctx.fill()
      ctx.save();ctx.beginPath();ctx.arc(pos.x,pos.y,r,0,Math.PI*2);ctx.clip()
      const sh=ctx.createRadialGradient(pos.x+r*0.4,pos.y+r*0.4,0,pos.x,pos.y,r*1.12);sh.addColorStop(0,'transparent');sh.addColorStop(0.5,'transparent');sh.addColorStop(1,'rgba(0,0,18,0.72)');ctx.fillStyle=sh;ctx.fillRect(pos.x-r,pos.y-r,r*2,r*2)
      const sp=ctx.createRadialGradient(pos.x-r*0.4,pos.y-r*0.4,0,pos.x-r*0.3,pos.y-r*0.3,r*0.52);sp.addColorStop(0,'rgba(255,255,255,0.3)');sp.addColorStop(1,'transparent');ctx.fillStyle=sp;ctx.fillRect(pos.x-r,pos.y-r,r*2,r*2)
      if(planet.inactive){ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(pos.x-r,pos.y-r,r*2,r*2)}
      ctx.restore()
      if(planet.colonized&&!planet.inactive){ctx.beginPath();ctx.arc(pos.x+r*0.7,pos.y-r*0.7,4,0,Math.PI*2);ctx.fillStyle='#4ade80';ctx.shadowBlur=10;ctx.shadowColor='#4ade80';ctx.fill();ctx.shadowBlur=0}
      if(planet.inactive){ctx.font=`${r*0.65}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💀',pos.x,pos.y)}
    }
    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height)
      const bg=ctx.createRadialGradient(canvas.width*.5,canvas.height*.5,0,canvas.width*.5,canvas.height*.5,canvas.width*.75);bg.addColorStop(0,'#0e0920');bg.addColorStop(0.5,'#080518');bg.addColorStop(1,'#03020f');ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height)
      for(const[fx,fy,fc,fr] of[[0.2,0.2,'124,58,237',260],[0.8,0.15,'15,158,138',200],[0.5,0.85,'124,58,237',180],[0.92,0.6,'96,165,250',150]]){const ng=ctx.createRadialGradient(canvas.width*(fx as number),canvas.height*(fy as number),0,canvas.width*(fx as number),canvas.height*(fy as number),fr as number);ng.addColorStop(0,`rgba(${fc},0.07)`);ng.addColorStop(1,'transparent');ctx.fillStyle=ng;ctx.beginPath();ctx.arc(canvas.width*(fx as number),canvas.height*(fy as number),fr as number,0,Math.PI*2);ctx.fill()}
      for(const s of stars){ctx.globalAlpha=s.a*(0.4+0.6*Math.sin(t*0.002+s.ph));ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x*canvas.width,s.y*canvas.height,s.r,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1
      const sun=getSun()
      for(const[r2,a,c] of[[240,0.012,'#f59e0b'],[160,0.035,'#fbbf24'],[90,0.08,'#fde68a'],[48,0.3,'#fff7aa'],[26,0.8,'#fffde7'],[14,1,'#fff']]){const sg=ctx.createRadialGradient(sun.x,sun.y,0,sun.x,sun.y,r2 as number);sg.addColorStop(0,c as string);sg.addColorStop(1,'transparent');ctx.globalAlpha=a as number;ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sun.x,sun.y,r2 as number,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1
      orbits.forEach((o,i)=>{
        anglesRef.current[i]+=o.speed
        ctx.save();ctx.translate(sun.x,sun.y);ctx.scale(1,o.tilt);ctx.beginPath();ctx.arc(0,0,o.r,0,Math.PI*2)
        const sel=planets[i]?.publicKey===selectedId;ctx.strokeStyle=sel?'rgba(124,58,237,0.4)':'rgba(124,58,237,0.1)';ctx.lineWidth=sel?1.5:0.5;ctx.setLineDash([4,12]);ctx.stroke();ctx.setLineDash([]);ctx.restore()
      })
      // Update particles
      particlesRef.current = particlesRef.current.filter(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life-=0.025; return p.life>0
      })
      // Draw particles separately
      for(const p of particlesRef.current){
        ctx.globalAlpha=p.life; ctx.fillStyle=p.color
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill()
      }
      ctx.globalAlpha=1
      monstersRef.current.forEach(m=>{
        const pos=getPPos(m.pi);m.tx=pos.x;m.ty=pos.y
        const dx=m.tx-m.x,dy=m.ty-m.y,dist=Math.sqrt(dx*dx+dy*dy)
        // Speed increases as monster gets closer to planet
        const distFactor = Math.max(0.2, 1 - dist/300)
        const spd=(m.tier===3?1.2:m.tier===2?0.8:0.5) * (0.3 + distFactor * 0.7)
        if(dist>18){m.x+=(dx/dist)*spd;m.y+=(dy/dist)*spd}else{m.flash=true;spawnP(pos.x,pos.y,'#f43f5e');setTimeout(()=>{m.flash=false},450);const a=Math.random()*Math.PI*2,d=120+Math.random()*60;m.x=pos.x+Math.cos(a)*d;m.y=pos.y+Math.sin(a)*d}
        const tc=m.tier===3?'#f43f5e':m.tier===2?'#f97316':'#fbbf24'
        if(dist<150){ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(pos.x,pos.y);const bAlpha=(1-dist/150)*0.7;ctx.strokeStyle=`${tc}${Math.floor(bAlpha*255).toString(16).padStart(2,'0')}`;ctx.lineWidth=m.tier===3?2.5:1.5;ctx.stroke()}
        const mg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,32);mg.addColorStop(0,`${tc}55`);mg.addColorStop(1,'transparent');ctx.fillStyle=mg;ctx.beginPath();ctx.arc(m.x,m.y,32,0,Math.PI*2);ctx.fill()
        ctx.font=`${17+m.tier*3}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.globalAlpha=1;ctx.fillText(m.emoji,m.x,m.y)
        ctx.font='7px Orbitron,monospace';ctx.fillStyle=tc;ctx.fillText(['','SCOUT','RAIDER','WARLORD'][m.tier],m.x,m.y+26)
        if(m.flash){const fl=ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,60);fl.addColorStop(0,'rgba(244,63,94,0.9)');fl.addColorStop(0.5,'rgba(244,63,94,0.35)');fl.addColorStop(1,'transparent');ctx.fillStyle=fl;ctx.beginPath();ctx.arc(pos.x,pos.y,60,0,Math.PI*2);ctx.fill()}
      })
      planets.forEach((planet,i)=>{
        const pos=getPPos(i),threat=getThreatLevel(planet.threatLevel),r=16+planet.level*2.8
        const isSel=planet.publicKey===selectedId,isHov=planet.publicKey===hoverId,rc=RARITY_COLORS[planet.rarity]
        if(threat==='critical'){ctx.globalAlpha=0.5+0.45*Math.sin(t*0.16);ctx.beginPath();ctx.arc(pos.x,pos.y,r+18+Math.sin(t*0.12)*5,0,Math.PI*2);ctx.strokeStyle='#f43f5e';ctx.lineWidth=2.5;ctx.stroke();ctx.globalAlpha=1}
        else if(threat==='danger'){ctx.globalAlpha=0.3+0.25*Math.sin(t*0.09);ctx.beginPath();ctx.arc(pos.x,pos.y,r+11,0,Math.PI*2);ctx.strokeStyle='#f97316';ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1}
        else if(threat==='warn'){ctx.globalAlpha=0.18+0.15*Math.sin(t*0.06);ctx.beginPath();ctx.arc(pos.x,pos.y,r+8,0,Math.PI*2);ctx.strokeStyle='#fbbf24';ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1}
        drawPlanet(pos,planet,r)
        if(planet.rarity!=='Common'){ctx.beginPath();ctx.arc(pos.x,pos.y,r+3,0,Math.PI*2);ctx.strokeStyle=rc;ctx.lineWidth=1.2;ctx.globalAlpha=0.55;ctx.stroke();ctx.globalAlpha=1}
        if(isSel||isHov){ctx.beginPath();ctx.arc(pos.x,pos.y,r+5,0,Math.PI*2);ctx.strokeStyle=isSel?'#7c3aed':PLANET_COLORS[planet.planetType].primary;ctx.lineWidth=isSel?3:1.5;ctx.stroke()}
        if(isSel){ctx.beginPath();ctx.arc(pos.x,pos.y,r+12,0,Math.PI*2);ctx.strokeStyle='rgba(124,58,237,0.4)';ctx.lineWidth=1;ctx.stroke()}
        if(isSel||isHov){const label=`${planet.planetType} Lv${planet.level}`,lw=ctx.measureText(label).width+18;ctx.fillStyle='rgba(6,4,18,0.9)';ctx.beginPath();(ctx as any).roundRect?.(pos.x-lw/2,pos.y+r+8,lw,20,5);ctx.fill();ctx.fillStyle=isSel?'#a78bfa':PLANET_COLORS[planet.planetType].primary;ctx.font='8px Orbitron,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,pos.x,pos.y+r+18)}
      })
      t++;raf=requestAnimationFrame(draw)
    }
    draw()
    const getHit=(mx:number,my:number)=>planets.find((_,i)=>{const p=getPPos(i);const r=16+planets[i].level*2.8+12;return Math.hypot(mx-p.x,my-p.y)<r})
    const onClick=(e:MouseEvent)=>{const rect=canvas.getBoundingClientRect();const hit=getHit(e.clientX-rect.left,e.clientY-rect.top);if(hit)onSelectPlanet(hit)}
    const onMove=(e:MouseEvent)=>{const rect=canvas.getBoundingClientRect();const hit=getHit(e.clientX-rect.left,e.clientY-rect.top);setHoverId(hit?.publicKey??null);canvas.style.cursor=hit?'pointer':'default'}
    canvas.addEventListener('click',onClick);canvas.addEventListener('mousemove',onMove)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);canvas.removeEventListener('click',onClick);canvas.removeEventListener('mousemove',onMove)}
  },[planets,onSelectPlanet,selectedId,hoverId,getOrbits])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/>
}