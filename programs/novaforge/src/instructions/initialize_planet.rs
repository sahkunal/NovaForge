use anchor_lang::prelude::*;
use shared::{PlanetType, Rarity, constants::*};
use crate::{state::Planet, events::PlanetCreated};

#[derive(Accounts)]
pub struct InitializePlanet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space =8+ Planet::INIT_SPACE,
        seeds = [b"planet", asset.key().as_ref()],
        bump
    )]
    pub planet: Account<'info, Planet>,

    /// CHECK: MPL-Core Asset — verified by mpl_core_program CPI
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: MPL-Core program
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializePlanet>,
    planet_type: PlanetType,
    rarity: Rarity,
) -> Result<()> {
    // Derive production_rate from rarity
    let production_rate = BASE_PRODUCTION_RATE * rarity.multiplier();

    let now = Clock::get()?.unix_timestamp;
    let planet = &mut ctx.accounts.planet;

    planet.owner           = ctx.accounts.owner.key();
    planet.asset           = ctx.accounts.asset.key();
    planet.level           = 1;
    planet.power           = BASE_POWER;
    planet.military_power  = 0;
    planet.planet_type     = planet_type;
    planet.rarity          = rarity;
    planet.iron_balance    = 0;
    planet.gold_balance    = 0;
    planet.uranium_balance = 0;
    planet.production_rate = production_rate;
    planet.population      = BASE_POPULATION;
    planet.researchers     = BASE_RESEARCHERS;
    planet.colonized       = false;
    planet.last_claim_ts   = now;
    planet.created_at      = now;
    planet.bump            = ctx.bumps.planet;

    emit!(PlanetCreated {
        owner:       planet.owner,
        asset:       planet.asset,
        planet_type: planet.planet_type,
        rarity:      planet.rarity,
        timestamp:   planet.created_at,
    });

    Ok(())
}