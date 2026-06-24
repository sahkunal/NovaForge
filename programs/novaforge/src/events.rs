use anchor_lang::prelude::*;
#[event]
pub struct PlanetCreated {
    pub owner: Pubkey,
    pub planet: Pubkey,
}

#[event]
pub struct PlanetColonized {
    pub owner: Pubkey,
    pub planet: Pubkey,
}

#[event]
pub struct PlanetUncolonized {
    pub owner: Pubkey,
    pub planet: Pubkey,
}

#[event]
pub struct ResourcesClaimed {
    pub owner: Pubkey,
    pub iron: u64,
    pub gold: u64,
    pub uranium: u64,
}

#[event]
pub struct PlanetUpgraded {
    pub planet: Pubkey,
    pub level: u16,
}

#[event]
pub struct PlanetListed {
    pub seller: Pubkey,
    pub price: u64,
}

#[event]
pub struct PlanetSold {
    pub seller: Pubkey,
    pub buyer: Pubkey,
    pub price: u64,
}