use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::NovaForgeError,
    events::RaidLaunched,
    state::{Planet, Raid, RaidStatus},
};

#[derive(Accounts)]
pub struct LaunchRaid<'info> {

    #[account(mut)]
    pub attacker: Signer<'info>,

   #[account(
    mut,
    constraint = attacker_planet.owner == attacker.key()
        @ NovaForgeError::Unauthorized
)]
pub attacker_planet: Account<'info, Planet>,

    #[account(
        mut,
        constraint = target_planet.owner != attacker.key()
            @ NovaForgeError::CannotRaidOwnPlanet
    )]
    pub target_planet: Account<'info, Planet>,

    #[account(
        init,
        payer = attacker,
        space = 8 + Raid::INIT_SPACE,
        seeds = [
            RAID_SEED,
            attacker_planet.key().as_ref()
        ],
        bump
    )]
    pub raid: Account<'info, Raid>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<LaunchRaid>,
) -> Result<()> {

    let now = Clock::get()?.unix_timestamp;

    let attacker_planet =
        &ctx.accounts.attacker_planet;

    let target_planet =
        &ctx.accounts.target_planet;

    require!(
        attacker_planet.colonized,
        NovaForgeError::PlanetNotColonized
    );

    require!(
        !attacker_planet.inactive,
        NovaForgeError::PlanetInactive
    );

    require!(
        target_planet.colonized,
        NovaForgeError::TargetNotColonized
    );

    require!(
        !target_planet.inactive,
        NovaForgeError::TargetInactive
    );

    require!(
        attacker_planet.military_power > 0,
        NovaForgeError::InsufficientMilitary
    );

    let attacker_power =
        attacker_planet.military_power;

    let defender_power =
        target_planet.military_power;

    let raid = &mut ctx.accounts.raid;

    raid.attacker = ctx.accounts.attacker.key();
    raid.defender = target_planet.owner;
    raid.attacker_planet = attacker_planet.key();
    raid.target_planet = target_planet.key();

    raid.started_at = now;
    raid.resolve_at = now + RAID_DURATION;

    raid.attacker_power = attacker_power;
    raid.defender_power = defender_power;

    raid.status = RaidStatus::InProgress;

    raid.iron_looted = 0;
    raid.gold_looted = 0;
    raid.uranium_looted = 0;

    raid.bump = ctx.bumps.raid;

    emit!(RaidLaunched {
        attacker: ctx.accounts.attacker.key(),
        attacker_planet: attacker_planet.key(),
        target_planet: target_planet.key(),
        resolve_at: raid.resolve_at,
    });

    Ok(())
}