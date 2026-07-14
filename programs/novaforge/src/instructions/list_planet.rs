use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use mpl_core::instructions::AddPluginV1;
use mpl_core::instructions::AddPluginV1InstructionArgs;
use mpl_core::types::{FreezeDelegate, Plugin, PluginAuthority};

use crate::{
    errors::NovaForgeError,
    events::PlanetListed,
    state::Planet,
};

#[derive(Accounts)]
pub struct ListPlanet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner
    )]
    pub planet: Account<'info, Planet>,

    /// CHECK: MPL-Core Asset
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: MPL-Core program
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ListPlanet>, price: u64) -> Result<()> {
    let planet = &mut ctx.accounts.planet;

    require!(!planet.inactive,  NovaForgeError::PlanetInactive);
    require!(!planet.colonized, NovaForgeError::PlanetStillColonized);
    require!(!planet.listed,    NovaForgeError::AlreadyListed);
    require!(price > 0,         NovaForgeError::InvalidPrice);

    // Add FreezeDelegate plugin to lock the asset
    let add_plugin_ix = AddPluginV1 {
        asset:          ctx.accounts.asset.key(),
        collection:     None,
        payer:          ctx.accounts.owner.key(),
        authority:      Some(ctx.accounts.owner.key()),
        system_program: ctx.accounts.system_program.key(),
        log_wrapper:    None,
    }
    .instruction(AddPluginV1InstructionArgs {
        plugin: Plugin::FreezeDelegate(FreezeDelegate { frozen: true }),
        init_authority: Some(PluginAuthority::Address {
            address: ctx.accounts.owner.key(),
        }),
    });

    invoke(
        &add_plugin_ix,
        &[
            ctx.accounts.asset.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.mpl_core_program.to_account_info(),
        ],
    )?;

    planet.listed = true;
    planet.price  = price;

    emit!(PlanetListed {
        seller:    planet.owner,
        planet:    planet.asset,
        price,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}