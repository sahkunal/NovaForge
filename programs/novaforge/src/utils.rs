use anchor_lang::prelude::*;
use anchor_lang::prelude::Account;
use crate::state::Planet;
use shared::PlanetType;
use shared::constants::*;


pub fn calculate_resources(
    rate: u64,
    elapsed_seconds: i64,
) -> u64 {

    (rate * elapsed_seconds as u64)
        / 3600
}

pub fn upgrade_cost(
    level: u16,
) -> (u64, u64) {

    let iron =
        100 * level as u64;

    let gold =
        20 * level as u64;

    (iron, gold)
}

// Called when threat_level crosses 50 — spawns the monster
pub fn spawn_monster(planet: &mut Account<'_, Planet>, tier: u8) {    // only spawn if no active monster
    if planet.monster_power > 0 {
        return;
    }
    planet.monster_tier  = tier;
    planet.monster_power = match tier {
        1 => MONSTER_POWER_SCOUT,
        2 => MONSTER_POWER_RAIDER,
        3 => MONSTER_POWER_WARLORD,
        _ => 0,
    };
}

// Called every claim while monster is active
pub fn resolve_combat(planet: &mut Account<'_, Planet>, now: i64) -> Result<CombatResult> {
    if planet.monster_power == 0 {
        return Ok(CombatResult::NoCombat);
    }

    // how much defense hits the monster
    let defense_attack = (planet.military_power * DEFENSE_DAMAGE_PER_CLAIM / 100).max(1);
    // how much monster hits the defense
    let monster_attack = (planet.monster_power * MONSTER_DAMAGE_PER_CLAIM / 100).max(1);

    planet.monster_power  = planet.monster_power.saturating_sub(defense_attack);
    planet.military_power = planet.military_power.saturating_sub(monster_attack);

    if planet.monster_power == 0 {
        // planet wins
        apply_kill_reward(planet, planet.monster_tier, now);
        planet.monster_tier = 0;
        return Ok(CombatResult::MonsterKilled);
    }

    if planet.military_power == 0 {
        // monster wins
        apply_monster_victory(planet);
        planet.monster_power = 0;
        planet.monster_tier  = 0;
        return Ok(CombatResult::PlanetDefeated);
    }

    Ok(CombatResult::Ongoing)
}

pub enum CombatResult {
    NoCombat,
    Ongoing,
    MonsterKilled,
    PlanetDefeated,
}

fn apply_kill_reward(planet: &mut Account<'_, Planet>, tier: u8, now: i64) {
    planet.monsters_killed    += 1;
    planet.last_monster_kill   = now;

    match tier {
        1 => {
            // Scout kill — resource bonus + temp production boost
            planet.iron_balance    = planet.iron_balance.saturating_add(KILL_BONUS_SCOUT_RESOURCES);
            planet.gold_balance    = planet.gold_balance.saturating_add(KILL_BONUS_SCOUT_RESOURCES);
            planet.uranium_balance = planet.uranium_balance.saturating_add(KILL_BONUS_SCOUT_RESOURCES);
            planet.production_boost = PRODUCTION_BOOST_SCOUT;
            planet.boost_expiry     = now + PRODUCTION_BOOST_DURATION;
        }
        2 => {
            // Raider kill — bigger resource bonus + longer boost
            planet.iron_balance    = planet.iron_balance.saturating_add(KILL_BONUS_RAIDER_RESOURCES);
            planet.gold_balance    = planet.gold_balance.saturating_add(KILL_BONUS_RAIDER_RESOURCES);
            planet.uranium_balance = planet.uranium_balance.saturating_add(KILL_BONUS_RAIDER_RESOURCES);
            planet.production_boost = PRODUCTION_BOOST_RAIDER;
            planet.boost_expiry     = now + PRODUCTION_BOOST_DURATION;
        }
        3 => {
            // Warlord kill — permanent military_power boost
            planet.military_power = planet.military_power
                .saturating_add(KILL_BONUS_WARLORD_MILITARY);
            planet.production_boost = 30; // 30% boost
            planet.boost_expiry     = now + PRODUCTION_BOOST_DURATION * 2;
        }
        _ => {}
    }
}

fn apply_monster_victory(planet: &mut Account<'_, Planet>) {
    match planet.monster_tier {
        1 => {
            // Scout wins — 25% primary resource loot
            match planet.planet_type {
                PlanetType::Mining   => planet.iron_balance    = planet.iron_balance    * 3 / 4,
                PlanetType::Luxury   => planet.gold_balance    = planet.gold_balance    * 3 / 4,
                PlanetType::Research => planet.uranium_balance = planet.uranium_balance * 3 / 4,
                PlanetType::Energy   => planet.uranium_balance = planet.uranium_balance * 3 / 4,
                PlanetType::Military => {
                    planet.iron_balance    = planet.iron_balance    * 3 / 4;
                    planet.uranium_balance = planet.uranium_balance * 3 / 4;
                }
            }
        }
        2 => {
            // Raider wins — 60% all resources looted
            planet.iron_balance    = planet.iron_balance    * 2 / 5;
            planet.gold_balance    = planet.gold_balance    * 2 / 5;
            planet.uranium_balance = planet.uranium_balance * 2 / 5;
        }
        3 => {
            // Warlord wins — full loot + inactive
            planet.iron_balance    = 0;
            planet.gold_balance    = 0;
            planet.uranium_balance = 0;
            planet.inactive        = true;
        }
        _ => {}
    }
}