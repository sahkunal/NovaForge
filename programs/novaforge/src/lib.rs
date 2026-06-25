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
}