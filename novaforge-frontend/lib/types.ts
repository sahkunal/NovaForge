export type PlanetType = 'Mining' | 'Luxury' | 'Research' | 'Energy' | 'Military'
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
export type MonsterType = 'RockGolem' | 'SpacePirates' | 'AlienSwarm' | 'PlasmaWraith' | 'VoidTitan'
export type ThreatLevel = 'safe' | 'warn' | 'danger' | 'critical'

export interface Planet {
  publicKey: string
  asset: string
  owner: string
  level: number
  power: number
  militaryPower: number
  planetType: PlanetType
  rarity: Rarity
  ironBalance: number
  goldBalance: number
  uraniumBalance: number
  productionRate: number
  population: number
  researchers: number
  colonized: boolean
  inactive: boolean
  listed: boolean
  price: number
  lastClaimTs: number
  createdAt: number
  threatLevel: number
  monsterPower: number
  monsterTier: number
  monstersKilled: number
  productionBoost: number
  boostExpiry: number
}

export interface Listing {
  publicKey: string
  seller: string
  planet: Planet
  priceSOL: number
  listedAt: number
}

export const PLANET_COLORS: Record<PlanetType, { primary: string; secondary: string; glow: string }> = {
  Mining:   { primary: '#60a5fa', secondary: '#1e40af', glow: 'rgba(96,165,250,0.5)' },
  Luxury:   { primary: '#fbbf24', secondary: '#b45309', glow: 'rgba(251,191,36,0.5)' },
  Research: { primary: '#a78bfa', secondary: '#6d28d9', glow: 'rgba(167,139,250,0.5)' },
  Energy:   { primary: '#fb7185', secondary: '#be123c', glow: 'rgba(251,113,133,0.5)' },
  Military: { primary: '#4ade80', secondary: '#15803d', glow: 'rgba(74,222,128,0.5)' },
}

export const RARITY_COLORS: Record<Rarity, string> = {
  Common:    '#94a3b8',
  Uncommon:  '#4ade80',
  Rare:      '#60a5fa',
  Legendary: '#fbbf24',
}

export const MONSTER_NAMES: Record<PlanetType, string> = {
  Mining:   'Rock Golem',
  Luxury:   'Space Pirates',
  Research: 'Alien Swarm',
  Energy:   'Plasma Wraith',
  Military: 'Void Titan',
}

export const MONSTER_EMOJIS: Record<PlanetType, string> = {
  Mining:   '🪨',
  Luxury:   '🏴‍☠️',
  Research: '👽',
  Energy:   '⚡',
  Military: '💀',
}

export function getThreatLevel(threatScore: number): ThreatLevel {
  if (threatScore < 50) return 'safe'
  if (threatScore < 75) return 'warn'
  if (threatScore < 90) return 'danger'
  return 'critical'
}

export function getThreatLabel(level: ThreatLevel): string {
  return { safe: '🟢 Safe', warn: '🟡 At Risk', danger: '🟠 Danger', critical: '🔴 Critical' }[level]
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export function lamportsToSOL(l: number): string {
  return (l / 1_000_000_000).toFixed(2)
}

export const MOCK_PLANETS: Planet[] = [
  {
    publicKey: '7xK3mR9f...', asset: 'AssetA...', owner: 'Tyler...',
    level: 3, power: 340, militaryPower: 180,
    planetType: 'Mining', rarity: 'Rare',
    ironBalance: 1204, goldBalance: 508, uraniumBalance: 335,
    productionRate: 12, population: 97, researchers: 65,
    colonized: true, inactive: false, listed: false, price: 0,
    lastClaimTs: Date.now() / 1000 - 8 * 3600,
    createdAt: Date.now() / 1000 - 30 * 86400,
    threatLevel: 8, monsterPower: 0, monsterTier: 0,
    monstersKilled: 2, productionBoost: 0, boostExpiry: 0,
  },
  {
    publicKey: '9pL2nX5q...', asset: 'AssetB...', owner: 'Tyler...',
    level: 5, power: 620, militaryPower: 50,
    planetType: 'Luxury', rarity: 'Legendary',
    ironBalance: 240, goldBalance: 1890, uraniumBalance: 120,
    productionRate: 18, population: 210, researchers: 140,
    colonized: true, inactive: false, listed: false, price: 0,
    lastClaimTs: Date.now() / 1000 - 74 * 3600,
    createdAt: Date.now() / 1000 - 60 * 86400,
    threatLevel: 74, monsterPower: 300, monsterTier: 2,
    monstersKilled: 0, productionBoost: 0, boostExpiry: 0,
  },
  {
    publicKey: '3mN8kY7w...', asset: 'AssetC...', owner: 'Tyler...',
    level: 2, power: 180, militaryPower: 320,
    planetType: 'Military', rarity: 'Uncommon',
    ironBalance: 890, goldBalance: 0, uraniumBalance: 445,
    productionRate: 8, population: 45, researchers: 30,
    colonized: false, inactive: false, listed: true, price: 2_000_000_000,
    lastClaimTs: Date.now() / 1000 - 2 * 3600,
    createdAt: Date.now() / 1000 - 10 * 86400,
    threatLevel: 0, monsterPower: 0, monsterTier: 0,
    monstersKilled: 5, productionBoost: 10, boostExpiry: Date.now() / 1000 + 12 * 3600,
  },
  {
    publicKey: '5qR4tZ9s...', asset: 'AssetD...', owner: 'Tyler...',
    level: 1, power: 100, militaryPower: 0,
    planetType: 'Research', rarity: 'Common',
    ironBalance: 50, goldBalance: 30, uraniumBalance: 180,
    productionRate: 5, population: 20, researchers: 13,
    colonized: true, inactive: false, listed: false, price: 0,
    lastClaimTs: Date.now() / 1000 - 1 * 3600,
    createdAt: Date.now() / 1000 - 2 * 86400,
    threatLevel: 1, monsterPower: 0, monsterTier: 0,
    monstersKilled: 0, productionBoost: 0, boostExpiry: 0,
  },
]

export const MOCK_LISTINGS: Listing[] = [
  { publicKey: 'L1...', seller: '9pL2...', planet: { ...MOCK_PLANETS[2] }, priceSOL: 2.0, listedAt: Date.now() / 1000 - 3600 },
  {
    publicKey: 'L2...', seller: 'AbcX...', priceSOL: 5.5, listedAt: Date.now() / 1000 - 7200,
    planet: {
      publicKey: 'PL5...', asset: 'AssetE...', owner: 'AbcX...',
      level: 7, power: 1200, militaryPower: 600,
      planetType: 'Energy', rarity: 'Legendary',
      ironBalance: 0, goldBalance: 0, uraniumBalance: 0,
      productionRate: 30, population: 400, researchers: 260,
      colonized: false, inactive: false, listed: true, price: 5_500_000_000,
      lastClaimTs: 0, createdAt: 0, threatLevel: 0,
      monsterPower: 0, monsterTier: 0, monstersKilled: 12,
      productionBoost: 30, boostExpiry: 0,
    }
  },
]
