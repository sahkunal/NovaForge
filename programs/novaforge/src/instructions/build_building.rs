use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::NovaForgeError,
    events::BuildingConstructed,
    state::{Building, BuildingType, Planet},
    utils::building_stats,
};

#[derive(Accounts)]
#[instruction(slot: u8)]
pub struct BuildBuilding<'info> {

    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner @ NovaForgeError::Unauthorized,
    )]
    pub planet: Account<'info, Planet>,

    #[account(
        init,
        payer = owner,
        space = 8 + Building::INIT_SPACE,
        seeds = [
            BUILDING_SEED,
            planet.key().as_ref(),
            &[slot]
        ],
        bump
    )]
    pub building: Account<'info, Building>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<BuildBuilding>,
    slot: u8,
    building_type: BuildingType,
) -> Result<()> {

    require!(
        slot < MAX_BUILDING_SLOTS,
        NovaForgeError::InvalidBuildingSlot
    );

    let planet = &mut ctx.accounts.planet;

    require!(
        planet.colonized,
        NovaForgeError::PlanetNotColonized
    );

    require!(
        !planet.inactive,
        NovaForgeError::PlanetInactive
    );

    let stats = building_stats(building_type, 1);

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

    let building = &mut ctx.accounts.building;

    building.planet = planet.key();
    building.slot = slot;
    building.building_type = building_type;
    building.level = 1;
    building.health = stats.max_health;
    building.max_health = stats.max_health;
    building.active = true;
    building.bump = ctx.bumps.building;

    emit!(BuildingConstructed {
        owner: ctx.accounts.owner.key(),
        planet: planet.key(),
        building: building.key(),
        slot,
        building_type,
        level: 1,
    });

    Ok(())
}