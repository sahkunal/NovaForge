use crate::constants::*;

pub fn calculate_resources(
    production_rate: u64,
    elapsed_seconds: i64,
) -> u64 {

    production_rate
        * elapsed_seconds as u64
        / SECONDS_PER_HOUR
}

pub fn calculate_power(
    level: u16,
) -> u32 {

    BASE_POWER + (level as u32 * 25)
}

pub fn upgrade_cost(
    level: u16,
) -> (u64, u64) {

    let iron = 100 * level as u64;
    let gold = 20 * level as u64;

    (iron, gold)
}