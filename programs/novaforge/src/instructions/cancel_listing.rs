use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use mpl_core::instructions::RemovePluginV1;
use mpl_core::instructions::RemovePluginV1InstructionArgs;
use mpl_core::types::PluginType;

use crate::{
    errors::NovaForgeError,
    events::ListingCancelled,
    state::Planet,
};

#[derive(Accounts)]
pub struct CancelListing<'info> {
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

pub fn handler(ctx: Context<CancelListing>) -> Result<()> {
    let planet = &mut ctx.accounts.planet;

    require!(planet.listed, NovaForgeError::Unauthorized);

    // Remove FreezeDelegate plugin to unfreeze asset
    let remove_plugin_ix = RemovePluginV1 {
        asset:          ctx.accounts.asset.key(),
        collection:     None,
        payer:          ctx.accounts.owner.key(),
        authority:      Some(ctx.accounts.owner.key()),
        system_program: ctx.accounts.system_program.key(),
        log_wrapper:    None,
    }
    .instruction(RemovePluginV1InstructionArgs {
        plugin_type: PluginType::FreezeDelegate,
    });

    invoke(
        &remove_plugin_ix,
        &[
            ctx.accounts.asset.to_account_info(),
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.mpl_core_program.to_account_info(),
        ],
    )?;

    planet.listed = false;
    planet.price  = 0;

    emit!(ListingCancelled {
        seller:    planet.owner,
        planet:    planet.asset,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}