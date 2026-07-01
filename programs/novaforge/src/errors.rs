use anchor_lang::prelude::*;

#[error_code]
pub enum NovaForgeError {

    #[msg("Already colonized")]
    AlreadyColonized,

    #[msg("Planet not colonized")]
    PlanetNotColonized,

    #[msg("Insufficient resources")]
    InsufficientResources,

    #[msg("Already listed")]
    AlreadyListed,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Planet destroyed")]
    PlanetDestroyed,

    #[msg("Nothing to claim")]
    NothingToClaim,
}