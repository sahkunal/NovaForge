'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function OrbitRing({radius}:{radius:number}){
  const geometry=useMemo(()=>{
    const points=[] as THREE.Vector3[]
    for(let i=0;i<160;i++){const a=(i/160)*Math.PI*2;points.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius))}
    return new THREE.BufferGeometry().setFromPoints(points)
  },[radius])
  return <lineLoop geometry={geometry}><lineBasicMaterial color="#172b42" transparent opacity={.52}/></lineLoop>
}
