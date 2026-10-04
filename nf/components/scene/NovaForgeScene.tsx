'use client'
import { Canvas,useFrame,useThree } from '@react-three/fiber'
import { useEffect,useMemo,useRef } from 'react'
import * as THREE from 'three'
import type { Planet } from '@/lib/types'
import PlanetNode from './PlanetNode'
import SunCore from './SunCore'
import SceneParticles from './SceneParticles'
import AsteroidField from './AsteroidField'
import MonsterFleet from './MonsterFleet'
import AttackFleet from './AttackFleet'
import OrbitRing from './OrbitRing'
import SpaceBackdrop from './SpaceBackdrop'
import EnergyLane from './EnergyLane'

type Props={planets:Planet[];selectedPlanet?:Planet|null;onPlanetSelect?:(planet:Planet)=>void}
const ORBITS=[7.2,10.8,14.8,19,23.5,28]
function CameraRig({selectedPlanet}:{selectedPlanet?:Planet|null}){const{camera}=useThree();const desired=useRef(new THREE.Vector3(0,9.5,29));const target=useRef(new THREE.Vector3());useEffect(()=>{if(selectedPlanet){desired.current.set(0,6.5,18);target.current.set(0,0,0)}else{desired.current.set(0,9.5,29);target.current.set(0,0,0)}},[selectedPlanet]);useFrame((s)=>{const t=s.clock.elapsedTime;if(!selectedPlanet){desired.current.x=Math.sin(t*.025)*1.6;desired.current.y=9.5+Math.sin(t*.017)*.6;desired.current.z=29+Math.cos(t*.021)*1.1;target.current.x=Math.sin(t*.012)*.5;target.current.y=Math.sin(t*.009)*.25}camera.position.lerp(desired.current,.018);camera.lookAt(target.current)});return null}
function Lighting(){return <><ambientLight intensity={.08} color="#7d8970"/><pointLight position={[0,0,0]} intensity={320} distance={95} decay={2} color="#ffad56"/><directionalLight position={[-18,14,10]} intensity={.35} color="#7f9d62"/></>}
export default function NovaForgeScene({planets,selectedPlanet,onPlanetSelect}:Props){const positions=useMemo(()=>planets.map((_,i)=>({radius:ORBITS[i%ORBITS.length]+Math.floor(i/ORBITS.length)*2.6,angle:i*.91+(i%2)*.38,y:((i%3)-1)*.65})),[planets]);return <div className="nf-scene"><Canvas dpr={[1,1.7]} camera={{position:[0,9.5,29],fov:45,near:.1,far:220}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}><color attach="background" args={['#010208']}/><fog attach="fog" args={['#010208',48,150]}/><SpaceBackdrop/><CameraRig selectedPlanet={selectedPlanet}/><Lighting/><SunCore/>
          <SceneParticles/>
          <AsteroidField/>{ORBITS.map(r=><OrbitRing key={r} radius={r}/>)}<EnergyLane radius={11.5} color="#8fae6f" offset={.4}/><EnergyLane radius={18.2} color="#b69a5b" offset={1.7}/>{planets.map((planet,i)=>{const p=positions[i];return <PlanetNode key={planet.publicKey} planet={planet} orbitRadius={p.radius} orbitOffset={p.angle} verticalOffset={p.y} selected={selectedPlanet?.publicKey===planet.publicKey} onSelect={()=>onPlanetSelect?.(planet)}/>})}<AttackFleet count={Math.max(8,Math.min(18,planets.length*4))}/><MonsterFleet planets={planets}/></Canvas></div>}
