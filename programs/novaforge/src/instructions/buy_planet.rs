use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::invoke,
    system_instruction,
};
use crate::{
    state::Planet,
    events::PlanetSold,
    errors::NovaForgeError,
};

use shared::constants::MARKETPLACE_FEE_BPS;

#[derive(Accounts)]
pub struct BuyPlanet<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller receives lamports
    #[account(mut)]
    pub seller: UncheckedAccount<'info>,

    /// CHECK: Protocol treasury receives fee
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = planet.owner == seller.key() @ NovaForgeError::Unauthorized,
        constraint = planet.listed @ NovaForgeError::Unauthorized,
    )]
    pub planet: Account<'info, Planet>,

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

    // Transfer to seller
// Transfer to seller
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
planet.owner  = ctx.accounts.buyer.key();
planet.listed = false;
planet.price  = 0;  
planet.colonized = false;
planet.last_claim_ts = Clock::get()?.unix_timestamp;

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