'use client'
import { useEffect, useRef } from 'react'
export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const stars = Array.from({length:400},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.6+0.2,a:Math.random()*0.9+0.1,ph:Math.random()*Math.PI*2,sp:Math.random()*0.0015+0.0005,col:Math.random()>0.92?'#a78bfa':Math.random()>0.88?'#5eead4':Math.random()>0.85?'#fbbf24':'#fff'}))
    const nebulae=[{x:0.15,y:0.2,r:280,c:'124,58,237',a:0.07},{x:0.8,y:0.15,r:220,c:'15,158,138',a:0.05},{x:0.5,y:0.85,r:200,c:'124,58,237',a:0.05},{x:0.9,y:0.6,r:180,c:'96,165,250',a:0.04}]
    let t=0,raf:number
    function draw(){
      ctx.clearRect(0,0,c.width,c.height)
      const bg=ctx.createRadialGradient(c.width*.5,c.height*.5,0,c.width*.5,c.height*.5,c.width*.8)
      bg.addColorStop(0,'#0d0820');bg.addColorStop(0.5,'#08051a');bg.addColorStop(1,'#03020f')
      ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height)
      for(const n of nebulae){const g=ctx.createRadialGradient(c.width*n.x,c.height*n.y,0,c.width*n.x,c.height*n.y,n.r);g.addColorStop(0,`rgba(${n.c},${n.a})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c.width*n.x,c.height*n.y,n.r,0,Math.PI*2);ctx.fill()}
      for(const s of stars){ctx.globalAlpha=s.a*(0.4+0.6*Math.sin(t*s.sp+s.ph));ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(s.x*c.width,s.y*c.height,s.r,0,Math.PI*2);ctx.fill()}
      ctx.globalAlpha=1;t++;raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none"/>
}
