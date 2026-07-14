# ⬡ NovaForge

Solana on-chain idle strategy — Planet NFTs as productive assets.
 — an on-chain idle strategy game on Solana where Planet NFTs are productive assets.
 Mint a planet → Colonize → Generate Iron, Gold & Uranium → Claim → Upgrade → Sell

## What's built so far

**Program (Anchor + MPL-Core)**
- `initialize_planet` — mint a planet NFT via MPL-Core
- `colonize_planet` / `uncolonize_planet` — start/stop resource generation
- `claim_resources` — collect Iron, Gold, Uranium with lazy Void Swarm monster evaluation
- `upgrade_planet` — consume resources to level up
- `upgrade_military` — boost defense against monster attacks
- `repair_planet` — restore inactive planet after Warlord attack
- `list_planet` — list on marketplace, freeze NFT via MPL-Core FreezeDelegate plugin
- `buy_planet` — transfer SOL (99% seller, 1% treasury) + transfer NFT via MPL-Core
- `cancel_listing` — unfreeze and return NFT to seller

**Shared crate**
- `PlanetType` — Mining, Energy, Luxury, Research, Military
- `Rarity` — Common, Rare, Epic, Legendary
- `MonsterType` — Rock Golem, Space Pirates, Alien Swarm, Plasma Wraith, Void Titan
- All game constants

**Monster system**
- Threat level rises with time unclaimed (0–100)
- Scout / Raider / Warlord tiers based on hours elapsed
- Planet-type specific monsters with unique loot behavior
- Military planets get -20 threat reduction

## Stack
- Solana + Anchor 0.31.1
- Metaplex MPL-Core 0.11.1
- Rust 1.85.0

## Status
`{under active development}`
