use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    errors::NovaForgeError,
};

use shared::constants::*;

#[derive(Accounts)]
pub struct RepairPlanet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(ctx: Context<RepairPlanet>) -> Result<()> {

    let planet = &mut ctx.accounts.planet;

    require!(
        planet.destroyed,
        NovaForgeError::PlanetNotDestroyed
    );

    require!(
        planet.iron_balance >= REPAIR_IRON_COST,
        NovaForgeError::InsufficientResources
    );

    require!(
        planet.gold_balance >= REPAIR_GOLD_COST,
        NovaForgeError::InsufficientResources
    );

    require!(
        planet.uranium_balance >= REPAIR_URANIUM_COST,
        NovaForgeError::InsufficientResources
    );

    planet.iron_balance -= REPAIR_IRON_COST;
    planet.gold_balance -= REPAIR_GOLD_COST;
    planet.uranium_balance -= REPAIR_URANIUM_COST;

    planet.destroyed = false;
    planet.threat_level = 0;

    Ok(())
}