pub mod state;
pub mod constants;
pub mod errors;
pub mod events;
pub mod utils;
use instructions::*;

use anchor_lang::prelude::*;
pub use constants::*;
pub use errors::*;
pub use events::*;
pub use utils::*;

declare_id!("Dc5YsYCwHU5fMQb7Fz4qEWpnfSQLY25yLtRrDh1qaKon");

#[program]
pub mod novaforge {
    use super::*;

    pub fn initialize_planet(
        ctx: Context<InitializePlanet>,
        planet_type: PlanetType,
    ) -> Result<()> {
        instructions::initialize_planet::handler(
            ctx,
            planet_type,
        )
    }

     pub fn colonize_planet(
        ctx: Context<ColonizePlanet>,
    ) -> Result<()> {
        instructions::colonize_planet::handler(ctx)
    }
}
