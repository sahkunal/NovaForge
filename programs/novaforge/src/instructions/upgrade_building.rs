use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::NovaForgeError,
    events::BuildingUpgraded,
    state::{Building, Planet},
    utils::building_stats,
};

#[derive(Accounts)]
pub struct UpgradeBuilding<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner @ NovaForgeError::Unauthorized,
    )]
    pub planet: Account<'info, Planet>,

    #[account(
        mut,
        seeds = [
            BUILDING_SEED,
            planet.key().as_ref(),
            &[building.slot]
        ],
        bump = building.bump,
        constraint = building.planet == planet.key()
            @ NovaForgeError::InvalidBuildingPlanet
    )]
    pub building: Account<'info, Building>,
}

pub fn handler(
    ctx: Context<UpgradeBuilding>,
) -> Result<()> {

    let planet = &mut ctx.accounts.planet;
    let building = &mut ctx.accounts.building;

    require!(
        planet.colonized,
        NovaForgeError::PlanetNotColonized
    );

    require!(
        !planet.inactive,
        NovaForgeError::PlanetInactive
    );

    require!(
        building.level < MAX_BUILDING_LEVEL,
        NovaForgeError::BuildingMaxLevel
    );

    let old_level = building.level;
    let new_level = old_level + 1;

    let stats = building_stats(
        building.building_type,
        new_level,
    );

    require!(
        planet.iron_balance >= stats.iron_cost,
        NovaForgeError::InsufficientResources
    );

    require!(
        planet.gold_balance >= stats.gold_cost,
        NovaForgeError::InsufficientResources
    );

    require!(
        planet.uranium_balance >= stats.uranium_cost,
        NovaForgeError::InsufficientResources
    );

    planet.iron_balance -= stats.iron_cost;
    planet.gold_balance -= stats.gold_cost;
    planet.uranium_balance -= stats.uranium_cost;

    let old_max = building.max_health;
    let old_health = building.health;

    let missing_health =
        old_max.saturating_sub(old_health);

    let new_missing_health =
        if old_max == 0 {
            0
        } else {
            (
                missing_health as u64
                * stats.max_health as u64
                / old_max as u64
            ) as u32
        };

    building.level = new_level;
    building.max_health = stats.max_health;
    building.health =
        stats.max_health.saturating_sub(new_missing_health);

    emit!(BuildingUpgraded {
        owner: ctx.accounts.owner.key(),
        planet: planet.key(),
        building: building.key(),
        new_level,
    });

    Ok(())
}