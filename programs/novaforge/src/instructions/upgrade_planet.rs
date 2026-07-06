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
        !planet.inactive,
        NovaForgeError::PlanetInactive
    );
    require!(
        planet.level < MAX_LEVEL,
        NovaForgeError::MaxLevelReached
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

    if planet.planet_type == shared::PlanetType::Research {
    iron_cost    = iron_cost    * 9 / 10;
    gold_cost    = gold_cost    * 9 / 10;
    uranium_cost = uranium_cost * 9 / 10;
}

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

    let mil_gain = if planet.planet_type == shared::PlanetType::Military {
    MILITARY_POWER_PER_LEVEL * 2
} else {
    MILITARY_POWER_PER_LEVEL
};
planet.military_power = planet.military_power.saturating_add(mil_gain);

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