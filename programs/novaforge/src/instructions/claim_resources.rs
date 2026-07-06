use anchor_lang::prelude::*;
use crate::utils::apply_damage;
use crate::{
    errors::NovaForgeError,
    events::ResourcesClaimed,
    state::Planet,
};
use shared::{
    constants::*,
    PlanetType,
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

pub fn handler(ctx: Context<ClaimResources>) -> Result<()> {
    let planet = &mut ctx.accounts.planet;

    require!(planet.colonized, NovaForgeError::PlanetNotColonized);
    require!(!planet.inactive, NovaForgeError::PlanetInactive);

    let now     = Clock::get()?.unix_timestamp;
    let elapsed = now
        .checked_sub(planet.last_claim_ts)
        .ok_or(NovaForgeError::TimestampUnderflow)? as u64;

    require!(elapsed > 0, NovaForgeError::NothingToClaim);

    let hours_unclaimed = (elapsed / 3600).min(100) as u8;
    planet.threat_level = hours_unclaimed;

    let effective_threat = match planet.planet_type {
        PlanetType::Military => planet.threat_level
            .saturating_sub(MILITARY_THREAT_REDUCTION),
        _ => planet.threat_level,
    };

    if effective_threat >= 50 {
        let tier = match effective_threat {
            90..=100 => 3u8, // Warlord
            75..=89  => 2,   // Raider
            _        => 1,   // Scout
        };
        apply_damage(planet, tier)?;

        if tier == 3 {
            planet.inactive      = true;
            planet.threat_level  = 100;
            planet.last_claim_ts = now;
            emit!(ResourcesClaimed {
                owner:        planet.owner,
                planet:        planet.asset,
                iron_claimed:         0,
                gold_claimed:         0,
                uranium_claimed:      0,
                threat_level: planet.threat_level,
                timestamp:    now,
            });
            return Ok(());
        }
    }

    let base = planet
        .production_rate
        .checked_mul(elapsed)
        .ok_or(NovaForgeError::OverFlow)?;

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
        PlanetType::Energy   |
        PlanetType::Research => base.saturating_mul(3) / 2,
        PlanetType::Military => base / 2,
        _                    => base,
    };

    let max = planet
        .production_rate
        .saturating_mul(MAX_STORAGE_SECS);

    planet.iron_balance = planet
        .iron_balance
        .saturating_add(iron_gen)
        .min(max);
    planet.gold_balance = planet
        .gold_balance
        .saturating_add(gold_gen)
        .min(max);
    planet.uranium_balance = planet
        .uranium_balance
        .saturating_add(uranium_gen)
        .min(max);

    planet.threat_level  = 0;
    planet.last_claim_ts = now;

    emit!(ResourcesClaimed {
        owner:        planet.owner,
        planet:        planet.asset,
        iron_claimed:         iron_gen,
        gold_claimed:         gold_gen,
        uranium_claimed:      uranium_gen,
        threat_level: planet.threat_level,
        timestamp:    now,
    });

    Ok(())
}
