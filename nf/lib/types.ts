export type PlanetType='Mining'|'Energy'|'Luxury'|'Research'|'Military'
export type Rarity='Common'|'Rare'|'Epic'|'Legendary'
export interface Planet{
  publicKey:string;asset:string;owner:string
  level:number;power:number;militaryPower:number
  planetType:PlanetType;rarity:Rarity
  ironBalance:number;goldBalance:number;uraniumBalance:number
  productionRate:number;population:number;researchers:number
  colonized:boolean;inactive:boolean;listed:boolean
  price:number;lastClaimTs:number;createdAt:number
  threatLevel:number;monsterPower:number;monsterTier:number
  monstersKilled:number;productionBoost:number;boostExpiry:number
  pendingIron?:number;pendingGold?:number;pendingUranium?:number
}
export const PLANET_COLORS:Record<PlanetType,{primary:string;secondary:string;glow:string}>={
  Mining:{primary:'#91aa76',secondary:'#3f5134',glow:'rgba(145,170,118,0.38)'},
  Energy:{primary:'#b0bd83',secondary:'#59643b',glow:'rgba(176,189,131,0.36)'},
  Luxury:{primary:'#a0ad82',secondary:'#4c563c',glow:'rgba(160,173,130,0.34)'},
  Research:{primary:'#a8c28e',secondary:'#3e6040',glow:'rgba(168,194,142,0.38)'},
  Military:{primary:'#c56f61',secondary:'#642e2b',glow:'rgba(197,111,97,0.40)'},
}
export const RARITY_COLORS:Record<Rarity,string>={Common:'#87917e',Rare:'#9dbb7c',Epic:'#b0bd83',Legendary:'#c6a96a'}
export const MONSTER_NAMES:Record<PlanetType,string>={Mining:'Rock Golem',Energy:'Plasma Wraith',Luxury:'Space Pirate',Research:'Alien Swarm',Military:'Void Titan'}
export const MONSTER_EMOJIS:Record<PlanetType,string>={Mining:'🪨',Energy:'👻',Luxury:'🏴‍☠️',Research:'👾',Military:'💀'}
export function getThreatLevel(tl:number):'safe'|'warn'|'danger'|'critical'{if(tl<50)return'safe';if(tl<75)return'warn';if(tl<90)return'danger';return'critical'}
export function getThreatLabel(level:string):string{return{safe:'✅ Safe',warn:'⚠️ Monster Warning',danger:'🔴 Danger',critical:'💀 CRITICAL'}[level]||''}
export function formatNumber(n:number):string{if(n>=1e9)return(n/1e9).toFixed(1)+'B';if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return Math.floor(n).toString()}
export function lamportsToSOL(l:number):string{return(l/1e9).toFixed(3)}
