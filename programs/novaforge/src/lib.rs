pub mod state;
pub mod constants;
pub mod errors;
pub mod events;
pub mod utils;
pub mod instructions;

use anchor_lang::prelude::*;

use shared::{PlanetType, Rarity};

use crate::instructions::{
    initialize_planet::InitializePlanet,
    colonize_planet::ColonizePlanet,
    uncolonize_planet::UncolonizePlanet,
    claim_resource::ClaimResources,
    upgrade_military::UpgradeMilitary,
    upgrade_planet::UpgradePlanet,
};

declare_id!("Dc5YsYCwHU5fMQb7Fz4qEWpnfSQLY25yLtRrDh1qaKon");

#[program]
pub mod novaforge {
use super::*;

    pub fn initialize_planet(
        ctx: Context<InitializePlanet>,
        planet_type: PlanetType,
        rarity: Rarity,
    ) -> Result<()> {
        instructions::initialize_planet::handler(
            ctx,
            planet_type,
            rarity,
        )
    }

    pub fn colonize_planet(
        ctx: Context<ColonizePlanet>,
    ) -> Result<()> {
        instructions::colonize_planet::handler(ctx)
    }
    pub fn uncolonized_planet(
        ctx:Context<UncolonizePlanet>)->Result<()>{
            instructions::uncolonize_planet::handler(ctx)
        }

    pub fn claim_resources(
    ctx: Context<ClaimResources>,
) -> Result<()> {
    instructions::claim_resources::handler(ctx)
}

pub fn upgrade_military(
    ctx: Context<UpgradeMilitary>,
) -> Result<()> {
    instructions::upgrade_military::handler(ctx)
}

pub fn upgrade_planet(
    ctx: Context<UpgradePlanet>,
) -> Result<()> {
    instructions::upgrade_planet::handler(ctx)
}
}