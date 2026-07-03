use anchor_lang::prelude::*;
use crate::state::Planet;
use shared::PlanetType;


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

pub fn apply_damage(planet: &mut Planet, tier: u8) -> Result<()> {
    match tier {
        1 => {
            // Scout — 25% loot of primary resource
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
            // Raider — 60% loot across all resources
            planet.iron_balance    = planet.iron_balance    * 2 / 5;
            planet.gold_balance    = planet.gold_balance    * 2 / 5;
            planet.uranium_balance = planet.uranium_balance * 2 / 5;
        }
        3 => {
            // Warlord — full loot, planet goes inactive
            planet.iron_balance    = 0;
            planet.gold_balance    = 0;
            planet.uranium_balance = 0;
        }
        _ => {}
    }
    Ok(())
}