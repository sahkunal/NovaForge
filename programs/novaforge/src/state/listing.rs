use anchor_lang::prelude::*;
#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub planet: Pubkey,
    pub price: u64,
    pub created_at: i64,
    pub bump: u8,
}