use anchor_lang::prelude::*;
use crate::{
    errors::NovaForgeError,
    state::Planet,
    events::PlanetRaided,
};

#[derive(Accounts)]
pub struct RaidPlanet<'info> {
    /// The attacking player
    #[account(mut)]
    pub attacker: Signer<'info>,

    /// Attacker's planet — must be owned by attacker, colonized, has military
    #[account(
        mut,
        has_one = owner @ NovaForgeError::Unauthorized,
        constraint = attacker_planet.owner == attacker.key() @ NovaForgeError::Unauthorized,
    )]
    pub attacker_planet: Account<'info, Planet>,

    /// Target planet — must be a different owner
    #[account(
        mut,
        constraint = target_planet.owner != attacker.key() @ NovaForgeError::CannotRaidOwnPlanet,
    )]
    pub target_planet: Account<'info, Planet>,

    /// CHECK: owner of the target planet, used for constraint only
    pub owner: SystemAccount<'info>,
}

pub fn handler(ctx: Context<RaidPlanet>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    let attacker_planet = &mut ctx.accounts.attacker_planet;
    let target_planet   = &mut ctx.accounts.target_planet;

    // === VALIDATE ATTACKER ===
    require!(attacker_planet.colonized, NovaForgeError::PlanetNotColonized);
    require!(!attacker_planet.inactive,  NovaForgeError::PlanetInactive);
    require!(attacker_planet.military_power > 0, NovaForgeError::InsufficientMilitary);

    // === VALIDATE TARGET ===
    require!(target_planet.colonized,  NovaForgeError::TargetNotColonized);
    require!(!target_planet.inactive,  NovaForgeError::TargetInactive);

    // === COOLDOWN: 6 hours between raids on same target ===
    // We store last raid time in last_monster_kill on attacker planet
    // (In a future version add a dedicated raid_ts field)
    let hours_since_last_raid = (now - attacker_planet.last_monster_kill) / 3600;
    require!(hours_since_last_raid >= 6, NovaForgeError::RaidOnCooldown);

    // === COMBAT CALCULATION ===
    // Power ratio determines loot %
    // If attacker_mil > target_mil → attacker wins
    // Attacker always loses some military in the fight
    let attacker_mil = attacker_planet.military_power;
    let target_mil   = target_planet.military_power.max(1); // avoid div by zero

    // Both sides take damage proportional to the other's power
    let DAMAGE_FACTOR: u32 = 30; // 30% damage per raid

    let attacker_damage = (target_mil * DAMAGE_FACTOR / 100).max(1);
    let target_damage   = (attacker_mil * DAMAGE_FACTOR / 100).max(1);

    attacker_planet.military_power = attacker_planet.military_power
        .saturating_sub(attacker_damage);
    target_planet.military_power = target_planet.military_power
        .saturating_sub(target_damage);

    // Record raid timestamp
    attacker_planet.last_monster_kill = now;

    // === DETERMINE OUTCOME ===
    let attacker_wins = attacker_mil > target_mil;

    let (iron_looted, gold_looted, uranium_looted);

    if attacker_wins {
        // Loot % scales with how dominant the attacker was
        // 10% base + up to 40% bonus based on power ratio (capped at 50%)
        let ratio = (attacker_mil * 100 / target_mil).min(500); // 100 = equal, 500 = 5x stronger
        let loot_pct = (10u64 + (ratio as u64 - 100).min(400) / 10).min(50); // 10-50%

        iron_looted     = target_planet.iron_balance    * loot_pct / 100;
        gold_looted     = target_planet.gold_balance    * loot_pct / 100;
        uranium_looted  = target_planet.uranium_balance * loot_pct / 100;

        // Transfer resources
        target_planet.iron_balance     = target_planet.iron_balance.saturating_sub(iron_looted);
        target_planet.gold_balance     = target_planet.gold_balance.saturating_sub(gold_looted);
        target_planet.uranium_balance  = target_planet.uranium_balance.saturating_sub(uranium_looted);

        attacker_planet.iron_balance     = attacker_planet.iron_balance.saturating_add(iron_looted);
        attacker_planet.gold_balance     = attacker_planet.gold_balance.saturating_add(gold_looted);
        attacker_planet.uranium_balance  = attacker_planet.uranium_balance.saturating_add(uranium_looted);

        // Attacker gets kill credit if they overpowered significantly
        if ratio >= 150 {
            attacker_planet.monsters_killed += 1; // reuse kills counter for raid wins
        }
    } else {
        // Attacker lost — no loot, just took damage
        iron_looted    = 0;
        gold_looted    = 0;
        uranium_looted = 0;
    }

    emit!(PlanetRaided {
        attacker:       ctx.accounts.attacker.key(),
        attacker_planet: attacker_planet.asset,
        target_planet:   target_planet.asset,
        target_owner:    target_planet.owner,
        iron_looted,
        gold_looted,
        uranium_looted,
        attacker_won:    attacker_wins,
        timestamp:       now,
    });

    Ok(())
}