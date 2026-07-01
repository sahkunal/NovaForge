use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    events::PlanetUncolonized,
    errors::NovaForgeError,
};

#[derive(Accounts)]
pub struct UncolonizePlanet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(
    ctx: Context<UncolonizePlanet>,
) -> Result<()> {

    let planet = &mut ctx.accounts.planet;

    require!(
        planet.colonized,
        NovaForgeError::PlanetNotColonized
    );

    // below are the future upgradation which are needed:
    //  Stop resource generation
    //  Release territory
    //  Remove military
    //  Reset colonization buffs

    planet.colonized = false;

    emit!(PlanetUncolonized {
        owner: planet.owner,
        planet: planet.asset,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}