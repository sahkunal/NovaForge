use anchor_lang::prelude::*;

#[constant]
pub const PLANET_SEED: &[u8] = b"planet";

#[constant]
pub const LISTING_SEED: &[u8] = b"listing";

#[constant]
pub const BUILDING_SEED: &[u8] = b"building";

#[constant]
pub const RAID_SEED: &[u8] = b"raid";

#[constant]
pub const BATTLE_REPORT_SEED: &[u8] = b"battle_report";

#[constant]
pub const MONSTER_RAID_SEED: &[u8] = b"monster_raid";

pub const MAX_BUILDING_SLOTS: u8 = 25;

pub const MAX_BUILDING_LEVEL: u16 = 20;

pub const RAID_DURATION: i64 = 60;

pub const MONSTER_RAID_WARNING: i64 = 120;

pub const BASE_BUILDING_HEALTH: u32 = 100;

pub const COMMAND_CORE_HEALTH: u32 = 1_000;

pub const TURRET_HEALTH: u32 = 350;

pub const MISSILE_BATTERY_HEALTH: u32 = 500;

pub const ORBITAL_CANNON_HEALTH: u32 = 700;

pub const SHIELD_GENERATOR_HEALTH: u32 = 600;

pub const SHIPYARD_HEALTH: u32 = 400;

pub const STORAGE_HEALTH: u32 = 300;

pub const RESOURCE_BUILDING_HEALTH: u32 = 250;

pub const BASE_BUILD_IRON: u64 = 100;

pub const BASE_BUILD_GOLD: u64 = 50;

pub const BASE_BUILD_URANIUM: u64 = 25;

pub const BUILD_UPGRADE_MULTIPLIER: u64 = 2;

pub const REPAIR_IRON_PER_100_HP: u64 = 25;

pub const REPAIR_GOLD_PER_100_HP: u64 = 10;

pub const REPAIR_URANIUM_PER_100_HP: u64 = 5;

pub const DEFENSE_TURRET_POWER: u32 = 100;

pub const DEFENSE_MISSILE_POWER: u32 = 175;

pub const DEFENSE_ORBITAL_POWER: u32 = 300;

pub const DEFENSE_SHIELD_POWER: u32 = 150;

pub const SHIPYARD_FLEET_POWER: u32 = 100;

pub const MONSTER_TIER_1_POWER: u32 = 300;

pub const MONSTER_TIER_2_POWER: u32 = 700;

pub const MONSTER_TIER_3_POWER: u32 = 1_500;