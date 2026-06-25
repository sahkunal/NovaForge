use anchor_lang::prelude::*;
#[account]
pub struct Planet {
    pub owner: Pubkey,

    pub level: u16,

    pub power: u32,

    pub planet_type: PlanetType,

    pub rarity: PlanetRarity,

    pub iron_balance: u64,

    pub gold_balance: u64,

    pub uranium_balance: u64,

    pub production_rate: u64,

    pub colonized: bool,

    pub last_claim_ts: i64,

    pub bump: u8,
}