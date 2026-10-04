'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
export default function AsteroidField(){const group=useRef<THREE.Group>(null);const data=useMemo(()=>{const count=360;return Array.from({length:count},(_,i)=>{const a=Math.random()*Math.PI*2;const r=15+Math.random()*14;return {p:[Math.cos(a)*r,(Math.random()-.5)*2.8,Math.sin(a)*r] as [number,number,number],s:.025+Math.random()*.12,rot:[Math.random()*3,Math.random()*3,Math.random()*3] as [number,number,number]}})},[]);useFrame((_,d)=>{if(group.current)group.current.rotation.y+=d*.004});return <group ref={group}>{data.map((a,i)=><mesh key={i} position={a.p} rotation={a.rot} scale={a.s}><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color={i%7===0?'#756b72':'#343b43'} roughness={.92} metalness={.18}/></mesh>)}</group>}
