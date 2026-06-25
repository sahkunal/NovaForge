use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    events::PlanetColonized,
    errors::NovaForgeError,
};

#[derive(Accounts)]
pub struct ColonizePlanet<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(
    ctx: Context<ColonizePlanet>,
) -> Result<()> {

    let planet = &mut ctx.accounts.planet;

    require!(
        !planet.colonized,
        NovaForgeError::AlreadyColonized
    );

    planet.colonized = true;

    planet.last_claim_ts =
        Clock::get()?.unix_timestamp;

    emit!(PlanetColonized {
        owner: planet.owner,
        planet: planet.asset,
        timestamp: planet.last_claim_ts,
    });

    Ok(())
}