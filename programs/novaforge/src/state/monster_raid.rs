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
pub enum MonsterRaidStatus {
    Active,
    MonsterWon,
    DefenderWon,
}

#[account]
#[derive(InitSpace)]
pub struct MonsterRaid {
    pub planet: Pubkey,

    pub owner: Pubkey,

    pub monster_tier: u8,

    pub monster_power: u32,

    pub started_at: i64,

    pub resolve_at: i64,

    pub status: MonsterRaidStatus,

    pub bump: u8,
}