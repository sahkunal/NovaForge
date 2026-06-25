use anchor_lang::prelude::*;
#[event]
pub struct PlanetCreated {
    pub owner:       Pubkey,
    pub asset:       Pubkey,
    pub planet_type: PlanetType,
    pub rarity:      Rarity,
    pub timestamp:   i64,
}
#[event]
pub struct PlanetColonized {
    pub owner:     Pubkey,
    pub planet:    Pubkey,  
    pub timestamp: i64,
}
#[event]
pub struct PlanetUncolonized {
    pub owner:          Pubkey,
    pub planet:         Pubkey,   
    pub iron_flushed:   u64,
    pub gold_flushed:   u64,
    pub uranium_flushed:u64,
    pub timestamp:      i64,
}

#[event]
pub struct ResourcesClaimed {
    pub owner:     Pubkey,
    pub iron:      u64,
    pub gold:      u64,
    pub uranium:   u64,
    pub planet:    Pubkey,   
    pub timestamp: i64,
}

#[event]
pub struct PlanetUpgraded {
    pub planet:             Pubkey,
    pub level:              u16,
    pub owner:              Pubkey,
    pub iron_spent:         u64,
    pub gold_spent:         u64,
    pub uranium_spent:      u64,
    pub new_military_power: u32,
    pub timestamp:          i64,
}
#[event]
pub struct PlanetListed {
    pub seller:    Pubkey,
    pub price:     u64,     
    pub planet:    Pubkey,   
    pub timestamp: i64,
}

#[event]
pub struct PlanetSold {
    pub seller:         Pubkey,
    pub buyer:          Pubkey,
    pub price:          u64,     
    pub planet:         Pubkey,      // which asset was sold
    pub fee_lamports:   u64,         // 1% fee amount — useful for analytics
    pub timestamp:      i64,
}

#[event]
pub struct ListingCancelled {
    pub seller:    Pubkey,
    pub planet:    Pubkey,
    pub timestamp: i64,
}