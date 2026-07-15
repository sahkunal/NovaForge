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

fn discriminator(name: &str) -> [u8; 8] {
    use std::io::Write;
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

fn initialize_planet(
    svm: &mut LiteSVM,
    owner: &Keypair,
    planet_type: PlanetType,
    rarity: Rarity,
) -> (Pubkey, Pubkey) {
    let asset = Keypair::new();
    let (planet_pda, _) = find_planet_pda(&asset.pubkey());
    let prog_id = Pubkey::from(novaforge::ID.to_bytes());

    // build instruction data: discriminator + borsh args
    let mut data = discriminator("initialize_planet").to_vec();
    planet_type.serialize(&mut data).unwrap();
    rarity.serialize(&mut data).unwrap();

    let mpl_core_id: Pubkey = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        .parse().unwrap();

    let ix = Instruction {
        program_id: prog_id.to_bytes().into(),
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

#[test]
fn test_program_loads() {
    let _svm = setup_svm();
}

#[test]
fn test_initialize_planet_mining() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, _) = initialize_planet(
        &mut svm,
        &owner,
        PlanetType::Mining,
        Rarity::Common,
    );

    let account = svm.get_account(&planet_pda.to_bytes().into()).unwrap();
    // skip 8-byte anchor discriminator then borsh decode
    let planet: novaforge::state::Planet =
        borsh::BorshDeserialize::deserialize(&mut &account.data[8..])
        .unwrap();

    assert_eq!(planet.level,          1);
    assert_eq!(planet.military_power, 0);
    assert_eq!(planet.colonized,      false);
    assert_eq!(planet.iron_balance,   0);
    assert_eq!(planet.planet_type,    PlanetType::Mining);
    assert!(planet.production_rate    > 0);
}