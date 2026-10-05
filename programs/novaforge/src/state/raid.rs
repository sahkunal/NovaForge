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
pub enum RaidStatus {
    InProgress,
    AttackerWon,
    DefenderWon,
}

#[account]
#[derive(InitSpace)]
pub struct Raid {
    pub attacker: Pubkey,

    pub defender: Pubkey,

    pub attacker_planet: Pubkey,

    pub target_planet: Pubkey,

    pub started_at: i64,

    pub resolve_at: i64,

    pub attacker_power: u32,

    pub defender_power: u32,

    pub status: RaidStatus,

    pub iron_looted: u64,

    pub gold_looted: u64,

    pub uranium_looted: u64,

    pub bump: u8,
}