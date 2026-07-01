use anchor_lang::prelude::*;

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    Copy,
    Debug,
    PartialEq,
    Eq,
    InitSpace,
)]

pub enum PlanetType {
    Mining,
    Energy,
    Luxury,
    Research,
    Military
}

#[derive(
    AnchorSerialize,
    AnchorDeserialize,
    Clone,
    Copy,
    Debug,
    PartialEq,
    Eq,
    InitSpace,
)]
pub enum Rarity {
    Common,
    Rare,
    Epic,
    Legendary,
}

impl Rarity {
    pub fn multiplier(&self) -> u64 {
        match self {
            Self::Common => 1,
            Self::Rare => 2,
            Self::Epic => 3,
            Self::Legendary => 5,
        }
    }
}