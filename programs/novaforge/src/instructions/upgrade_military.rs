use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    events::MilitaryUpgraded,
    errors::NovaForgeError,
};

use shared::constants::*;

#[derive(Accounts)]
pub struct UpgradeMilitary<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(
    ctx: Context<UpgradeMilitary>,
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

    let iron_cost =
        MILITARY_UPGRADE_IRON_COST * (planet.military_power as u64 / 10 + 1);

    let gold_cost =
        MILITARY_UPGRADE_GOLD_COST * (planet.military_power as u64 / 10 + 1);

    let uranium_cost =
        MILITARY_UPGRADE_URANIUM_COST * (planet.military_power as u64 / 10 + 1);

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

    planet.military_power += MILITARY_POWER_INCREMENT;

    emit!(MilitaryUpgraded {
        owner: planet.owner,
        planet: planet.asset,
        military_power: planet.military_power,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}