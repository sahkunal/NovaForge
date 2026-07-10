use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::{
    state::Planet,
    events::PlanetSold,
    errors::NovaForgeError,
};

use shared::constants::MARKETPLACE_FEE_BPS;

#[derive(Accounts)]
pub struct BuyPlanet<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller receives lamports
    #[account(mut)]
    pub seller: AccountInfo<'info>,

    #[account(
        mut,
        has_one = owner @ NovaForgeError::Unauthorized,
        constraint = planet.owner == seller.key()
    )]
    pub planet: Account<'info, Planet>,

    pub system_program: Program<'info, System>,
}
