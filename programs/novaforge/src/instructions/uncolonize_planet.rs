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

pub fn handler(ctx: Context<UncolonizePlanet>) -> Result<()> {
    let planet = &mut ctx.accounts.planet;

    require!(planet.colonized, NovaForgeError::PlanetNotColonized);

    // flush pending rewards before uncolonizing
    let now = Clock::get()?.unix_timestamp;
    let elapsed = now.checked_sub(planet.last_claim_ts)
        .ok_or(NovaForgeError::TimestampUnderflow)? as u64;

    if elapsed > 0 {
        let base = planet.production_rate.saturating_mul(elapsed);
        let max = planet.production_rate.saturating_mul(MAX_STORAGE_SECS);

        let iron_gen = match planet.planet_type {
            PlanetType::Mining   => base.saturating_mul(3) / 2,
            PlanetType::Military => base / 2,
            _                    => base,
        };
        let gold_gen = match planet.planet_type {
            PlanetType::Luxury   => base.saturating_mul(3) / 2,
            PlanetType::Military => 0,
            _                    => base,
        };
        let uranium_gen = match planet.planet_type {
            PlanetType::Energy | PlanetType::Research => base.saturating_mul(3) / 2,
            PlanetType::Military => base / 2,
            _                    => base,
        };

        planet.iron_balance    = planet.iron_balance.saturating_add(iron_gen).min(max);
        planet.gold_balance    = planet.gold_balance.saturating_add(gold_gen).min(max);
        planet.uranium_balance = planet.uranium_balance.saturating_add(uranium_gen).min(max);
        planet.last_claim_ts   = now;
    }

    planet.colonized = false;

    emit!(PlanetUncolonized {
        owner:     planet.owner,
        planet:    planet.asset,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}