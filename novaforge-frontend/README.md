# ⬡ NovaForge Frontend

On-chain idle strategy game built on Solana.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your RPC URL
npm run dev
```

## User Flow

1. Open app → NovaForge splash screen (3.5s)
2. Connect Phantom wallet (top-right button)
3. Star map shows your planets orbiting the sun
4. Click any planet to open the detail panel
5. **Colonize** → starts Iron/Gold/Uranium generation
6. Come back → **Claim Resources** accumulate per second
7. **Upgrade Planet** → spend resources, increase level + production
8. **Upgrade Military** → defend against Void Swarm attacks
9. Idle too long → monster attacks on your next claim
10. Win fight → bonus resources + kill count
11. Lose → planet goes inactive, pay resources to **Repair**
12. **Uncolonize** → **List for Sale** on marketplace
13. Buyer pays SOL → 99% to you, 1% protocol fee

## Pages

- `/` — Interactive star map
- `/dashboard` — Planet card grid with actions
- `/marketplace` — Buy/sell listings
- `/profile` — Stats, history, active listings

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS + custom space theme
- Three.js / Canvas for planet rendering
- Anchor 0.31.1 for Solana program calls
- Metaplex MPL-Core for NFT operations
