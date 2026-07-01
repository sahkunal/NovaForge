use anchor_lang::prelude::*;

use crate::{
    state::Planet,
    events::ResourcesClaimed,
    errors::NovaForgeError,
};

#[derive(Accounts)]
pub struct ClaimResources<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,
}

pub fn handler(
    ctx: Context<ClaimResources>,
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

    let now = Clock::get()?.unix_timestamp;

    let elapsed = now - planet.last_claim_ts;

    require!(elapsed > 0, NovaForgeError::NothingToClaim);

    // Resources generated
    let generated =
        (planet.production_rate * elapsed as u64) / 3600;

    let mut iron = 0;
    let mut gold = 0;
    let mut uranium = 0;

    match planet.planet_type {

        shared::PlanetType::Mining => {
            planet.iron_balance += generated;
            iron = generated;
        }

        shared::PlanetType::Luxury => {
            planet.gold_balance += generated;
            gold = generated;
        }

        shared::PlanetType::Research => {
            planet.uranium_balance += generated;
            uranium = generated;
        }

        shared::PlanetType::Energy => {
    // TODO: Generate Energy resource in future
        }

        shared::PlanetType::Military => {
            planet.iron_balance += generated / 2;
            planet.uranium_balance += generated / 2;

            iron = generated / 2;
            uranium = generated / 2;
        }
    }

    // Increase threat
    planet.threat_level =
        (planet.threat_level + 5).min(100);

    planet.last_claim_ts = now;

    emit!(ResourcesClaimed {
        owner: planet.owner,
        planet: planet.asset,
        iron_claimed: iron,
        gold_claimed: gold,
        uranium_claimed: uranium,
        threat_level: planet.threat_level,
        timestamp: now,
    });

    Ok(())
}