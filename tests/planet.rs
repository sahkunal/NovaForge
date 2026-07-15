use anchor_lang::{InstructionData, ToAccountMetas};
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_message::Message;
use solana_pubkey::Pubkey;
use solana_signer::Signer;
use solana_transaction::Transaction;
use shared::{PlanetType, Rarity};

mod helpers;
use helpers::*;

fn initialize_planet_ix(
    svm: &mut LiteSVM,
    owner: &Keypair,
    planet_type: PlanetType,
    rarity: Rarity,
) -> (Pubkey, Pubkey) {
    let asset = Keypair::new();
    let (planet_pda, _bump) = Pubkey::find_program_address(
        &[b"planet", asset.pubkey().as_ref()],
        &novaforge::ID,
    );

    let accounts = novaforge::accounts::InitializePlanet {
        owner:            owner.pubkey(),
        planet:           planet_pda,
        asset:            asset.pubkey(),
        mpl_core_program: mpl_core::ID,
        system_program:   solana_pubkey::Pubkey::default(),
    }
    .to_account_metas(None);

    let data = novaforge::instruction::InitializePlanet {
        planet_type,
        rarity,
    }
    .data();

    let ix = solana_instruction::Instruction {
        program_id: novaforge::ID,
        accounts,
        data,
    };

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&owner.pubkey()),
        &[owner],
        blockhash,
    );

    svm.send_transaction(tx).unwrap();
    (planet_pda, asset.pubkey())
}

#[test]
fn test_program_loads() {
    let _svm = setup_svm();
}

#[test]
fn test_initialize_planet_mining() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet_ix(
        &mut svm,
        &owner,
        PlanetType::Mining,
        Rarity::Common,
    );

    // fetch planet account
    let account = svm.get_account(&planet_pda).unwrap();
    let planet: novaforge::state::Planet =
        anchor_lang::AccountDeserialize::try_deserialize(
            &mut account.data.as_slice(),
        )
        .unwrap();

    assert_eq!(planet.level,          1);
    assert_eq!(planet.military_power, 0);
    assert_eq!(planet.colonized,      false);
    assert_eq!(planet.iron_balance,   0);
    assert_eq!(planet.gold_balance,   0);
    assert_eq!(planet.uranium_balance,0);
    assert!(planet.production_rate    > 0);
}

#[test]
fn test_initialize_planet_military_type() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet_ix(
        &mut svm,
        &owner,
        PlanetType::Military,
        Rarity::Legendary,
    );

    let account = svm.get_account(&planet_pda).unwrap();
    let planet: novaforge::state::Planet =
        anchor_lang::AccountDeserialize::try_deserialize(
            &mut account.data.as_slice(),
        )
        .unwrap();

    assert_eq!(planet.planet_type, PlanetType::Military);
    assert_eq!(planet.rarity,      Rarity::Legendary);
    assert!(planet.production_rate > 0);
}