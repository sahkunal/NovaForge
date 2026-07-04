use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    events::PlanetUpgraded,
    errors::NovaForgeError,
};

use shared::constants::*;

#[derive(Accounts)]
pub struct UpgradePlanet<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(
    ctx: Context<UpgradePlanet>,
) -> Result<()> {

    let planet = &mut ctx.accounts.planet;


    require!(
        planet.colonized,
        NovaForgeError::PlanetNotColonized
    );

    require!(
        !planet.destroyed,
        NovaForgeError::PlanetDestroyed
    );


    let level = planet.level as u64;

    let iron_cost =
        UPGRADE_IRON_COST
            .checked_mul(level)
            .ok_or(NovaForgeError::OverFlow)?;

    let gold_cost =
        UPGRADE_GOLD_COST
            .checked_mul(level)
            .ok_or(NovaForgeError::OverFlow)?;

    let uranium_cost =
        UPGRADE_URANIUM_COST
            .checked_mul(level)
            .ok_or(NovaForgeError::OverFlow)?;

    require!(
        planet.iron_balance >= iron_cost,
        NovaForgeError::InsufficientResources
    );

    require!(
        planet.gold_balance >= gold_cost,
        NovaForgeError::InsufficientResources
    );

    require!(
        planet.uranium_balance >= uranium_cost,
        NovaForgeError::InsufficientResources
    );


    planet.iron_balance -= iron_cost;
    planet.gold_balance -= gold_cost;
    planet.uranium_balance -= uranium_cost;


    planet.level += 1;

    planet.power += POWER_PER_LEVEL;

    planet.production_rate += PRODUCTION_RATE_PER_LEVEL;

    planet.population += POPULATION_PER_LEVEL;

    planet.researchers += RESEARCHERS_PER_LEVEL;


    emit!(PlanetUpgraded {
    owner: planet.owner,
    planet: planet.asset,
    new_level: planet.level,
    power: planet.power,
    production_rate: planet.production_rate,
    timestamp: Clock::get()?.unix_timestamp,
});

    Ok(())
}