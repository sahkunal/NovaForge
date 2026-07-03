use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

pub const MAX_LEVEL: u16 = 100;

pub const BASE_POWER: u32 = 100;

pub const MARKETPLACE_FEE_BPS: u16 = 250;

pub const BASE_IRON_RATE: u64 = 10;

pub const BASE_GOLD_RATE: u64 = 5;

pub const BASE_URANIUM_RATE: u64 = 2;

pub const MAX_STORAGE_SECS: u64 = 60 * 60 * 24;
pub const MILITARY_THREAT_REDUCTION: u8 = 20;

pub const MILITARY_UPGRADE_IRON_COST: u64 = 80;
pub const MILITARY_UPGRADE_GOLD_COST: u64 = 40;
pub const MILITARY_UPGRADE_URANIUM_COST: u64 = 25;

pub const MILITARY_POWER_INCREMENT: u32 = 25;