use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::NovaForgeError,
    events::BuildingRepaired,
    state::{Building, Planet},
};

#[derive(Accounts)]
pub struct RepairBuilding<'info> {

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
    ctx: Context<RepairBuilding>,
) -> Result<()> {

    let planet = &mut ctx.accounts.planet;
    let building = &mut ctx.accounts.building;

    require!(
        building.health < building.max_health,
        NovaForgeError::BuildingAlreadyHealthy
    );

    let missing =
        building.max_health
            .saturating_sub(building.health);

    let units =
        ((missing as u64) + 99) / 100;

    let iron_cost =
        units * REPAIR_IRON_PER_100_HP;

    let gold_cost =
        units * REPAIR_GOLD_PER_100_HP;

    let uranium_cost =
        units * REPAIR_URANIUM_PER_100_HP;

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

    building.health = building.max_health;
    building.active = true;

    emit!(BuildingRepaired {
        owner: ctx.accounts.owner.key(),
        planet: planet.key(),
        building: building.key(),
        iron_spent: iron_cost,
        gold_spent: gold_cost,
        uranium_spent: uranium_cost,
    });

    Ok(())
}