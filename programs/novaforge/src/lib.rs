use anchor_lang::prelude::*;
use shared::{PlanetType, Rarity};
use crate::state::BuildingType;

pub mod state;
pub mod errors;
pub mod events;
pub mod utils;
pub mod instructions;
pub mod constants;
use instructions::*;

declare_id!("4RmfPaedo1BpddXzwASa2LU6YJ9pZ6XafwJGxRm22bsB");

#[program]
pub mod novaforge {
    use super::*;

    pub fn initialize_planet(
        ctx: Context<InitializePlanet>,
        planet_type: PlanetType,
        rarity: Rarity,
    ) -> Result<()> {
        instructions::initialize_planet::handler(ctx, planet_type, rarity)
    }

    pub fn colonize_planet(ctx: Context<ColonizePlanet>) -> Result<()> {
        instructions::colonize_planet::handler(ctx)
    }

    pub fn uncolonize_planet(ctx: Context<UncolonizePlanet>) -> Result<()> {
        instructions::uncolonize_planet::handler(ctx)
    }

    pub fn claim_resources(ctx: Context<ClaimResources>) -> Result<()> {
        instructions::claim_resources::handler(ctx)
    }

    pub fn upgrade_military(ctx: Context<UpgradeMilitary>) -> Result<()> {
        instructions::upgrade_military::handler(ctx)
    }

    pub fn upgrade_planet(ctx: Context<UpgradePlanet>) -> Result<()> {
        instructions::upgrade_planet::handler(ctx)
    }

    pub fn repair_planet(ctx: Context<RepairPlanet>) -> Result<()> {
        instructions::repair_planet::handler(ctx)
    }

    pub fn check_threat(ctx: Context<CheckThreat>) -> Result<()> {
        instructions::check_threat::handler(ctx)
    }

    pub fn list_planet(ctx: Context<ListPlanet>, price: u64) -> Result<()> {
        instructions::list_planet::handler(ctx, price)
    }

    pub fn buy_planet(ctx: Context<BuyPlanet>) -> Result<()> {
        instructions::buy_planet::handler(ctx)
    }

     pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        instructions::cancel_listing::handler(ctx)
    }

      pub fn raid_planet(ctx: Context<RaidPlanet>) -> Result<()> {
        instructions::raid_planet::handler(ctx)
    }

    pub fn build_building(
    ctx: Context<BuildBuilding>,
    slot: u8,
    building_type: BuildingType,
) -> Result<()> {
    instructions::build_building::handler(
        ctx,
        slot,
        building_type,
    )
}

pub fn upgrade_building(
    ctx: Context<UpgradeBuilding>,
) -> Result<()> {
    instructions::upgrade_building::handler(ctx)
}

pub fn repair_building(
    ctx: Context<RepairBuilding>,
) -> Result<()> {
    instructions::repair_building::handler(ctx)
}

pub fn launch_raid(
    ctx: Context<LaunchRaid>,
) -> Result<()> {
    instructions::launch_raid::handler(ctx)
}

pub fn resolve_raid<'info>(
    ctx: Context<'_, '_, '_, 'info, ResolveRaid<'info>>,
) -> Result<()> {
    instructions::resolve_raid::handler(ctx)
}
}