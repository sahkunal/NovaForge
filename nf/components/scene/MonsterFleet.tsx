'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Planet } from '@/lib/types'

const ORBITS = [7.2, 10.8, 14.8, 19, 23.5, 28]

function Wing({ side, scale }: { side: number; scale: number }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(side * 2.4 * scale, 0.5 * scale)
    shape.lineTo(side * 1.65 * scale, 1.45 * scale)
    shape.lineTo(side * 0.45 * scale, 0.9 * scale)
    shape.lineTo(0, 0)
    return new THREE.ShapeGeometry(shape)
  }, [side, scale])

  return (
    <mesh geometry={geometry} position={[0, 0.1 * scale, -0.05]} rotation={[0.18, 0, side * -0.08]}>
      <meshStandardMaterial
        color="#090b08"
        emissive="#20351e"
        emissiveIntensity={1.25}
        metalness={0.72}
        roughness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function FireStream({ scale }: { scale: number }) {
  const ref = useRef<THREE.Group>(null)
  const points = useMemo(() => {
    const p: THREE.Vector3[] = []
    for (let i = 0; i < 18; i++) {
      const t = i / 17
      p.push(new THREE.Vector3(0, Math.sin(t * 13) * 0.12 * scale, -t * 3.6 * scale))
    }
    return p
  }, [scale])

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.scale.x = 0.85 + Math.sin(clock.elapsedTime * 18) * 0.12
    ref.current.scale.y = 0.85 + Math.cos(clock.elapsedTime * 15) * 0.1
  })

  return (
    <group ref={ref} position={[0, -0.02 * scale, -0.75 * scale]}>
      <mesh>
        <tubeGeometry args={[curve, 24, 0.12 * scale, 8, false]} />
        <meshBasicMaterial color="#ff2b12" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, 0, -1.65 * scale]} scale={[1, 1, 2.2]}>
        <coneGeometry args={[0.24 * scale, 1.9 * scale, 10, 1, true]} />
        <meshBasicMaterial color="#ff9b1c" transparent opacity={0.58} blending={THREE.AdditiveBlending} />
      </mesh>
      <pointLight color="#ff3b12" intensity={4 * scale} distance={5 * scale} decay={2} />
    </group>
  )
}

function Dragon({ index, origin, power, tier }: {
  index: number
  origin: [number, number, number]
  power: number
  tier: number
}) {
  const ref = useRef<THREE.Group>(null)
  const baseScale = 0.9 + Math.min(power / 700, 2.2) * 0.22 + tier * 0.12
  const scale = Math.min(1.65, baseScale)

  useFrame(({ clock }, delta) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.62 + index * 1.73
    const attackPulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 3.8 + index)
    const inward = 1 + attackPulse * 0.28

    ref.current.position.set(
      origin[0] * inward + Math.sin(t * 1.7) * 0.65,
      origin[1] + Math.sin(t * 2.1) * 0.55,
      origin[2] * inward + Math.cos(t * 1.35) * 0.65,
    )

    ref.current.rotation.y = -Math.atan2(origin[0], origin[2]) + Math.sin(t) * 0.08
    ref.current.rotation.z = Math.sin(t * 1.3) * 0.12
    ref.current.rotation.x = Math.sin(t * 0.8) * 0.08
    ref.current.scale.setScalar(scale * (1 + attackPulse * 0.035))
    ref.current.userData.spin = (ref.current.userData.spin || 0) + delta
  })

  const neckSegments = Array.from({ length: 4 }, (_, i) => i)
  const tailSegments = Array.from({ length: 6 }, (_, i) => i)

  return (
    <group ref={ref}>
      {/* Core silhouette */}
      <mesh scale={[1.25, 0.82, 1.65]}>
        <dodecahedronGeometry args={[0.62, 2]} />
        <meshStandardMaterial
          color="#050706"
          emissive="#142615"
          emissiveIntensity={1.7}
          metalness={0.92}
          roughness={0.22}
        />
      </mesh>

      {/* Armor plates */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.12 + i * 0.08, 0.18 + i * 0.38]} scale={[1.05 - i * 0.12, 0.18, 0.34]}>
          <octahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#11150f" emissive="#344c2b" emissiveIntensity={1.1} metalness={0.95} roughness={0.2} />
        </mesh>
      ))}

      {/* Neck */}
      {neckSegments.map((i) => (
        <mesh key={`neck-${i}`} position={[0, 0.05 + i * 0.04, -0.78 - i * 0.35]} rotation={[0.08, 0, 0]} scale={[0.48 - i * 0.055, 0.5 - i * 0.05, 0.55]}>
          <dodecahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color="#070907" emissive="#1e321c" emissiveIntensity={1.5} metalness={0.9} roughness={0.24} />
        </mesh>
      ))}

      {/* Head */}
      <mesh position={[0, 0.08, -2.12]} scale={[0.78, 0.62, 0.98]} rotation={[0.1, 0, 0]}>
        <octahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color="#050706" emissive="#273c22" emissiveIntensity={1.8} metalness={0.92} roughness={0.18} />
      </mesh>

      {/* Jaw / mandibles */}
      {[-1, 1].map((side) => (
        <mesh key={`jaw-${side}`} position={[side * 0.25, -0.25, -2.52]} rotation={[side * 0.12, 0, side * 0.18]}>
          <coneGeometry args={[0.22, 0.9, 6]} />
          <meshStandardMaterial color="#0a0b08" emissive="#162516" emissiveIntensity={1.3} metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* Eyes */}
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.27, 0.2, -2.67]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshBasicMaterial color="#d7ff72" />
        </mesh>
      ))}

      {/* Horns */}
      {[-1, 1].map((side) => (
        <mesh key={`horn-${side}`} position={[side * 0.34, 0.48, -2.22]} rotation={[0.2, 0, side * 0.42]}>
          <coneGeometry args={[0.11, 0.8, 6]} />
          <meshStandardMaterial color="#020302" emissive="#344c2b" emissiveIntensity={1.1} metalness={0.95} roughness={0.18} />
        </mesh>
      ))}

      {/* Wings */}
      <Wing side={-1} scale={scale} />
      <Wing side={1} scale={scale} />

      {/* Tail */}
      {tailSegments.map((i) => {
        const s = 0.42 - i * 0.045
        return (
          <mesh key={`tail-${i}`} position={[0, -0.08 + Math.sin(i * 0.7) * 0.06, 0.92 + i * 0.42]} scale={[s, s, s * 1.45]}>
            <coneGeometry args={[0.5, 0.95, 6]} />
            <meshStandardMaterial color="#050605" emissive="#1d321a" emissiveIntensity={1.25} metalness={0.9} roughness={0.22} />
          </mesh>
        )
      })}

      {/* Active attack fire */}
      <group rotation={[Math.PI, 0, 0]}>
        <FireStream scale={scale} />
      </group>

      {/* Hostile aura */}
      <mesh scale={1.7}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#b32b19" transparent opacity={0.035} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
      </mesh>
      <pointLight color="#ff421c" intensity={3.5 + tier * 0.8} distance={6 + scale * 3} decay={2} />
    </group>
  )
}

function ImpactBeam({ origin, index }: { origin: [number, number, number]; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 5 + index)
    ref.current.scale.y = 0.7 + pulse * 0.5
    ref.current.rotation.z = clock.elapsedTime * 0.25 + index
  })

  return (
    <mesh ref={ref} position={origin} rotation={[0, Math.PI / 2, 0.45]}>
      <cylinderGeometry args={[0.025, 0.13, 3.8, 8, 1, true]} />
      <meshBasicMaterial color="#d5ff72" transparent opacity={0.14} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

export default function MonsterFleet({ planets }: { planets: Planet[] }) {
  const [activeKeys, setActiveKeys] = useState<string[]>([])

  useEffect(() => {
    const refresh = () => {
      const now = Date.now() / 1000
      setActiveKeys(
        planets
          .filter((p) => p.monsterPower > 0 && Math.max(0, now - p.lastClaimTs) / 3600 >= 100)
          .map((p) => p.publicKey),
      )
    }

    refresh()
    const id = window.setInterval(refresh, 1000)
    return () => window.clearInterval(id)
  }, [planets])

  const active = useMemo(
    () => planets.filter((p) => activeKeys.includes(p.publicKey)),
    [planets, activeKeys],
  )

  if (!active.length) return null

  return (
    <group>
      {active.flatMap((planet, i) => {
        const angle = i * 0.93 + 1.2
        const radius = ORBITS[i % ORBITS.length] + Math.floor(i / ORBITS.length) * 2.6
        const origin: [number, number, number] = [
          Math.cos(angle) * radius,
          ((i % 3) - 1) * 0.7,
          Math.sin(angle) * radius,
        ]
        const count = Math.min(3, 1 + Math.floor((planet.monsterTier || 1) / 2))

        return Array.from({ length: count }, (_, j) => {
          const offset: [number, number, number] = [origin[0] + j * 0.9, origin[1] + j * 0.3, origin[2] - j * 0.9]
          return (
            <group key={`${planet.publicKey}-${j}`}>
              <Dragon
                index={i * 4 + j}
                origin={offset}
                power={planet.monsterPower}
                tier={planet.monsterTier || 1}
              />
              {j === 0 && <ImpactBeam origin={origin} index={i} />}
            </group>
          )
        })
      })}
    </group>
  )
}
