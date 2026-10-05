use anchor_lang::prelude::*;

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    Copy,
    InitSpace,
    PartialEq,
    Eq,
)]
pub enum BuildingType {
    CommandCore,
    IronMine,
    GoldMine,
    UraniumReactor,
    Storage,
    ShieldGenerator,
    Turret,
    MissileBattery,
    OrbitalCannon,
    Shipyard,
}

#[account]
#[derive(InitSpace)]
pub struct Building {
    pub planet: Pubkey,

    pub slot: u8,

    pub building_type: BuildingType,

    pub level: u16,

    pub health: u32,

    pub max_health: u32,

    pub active: bool,

    pub bump: u8,
}