export type PlanetType = 'Mining'|'Energy'|'Luxury'|'Research'|'Military'
export type Rarity     = 'Common'|'Rare'|'Epic'|'Legendary'

export interface Planet {
  publicKey: string; asset: string; owner: string
  level: number; power: number; militaryPower: number
  planetType: PlanetType; rarity: Rarity
  ironBalance: number; goldBalance: number; uraniumBalance: number
  productionRate: number; population: number; researchers: number
  colonized: boolean; inactive: boolean; listed: boolean
  price: number; lastClaimTs: number; createdAt: number
  threatLevel: number; monsterPower: number; monsterTier: number
  monstersKilled: number; productionBoost: number; boostExpiry: number
  pendingIron?: number; pendingGold?: number; pendingUranium?: number
}

export const PLANET_COLORS: Record<PlanetType,{primary:string;secondary:string;glow:string}> = {
  Mining:   {primary:'#60a5fa',secondary:'#1e40af',glow:'rgba(96,165,250,0.4)'},
  Energy:   {primary:'#f97316',secondary:'#7c2d12',glow:'rgba(249,115,22,0.4)'},
  Luxury:   {primary:'#a855f7',secondary:'#4c1d95',glow:'rgba(168,85,247,0.4)'},
  Research: {primary:'#4ade80',secondary:'#14532d',glow:'rgba(74,222,128,0.4)'},
  Military: {primary:'#f43f5e',secondary:'#7f1d1d',glow:'rgba(244,63,94,0.4)'},
}
export const RARITY_COLORS: Record<Rarity,string> = {
  Common:'#94a3b8', Rare:'#4ade80', Epic:'#a78bfa', Legendary:'#fbbf24'
}
export const MONSTER_NAMES: Record<PlanetType,string> = {
  Mining:'Rock Golem', Energy:'Plasma Wraith', Luxury:'Space Pirate',
  Research:'Alien Swarm', Military:'Void Titan'
}
export const MONSTER_EMOJIS: Record<PlanetType,string> = {
  Mining:'🪨', Energy:'👻', Luxury:'🏴‍☠️', Research:'👾', Military:'💀'
}

export function getThreatLevel(tl:number):'safe'|'warn'|'danger'|'critical' {
  if(tl<50) return 'safe'; if(tl<75) return 'warn'; if(tl<90) return 'danger'; return 'critical'
}
export function getThreatLabel(level:string):string {
  return {safe:'✅ Safe',warn:'⚠️ Monster Warning',danger:'🔴 Danger — Attack Imminent',critical:'💀 CRITICAL — Under Attack!'}[level]||''
}
export function formatNumber(n:number):string {
  if(n>=1e9) return (n/1e9).toFixed(1)+'B'
  if(n>=1e6) return (n/1e6).toFixed(1)+'M'
  if(n>=1e3) return (n/1e3).toFixed(1)+'K'
  return Math.floor(n).toString()
}
export function lamportsToSOL(l:number):string { return (l/1e9).toFixed(3) }
