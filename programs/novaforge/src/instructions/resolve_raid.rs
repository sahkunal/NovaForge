use anchor_lang::prelude::*;

use crate::{
    constants::*,
    errors::NovaForgeError,
    events::RaidResolved,
    state::{
        BattleReport,
        BattleWinner,
        Building,
        Planet,
        Raid,
        RaidStatus,
    },
    utils::building_combat_power,
};

#[derive(Accounts)]
pub struct ResolveRaid<'info> {

    /// Anyone can resolve the raid once the timer has expired.
    #[account(mut)]
    pub resolver: Signer<'info>,

    /// Attacker planet
    #[account(mut)]
    pub attacker_planet: Account<'info, Planet>,

    /// Target planet
    #[account(mut)]
    pub target_planet: Account<'info, Planet>,

    /// Active raid
    #[account(
        mut,
        seeds = [
            RAID_SEED,
            attacker_planet.key().as_ref()
        ],
        bump = raid.bump,

        constraint =
            raid.attacker_planet == attacker_planet.key()
            @ NovaForgeError::InvalidBuildingPlanet,

        constraint =
            raid.target_planet == target_planet.key()
            @ NovaForgeError::InvalidBuildingPlanet,
    )]
    pub raid: Account<'info, Raid>,

    /// Permanent battle report
    #[account(
        init,
        payer = resolver,
        space = 8 + BattleReport::INIT_SPACE,
        seeds = [
            BATTLE_REPORT_SEED,
            attacker_planet.key().as_ref(),
            &raid.started_at.to_le_bytes()
        ],
        bump
    )]
    pub battle_report: Account<'info, BattleReport>,

    pub system_program: Program<'info, System>,
}

pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, ResolveRaid<'info>>,
) -> Result<()> {

    let now = Clock::get()?.unix_timestamp;

    // --------------------------------------------------
    // 1. Validate raid
    // --------------------------------------------------

    require!(
        ctx.accounts.raid.status == RaidStatus::InProgress,
        NovaForgeError::RaidNotReady
    );

    require!(
        now >= ctx.accounts.raid.resolve_at,
        NovaForgeError::RaidNotReady
    );

    // --------------------------------------------------
    // 2. Calculate defender power
    // --------------------------------------------------

    let mut defender_power =
        ctx.accounts.target_planet.military_power;

    for account_info in ctx.remaining_accounts.iter() {
    if account_info.owner != ctx.program_id {
        continue;
    }

    let data = account_info.try_borrow_data()?;

    let building = Building::try_deserialize(&mut &data[..])?;

    require!(
        building.planet == ctx.accounts.target_planet.key(),
        NovaForgeError::InvalidBuildingPlanet
    );

    if building.active && building.health > 0 {
        defender_power = defender_power
            .saturating_add(building_combat_power(&building));
    }
}

    // --------------------------------------------------
    // 3. Get attacker power
    // --------------------------------------------------

    let attacker_power =
        ctx.accounts.raid.attacker_power;

    // --------------------------------------------------
    // 4. Determine winner
    // --------------------------------------------------

    let attacker_won =
        attacker_power > defender_power;

    // --------------------------------------------------
    // 5. Calculate loot
    // --------------------------------------------------

    let (
        iron_looted,
        gold_looted,
        uranium_looted,
    ) = if attacker_won {

        let ratio = if defender_power == 0 {

            500u64

        } else {

            (attacker_power as u64)
                .saturating_mul(100)
                .checked_div(defender_power as u64)
                .unwrap_or(500)
                .min(500)
        };

        /*
            Equal power:
                10%

            2x power:
                20%

            3x power:
                30%

            4x power:
                40%

            5x+:
                50%
        */

        let loot_percentage =
            10u64
                + ((ratio.saturating_sub(100))
                    .min(400)
                    / 10);

        let target =
            &mut ctx.accounts.target_planet;

        let iron =
            target.iron_balance
                .saturating_mul(loot_percentage)
                / 100;

        let gold =
            target.gold_balance
                .saturating_mul(loot_percentage)
                / 100;

        let uranium =
            target.uranium_balance
                .saturating_mul(loot_percentage)
                / 100;

        // Remove resources from defender.
        target.iron_balance =
            target.iron_balance
                .saturating_sub(iron);

        target.gold_balance =
            target.gold_balance
                .saturating_sub(gold);

        target.uranium_balance =
            target.uranium_balance
                .saturating_sub(uranium);

        (iron, gold, uranium)

    } else {

        (0, 0, 0)
    };

    // --------------------------------------------------
    // 6. Give loot to attacker
    // --------------------------------------------------

    if attacker_won {

        let attacker =
            &mut ctx.accounts.attacker_planet;

        attacker.iron_balance =
            attacker.iron_balance
                .saturating_add(iron_looted);

        attacker.gold_balance =
            attacker.gold_balance
                .saturating_add(gold_looted);

        attacker.uranium_balance =
            attacker.uranium_balance
                .saturating_add(uranium_looted);
    }

    // --------------------------------------------------
    // 7. Create battle report
    // --------------------------------------------------

    let winner =
        if attacker_won {
            BattleWinner::Attacker
        } else {
            BattleWinner::Defender
        };

    let raid_key =
        ctx.accounts.raid.key();

    let attacker_key =
        ctx.accounts.raid.attacker;

    let defender_key =
        ctx.accounts.raid.defender;

    let attacker_planet_key =
        ctx.accounts.raid.attacker_planet;

    let target_planet_key =
        ctx.accounts.raid.target_planet;

    {
        let report =
            &mut ctx.accounts.battle_report;

        report.raid = raid_key;

        report.attacker =
            attacker_key;

        report.defender =
            defender_key;

        report.attacker_planet =
            attacker_planet_key;

        report.target_planet =
            target_planet_key;

        report.winner =
            winner;

        report.attacker_power =
            attacker_power;

        report.defender_power =
            defender_power;

        report.iron_looted =
            iron_looted;

        report.gold_looted =
            gold_looted;

        report.uranium_looted =
            uranium_looted;

        report.resolved_at =
            now;

        report.bump =
            ctx.bumps.battle_report;
    }

    // --------------------------------------------------
    // 8. Update raid status
    // --------------------------------------------------

    ctx.accounts.raid.status =
        if attacker_won {
            RaidStatus::AttackerWon
        } else {
            RaidStatus::DefenderWon
        };

    ctx.accounts.raid.iron_looted =
        iron_looted;

    ctx.accounts.raid.gold_looted =
        gold_looted;

    ctx.accounts.raid.uranium_looted =
        uranium_looted;

    // --------------------------------------------------
    // 9. Emit event
    // --------------------------------------------------

    emit!(RaidResolved {
        attacker: attacker_key,
        attacker_planet: attacker_planet_key,
        target_planet: target_planet_key,
        attacker_won,
        iron_looted,
        gold_looted,
        uranium_looted,
        timestamp: now,
    });

    Ok(())
}