use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_pubkey::Pubkey;
use solana_signer::Signer;
use solana_transaction::Transaction;
use solana_instruction::{Instruction, AccountMeta};
use shared::{PlanetType, Rarity};
use borsh::BorshSerialize;

mod helpers;
use helpers::*;

// reuse from planet.rs
fn discriminator(name: &str) -> [u8; 8] {
    let preimage = format!("global:{}", name);
    let hash = solana_sha256_hasher::hashv(&[preimage.as_bytes()]);
    let mut disc = [0u8; 8];
    disc.copy_from_slice(&hash.as_ref()[..8]);
    disc
}

fn find_planet_pda(asset: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"planet", &asset.to_bytes()],
        &Pubkey::from(novaforge::ID.to_bytes()),
    )
}

fn prog_id() -> Pubkey {
    Pubkey::from(novaforge::ID.to_bytes())
}

fn initialize_planet(
    svm: &mut LiteSVM,
    owner: &Keypair,
    planet_type: PlanetType,
    rarity: Rarity,
) -> (Pubkey, Pubkey) {
    let asset = Keypair::new();
    let (planet_pda, _) = find_planet_pda(&asset.pubkey());

    let mut data = discriminator("initialize_planet").to_vec();
    planet_type.serialize(&mut data).unwrap();
    rarity.serialize(&mut data).unwrap();

    let mpl_core_id: Pubkey = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        .parse().unwrap();

    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
            AccountMeta::new(asset.pubkey().to_bytes().into(), false),
            AccountMeta::new_readonly(mpl_core_id.to_bytes().into(), false),
            AccountMeta::new_readonly(Pubkey::default().to_bytes().into(), false),
        ],
        data,
    };

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&owner.pubkey().to_bytes().into()),
        &[owner],
        blockhash,
    );
    svm.send_transaction(tx).expect("initialize_planet failed");
    (planet_pda, asset.pubkey())
}

fn colonize_planet(svm: &mut LiteSVM, owner: &Keypair, planet_pda: &Pubkey) {
    let mut data = discriminator("colonize_planet").to_vec();

    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data,
    };

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&owner.pubkey().to_bytes().into()),
        &[owner],
        blockhash,
    );
    svm.send_transaction(tx).expect("colonize_planet failed");
}

fn claim_resources(svm: &mut LiteSVM, owner: &Keypair, planet_pda: &Pubkey) {
    let data = discriminator("claim_resources").to_vec();

    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data,
    };

    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&owner.pubkey().to_bytes().into()),
        &[owner],
        blockhash,
    );
    svm.send_transaction(tx).expect("claim_resources failed");
}

fn fetch_planet(svm: &LiteSVM, planet_pda: &Pubkey) -> novaforge::state::Planet {
    let account = svm.get_account(&planet_pda.to_bytes().into()).unwrap();
    borsh::BorshDeserialize::deserialize(&mut &account.data[8..]).unwrap()
}

#[test]
fn test_colonize_planet() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet(&mut svm, &owner, PlanetType::Mining, Rarity::Common);
    colonize_planet(&mut svm, &owner, &planet_pda);

    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.colonized, true);
   assert!(planet.colonized == true);
   assert_eq!(planet.last_claim_ts, 0);
}

#[test]
fn test_claim_resources_after_time() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet(&mut svm, &owner, PlanetType::Mining, Rarity::Common);
    colonize_planet(&mut svm, &owner, &planet_pda);

    // warp 2 hours
    warp_time(&mut svm, 7_200);
    claim_resources(&mut svm, &owner, &planet_pda);

    let planet = fetch_planet(&svm, &planet_pda);
    assert!(planet.iron_balance > 0, "iron should have been generated");
    assert_eq!(planet.threat_level, 0, "threat should reset after claim");
}

#[test]
fn test_storage_cap_enforced() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet(&mut svm, &owner, PlanetType::Mining, Rarity::Common);
    colonize_planet(&mut svm, &owner, &planet_pda);

    // warp 200 hours — way beyond 72h cap
    warp_time(&mut svm, 200 * 3600);
    claim_resources(&mut svm, &owner, &planet_pda);

    let planet = fetch_planet(&svm, &planet_pda);
    let max = planet.production_rate.saturating_mul(shared::constants::MAX_STORAGE_SECS);
    assert!(planet.iron_balance <= max, "balance should not exceed storage cap");
}

#[test]
fn test_threat_level_rises_with_time() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet(&mut svm, &owner, PlanetType::Mining, Rarity::Common);
    colonize_planet(&mut svm, &owner, &planet_pda);

    // warp 60 hours — Raider territory
    warp_time(&mut svm, 60 * 3600);
    claim_resources(&mut svm, &owner, &planet_pda);

    // resources should be reduced (monster attacked)
    let planet = fetch_planet(&svm, &planet_pda);
    // either monster killed or resources looted — either way threat resets
    assert_eq!(planet.threat_level, 0);
}

#[test]
fn test_uncolonize_flushes_rewards() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet(&mut svm, &owner, PlanetType::Mining, Rarity::Common);
    colonize_planet(&mut svm, &owner, &planet_pda);

    warp_time(&mut svm, 7_200); 

    // uncolonize
    let mut data = discriminator("uncolonize_planet").to_vec();
    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data,
    };
    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&owner.pubkey().to_bytes().into()),
        &[owner],
        blockhash,
    );
    svm.send_transaction(tx).expect("uncolonize failed");

    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.colonized, false);
assert!(planet.iron_balance > 0, "rewards should be flushed on uncolonize");
}
