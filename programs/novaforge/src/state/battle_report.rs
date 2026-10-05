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
pub enum BattleWinner {
    Attacker,
    Defender,
}

#[account]
#[derive(InitSpace)]
pub struct BattleReport {
    pub raid: Pubkey,

    pub attacker: Pubkey,
    pub defender: Pubkey,

    pub attacker_planet: Pubkey,
    pub target_planet: Pubkey,

    pub winner: BattleWinner,

    pub attacker_power: u32,
    pub defender_power: u32,

    pub iron_looted: u64,
    pub gold_looted: u64,
    pub uranium_looted: u64,

    pub resolved_at: i64,

    pub bump: u8,
}