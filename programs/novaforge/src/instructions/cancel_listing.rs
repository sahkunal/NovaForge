use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    events::ListingCancelled,
    errors::NovaForgeError,
};

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(ctx: Context<CancelListing>) -> Result<()> {
    let planet = &mut ctx.accounts.planet;

    require!(planet.listed, NovaForgeError::Unauthorized);

    planet.listed = false;
    planet.price = 0;

    emit!(ListingCancelled {
        seller: planet.owner,
        planet: planet.asset,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}