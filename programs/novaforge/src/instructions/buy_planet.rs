use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use mpl_core::instructions::{RemovePluginV1, RemovePluginV1InstructionArgs, TransferV1, TransferV1InstructionArgs};
use mpl_core::types::PluginType;

use crate::{
    errors::NovaForgeError,
    events::PlanetSold,
    state::Planet,
};
use shared::constants::MARKETPLACE_FEE_BPS;

#[derive(Accounts)]
pub struct BuyPlanet<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller receives lamports
    #[account(mut)]
    pub seller: UncheckedAccount<'info>,

    /// CHECK: Protocol treasury
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = planet.owner == seller.key() @ NovaForgeError::Unauthorized,
        constraint = planet.listed @ NovaForgeError::Unauthorized,
    )]
    pub planet: Account<'info, Planet>,

    /// CHECK: MPL-Core Asset
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: MPL-Core program
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<BuyPlanet>) -> Result<()> {
    let planet = &mut ctx.accounts.planet;

    require!(
        ctx.accounts.buyer.key() != ctx.accounts.seller.key(),
        NovaForgeError::CannotBuyOwnPlanet
    );

    let price = planet.price;
    let fee = price
        .checked_mul(MARKETPLACE_FEE_BPS as u64)
        .ok_or(NovaForgeError::OverFlow)?
        / 10_000;
    let seller_amount = price
        .checked_sub(fee)
        .ok_or(NovaForgeError::OverFlow)?;

    // Transfer SOL to seller
    invoke(
        &system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.seller.key(),
            seller_amount,
        ),
        &[
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.seller.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Transfer fee to treasury
    invoke(
        &system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.treasury.key(),
            fee,
        ),
        &[
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Remove FreezeDelegate plugin
    let remove_plugin_ix = RemovePluginV1 {
        asset:          ctx.accounts.asset.key(),
        collection:     None,
        payer:          ctx.accounts.buyer.key(),
        authority:      Some(ctx.accounts.seller.key()),
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
            ctx.accounts.seller.to_account_info(),
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.mpl_core_program.to_account_info(),
        ],
    )?;

    // Transfer asset to buyer
    let transfer_ix = TransferV1 {
        asset:          ctx.accounts.asset.key(),
        collection:     None,
        payer:          ctx.accounts.buyer.key(),
        authority:      Some(ctx.accounts.seller.key()),
        new_owner:      ctx.accounts.buyer.key(),
        system_program: Some(ctx.accounts.system_program.key()),
        log_wrapper:    None,
    }
    .instruction(TransferV1InstructionArgs {
        compression_proof: None,
    });

    invoke(
        &transfer_ix,
        &[
            ctx.accounts.asset.to_account_info(),
            ctx.accounts.seller.to_account_info(),
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.mpl_core_program.to_account_info(),
        ],
    )?;

    planet.owner  = ctx.accounts.buyer.key();
    planet.listed = false;
    planet.price  = 0;

    emit!(PlanetSold {
        seller:       ctx.accounts.seller.key(),
        buyer:        ctx.accounts.buyer.key(),
        price,
        planet:       planet.asset,
        fee_lamports: fee,
        timestamp:    Clock::get()?.unix_timestamp,
    });

    Ok(())
}