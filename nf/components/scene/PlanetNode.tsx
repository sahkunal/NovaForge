'use client'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Planet } from '@/lib/types'
import { PLANET_COLORS } from '@/lib/types'

const SIZE:{[key:string]:number}={Common:.72,Rare:.86,Epic:1.02,Legendary:1.2}
const planetVertex=`varying vec3 vNormal;varying vec3 vWorld;varying vec2 vUv;void main(){vNormal=normalize(normalMatrix*normal);vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vWorld=wp.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const planetFrag=`uniform vec3 uPrimary;uniform vec3 uSecondary;uniform vec3 uLight;uniform float uTime;varying vec3 vNormal;varying vec3 vWorld;varying vec2 vUv;
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 p=normalize(vWorld*.42+vec3(0.0));float n=noise(p*3.1+uTime*.012);n+=.42*noise(p*8.0-uTime*.006);float bands=sin(p.y*18.+n*5.)*.5+.5;float terrain=smoothstep(.28,.74,n);vec3 base=mix(uSecondary,uPrimary,terrain);base=mix(base,base*1.35,bands*.22);float l=max(dot(normalize(vNormal),normalize(uLight)),0.0);float rim=pow(1.0-max(dot(normalize(vNormal),vec3(0,0,1)),0.0),3.2);vec3 c=base*(.16+.95*l)+uPrimary*rim*.16;float city=smoothstep(.75,.95,n)*smoothstep(.15,.8,1.-l);c+=uPrimary*city*.12;gl_FragColor=vec4(c,1.0);}`
const cloudFrag=`uniform vec3 uColor;uniform float uTime;varying vec3 vNormal;varying vec3 vWorld;float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}void main(){float n=noise(normalize(vWorld)*5.+uTime*.02)+.4*noise(normalize(vWorld)*13.-uTime*.01);float a=smoothstep(.56,.78,n)*.25;gl_FragColor=vec4(uColor,a);}`

function Ring({size,color}:{size:number;color:string}){return <group rotation={[Math.PI*.5,.15,.1]}><mesh><torusGeometry args={[size*1.55,size*.035,8,96]}/><meshBasicMaterial color={color} transparent opacity={.45}/></mesh><mesh rotation={[.15,0,.7]}><torusGeometry args={[size*1.82,size*.012,6,96]}/><meshBasicMaterial color={color} transparent opacity={.2}/></mesh></group>}

export default function PlanetNode({planet,orbitRadius,orbitOffset,verticalOffset,selected,onSelect}:{planet:Planet;orbitRadius:number;orbitOffset:number;verticalOffset:number;selected:boolean;onSelect:()=>void}){
 const group=useRef<THREE.Group>(null);const body=useRef<THREE.Mesh>(null);const cloud=useRef<THREE.Mesh>(null);const [hovered,setHovered]=useState(false)
 const colors=PLANET_COLORS[planet.planetType];const size=SIZE[planet.rarity]||.8
 const material=useMemo(()=>new THREE.ShaderMaterial({uniforms:{uPrimary:{value:new THREE.Color(colors.primary)},uSecondary:{value:new THREE.Color(colors.secondary)},uLight:{value:new THREE.Vector3(-.5,.55,1)},uTime:{value:0}},vertexShader:planetVertex,fragmentShader:planetFrag}),[colors.primary,colors.secondary])
 const cloudMat=useMemo(()=>new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color('#dff7ff')},uTime:{value:0}},vertexShader:planetVertex,fragmentShader:cloudFrag,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),[])
 useFrame((state,delta)=>{if(!group.current||!body.current)return;const t=state.clock.elapsedTime*.055+orbitOffset;group.current.position.set(Math.cos(t)*orbitRadius,verticalOffset+Math.sin(t*1.8)*.18,Math.sin(t)*orbitRadius);body.current.rotation.y+=delta*(.12+size*.04);if(cloud.current)cloud.current.rotation.y-=delta*.04;material.uniforms.uTime.value=state.clock.elapsedTime;cloudMat.uniforms.uTime.value=state.clock.elapsedTime;const target=selected?size*1.16:hovered?size*1.08:size;const s=THREE.MathUtils.lerp(body.current.scale.x,target,.09);body.current.scale.setScalar(s)})
 return <group ref={group}>
  <mesh scale={size*1.32}><sphereGeometry args={[1,32,32]}/><meshBasicMaterial color={colors.primary} transparent opacity={.075} blending={THREE.AdditiveBlending} side={THREE.BackSide}/></mesh>
  <mesh ref={body} scale={size} onClick={e=>{e.stopPropagation();onSelect()}} onPointerOver={()=>{setHovered(true);document.body.style.cursor='pointer'}} onPointerOut={()=>{setHovered(false);document.body.style.cursor='default'}}><sphereGeometry args={[1,64,64]}/><primitive object={material} attach="material"/></mesh>
  <mesh ref={cloud} scale={size*1.012}><sphereGeometry args={[1,48,48]}/><primitive object={cloudMat} attach="material"/></mesh>
  <mesh scale={size*1.035}><sphereGeometry args={[1,48,48]}/><meshBasicMaterial color={colors.primary} transparent opacity={.04} blending={THREE.AdditiveBlending} side={THREE.BackSide}/></mesh>
  {(planet.planetType==='Luxury'||planet.planetType==='Research'||planet.rarity==='Legendary')&&<Ring size={size} color={planet.rarity==='Legendary'?'#ffc766':colors.primary}/>} 
  {selected&&<><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[size*1.42,size*.016,8,96]}/><meshBasicMaterial color="#d7e8ff" transparent opacity={.9}/></mesh><pointLight color={colors.primary} intensity={1.6} distance={4}/></>}
  {planet.threatLevel>=50&&<mesh position={[0,size*1.42,0]}><sphereGeometry args={[.06,16,16]}/><meshBasicMaterial color="#ff3158"/></mesh>}
 </group>
}
