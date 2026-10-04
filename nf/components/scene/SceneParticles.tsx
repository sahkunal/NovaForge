'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
export default function SceneParticles(){const positions=useMemo(()=>{const count=5200,a=new Float32Array(count*3);for(let i=0;i<count;i++){const r=28+Math.random()*110,theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1);a[i*3]=r*Math.sin(phi)*Math.cos(theta);a[i*3+1]=r*Math.cos(phi);a[i*3+2]=r*Math.sin(phi)*Math.sin(theta)}return a},[]);return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><pointsMaterial color="#d9e7ff" size={.035} sizeAttenuation transparent opacity={.78}/></points>}
