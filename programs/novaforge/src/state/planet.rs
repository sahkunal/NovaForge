use anchor_lang::prelude::*;
use shared::{PlanetType, Rarity};
#[account]
#[derive(InitSpace)]
pub struct Planet {
    pub owner: Pubkey,

    pub asset: Pubkey,

    pub level: u16,

    pub power: u32,

    pub military_power: u32,

    pub planet_type: PlanetType,

    pub rarity: Rarity,

    pub iron_balance: u64,
    pub gold_balance: u64,
    pub uranium_balance: u64,

    pub production_rate: u64,

    pub population: u64,

    pub researchers: u64,

    pub colonized: bool,

    pub last_claim_ts: i64,

    pub created_at: i64,

    pub bump: u8,
    
    pub threat_level: u8,
    pub inactive: bool,
    pub listed: bool,
    pub price: u64,

}