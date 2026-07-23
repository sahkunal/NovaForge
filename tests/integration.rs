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
    let preimage = format!("global:{}", name);
    let hash = solana_sha256_hasher::hashv(&[preimage.as_bytes()]);
    let mut disc = [0u8; 8];
    disc.copy_from_slice(&hash.as_ref()[..8]);
    disc
}

fn find_planet_pda(asset: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[b"planet", &asset.to_bytes()],
        &Pubkey::from(novaforge::ID.to_bytes()),
    ).0
}

fn prog_id() -> Pubkey { Pubkey::from(novaforge::ID.to_bytes()) }

fn fetch_planet(svm: &LiteSVM, pda: &Pubkey) -> novaforge::state::Planet {
    let acc = svm.get_account(&pda.to_bytes().into()).unwrap();
    borsh::BorshDeserialize::deserialize(&mut &acc.data[8..]).unwrap()
}

fn mpl_core_id() -> Pubkey {
    "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d".parse().unwrap()
}

fn send(svm: &mut LiteSVM, ix: Instruction, payer: &Keypair) {
    svm.expire_blockhash();
    let bh = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix], Some(&payer.pubkey()), &[payer], bh,
    );
    svm.send_transaction(tx).unwrap();
}
#[test]
fn test_full_lifecycle() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    // 1. Mint
    let asset = Keypair::new();
    let planet_pda = find_planet_pda(&asset.pubkey());
    let mut data = discriminator("initialize_planet").to_vec();
    PlanetType::Mining.serialize(&mut data).unwrap();
    Rarity::Rare.serialize(&mut data).unwrap();
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
            AccountMeta::new(asset.pubkey().to_bytes().into(), false),
            AccountMeta::new_readonly(mpl_core_id().to_bytes().into(), false),
            AccountMeta::new_readonly(Pubkey::default().to_bytes().into(), false),
        ],
        data,
    }, &owner);
    create_mpl_core_asset(&mut svm, &owner, &asset);

    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.level, 1);
    assert_eq!(planet.colonized, false);
    println!("✅ Mint");

    // 2. Colonize
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data: discriminator("colonize_planet").to_vec(),
    }, &owner);
    assert_eq!(fetch_planet(&svm, &planet_pda).colonized, true);
    println!("✅ Colonize");

    // 3. Warp + Claim
    warp_time(&mut svm, 7_200);
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data: discriminator("claim_resources").to_vec(),
    }, &owner);
    let planet = fetch_planet(&svm, &planet_pda);
    assert!(planet.iron_balance > 0);
    println!("✅ Claim — iron: {}", planet.iron_balance);

    // 4. Upgrade military
    warp_time(&mut svm, 7_200);
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data: discriminator("claim_resources").to_vec(),
    }, &owner);
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data: discriminator("upgrade_military").to_vec(),
    }, &owner);
    let planet = fetch_planet(&svm, &planet_pda);
    assert!(planet.military_power > 0);
    println!("✅ Upgrade military — power: {}", planet.military_power);

    // 5. Upgrade planet
    warp_time(&mut svm, 86_400);
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data: discriminator("claim_resources").to_vec(),
    }, &owner);
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data: discriminator("upgrade_planet").to_vec(),
    }, &owner);
    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.level, 2);
    println!("✅ Upgrade planet — level: {}", planet.level);

    // 6. Uncolonize + List
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data: discriminator("uncolonize_planet").to_vec(),
    }, &owner);
    assert_eq!(fetch_planet(&svm, &planet_pda).colonized, false);
    println!("✅ Uncolonize");

    let mut data = discriminator("list_planet").to_vec();
    1_000_000_000u64.serialize(&mut data).unwrap();
    send(&mut svm, Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
            AccountMeta::new(asset.pubkey().to_bytes().into(), false),
            AccountMeta::new_readonly(mpl_core_id().to_bytes().into(), false),
            AccountMeta::new_readonly(Pubkey::default().to_bytes().into(), false),
        ],
        data,
    }, &owner);
    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.listed, true);
    assert_eq!(planet.price, 1_000_000_000);
    println!("✅ Listed — price: {} lamports", planet.price);

    println!("✅ Full lifecycle complete");
}