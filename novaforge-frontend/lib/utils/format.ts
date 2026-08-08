export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return Math.floor(n).toString()
}

export const lamportsToSOL = (l: number): string => (l / 1_000_000_000).toFixed(3)
export const SOLToLamports = (s: number): number => Math.floor(s * 1_000_000_000)

export const shortAddress = (addr: string, chars = 4): string =>
  `${addr.slice(0, chars)}...${addr.slice(-chars)}`

export const timeAgo = (ts: number): string => {
  const diff = Date.now() / 1000 - ts
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export const hoursUnclaimed = (lastClaimTs: number): number =>
  (Date.now() / 1000 - lastClaimTs) / 3600

export const pendingResources = (rate: number, lastClaimTs: number): number => {
  const elapsed = Date.now() / 1000 - lastClaimTs
  return Math.floor(rate * elapsed)
}
