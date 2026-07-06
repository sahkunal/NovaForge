use anchor_lang::prelude::*;

use crate::state::Planet;

#[derive(Accounts)]
pub struct CheckThreat<'info> {

    pub planet: Account<'info, Planet>,
}

pub fn handler(
    _ctx: Context<CheckThreat>,
) -> Result<()> {
    Ok(())
}