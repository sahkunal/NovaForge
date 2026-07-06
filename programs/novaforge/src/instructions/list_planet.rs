use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    events::PlanetListed,
    errors::NovaForgeError,
};

#[derive(Accounts)]
pub struct ListPlanet<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(
    ctx: Context<ListPlanet>,
    price: u64,
) -> Result<()> {
    let planet = &mut ctx.accounts.planet;

    require!(!planet.inactive,   NovaForgeError::PlanetInactive);
    require!(!planet.colonized,  NovaForgeError::PlanetStillColonized);
    require!(!planet.listed,     NovaForgeError::AlreadyListed);
    require!(price > 0,          NovaForgeError::InvalidPrice);

    // TODO: create Listing PDA, MPL-Core FreezeV1 → escrow

    planet.listed = true;
    planet.price  = price;

    emit!(PlanetListed {
        seller:    planet.owner,
        planet:     planet.asset,
        price: price,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}