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

    #[msg("Nothing to claim")]
    NothingToClaim,

    #[msg("planet inactive")]
    PlanetInactive,
   
    #[msg("time stamp is under flow ")]
    TimestampUnderflow,

    #[msg("over flow")]
    OverFlow,

    #[msg("planet not destroyed")]
    PlanetNotDestroyed,

    #[msg("planet is still colonized")]
    PlanetStillColonized,

    #[msg("price is invalid")]
    InvalidPrice,

    #[msg("max level reached")]
    MaxLevelReached,

    #[msg("cant buy own planet")]
    CannotBuyOwnPlanet,

    #[msg("No active monster to resolve")]
    NoActiveMonster,

    #[msg("Cannot raid your own planet")]
    CannotRaidOwnPlanet,

    #[msg("Target planet is not colonized")]
    TargetNotColonized,

    #[msg("Target planet is inactive")]
    TargetInactive,

    #[msg("Insufficient military power to raid")]
    InsufficientMilitary,

    #[msg("Raid cooldown active — wait 6 hours between raids")]
    RaidOnCooldown,

     #[msg("Invalid building slot")]
    InvalidBuildingSlot,

    #[msg("Building slot is already occupied")]
    BuildingSlotOccupied,

    #[msg("Building level is already at maximum")]
    BuildingMaxLevel,

    #[msg("Building is already at full health")]
    BuildingAlreadyHealthy,

    #[msg("Building is destroyed")]
    BuildingDestroyed,

    #[msg("Raid is already active")]
    RaidAlreadyActive,

    #[msg("Raid is not ready to resolve")]
    RaidNotReady,

    #[msg("Target planet is protected")]
    TargetProtected,

    #[msg("Insufficient fleet power")]
    InsufficientFleetPower,

    #[msg("Monster raid is already active")]
    MonsterRaidAlreadyActive,

    #[msg("Monster raid is not ready")]
    MonsterRaidNotReady,

    #[msg("No active monster raid")]
    NoActiveMonsterRaid,

    #[msg("Invalid building account")]
    InvalidBuildingAccount,

    #[msg("Invalid building planet")]
    InvalidBuildingPlanet,

    #[msg("arithmetic overflow")]
    ArithmeticOverflow
}