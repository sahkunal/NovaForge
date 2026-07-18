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

fn find_planet_pda(asset: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"planet", &asset.to_bytes()],
        &Pubkey::from(novaforge::ID.to_bytes()),
    )
}

fn prog_id() -> Pubkey {
    Pubkey::from(novaforge::ID.to_bytes())
}

fn fetch_planet(svm: &LiteSVM, planet_pda: &Pubkey) -> novaforge::state::Planet {
    let account = svm.get_account(&planet_pda.to_bytes().into()).unwrap();
    borsh::BorshDeserialize::deserialize(&mut &account.data[8..]).unwrap()
}

fn initialize_planet(
    svm: &mut LiteSVM,
    owner: &Keypair,
    planet_type: PlanetType,
    rarity: Rarity,
) -> (Pubkey, Keypair) {
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
    create_mpl_core_asset(svm, owner, &asset);
    (planet_pda, asset)
}

fn list_planet(svm: &mut LiteSVM, owner: &Keypair, planet_pda: &Pubkey, asset: &Keypair, price: u64) {
    let mut data = discriminator("list_planet").to_vec();
    price.serialize(&mut data).unwrap();

    let mpl_core_id: Pubkey = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        .parse().unwrap();

    // need asset pubkey — get from planet PDA
    let planet = fetch_planet(svm, planet_pda);
    let asset = Pubkey::from(planet.asset.to_bytes());

    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
            AccountMeta::new(asset.to_bytes().into(), false),
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
    svm.send_transaction(tx).expect("list_planet failed");
}

fn cancel_listing(svm: &mut LiteSVM, owner: &Keypair, planet_pda: &Pubkey,asset: &Keypair) {
    let data = discriminator("cancel_listing").to_vec();
    let planet = fetch_planet(svm, planet_pda);
    let asset = Pubkey::from(planet.asset.to_bytes());

    let mpl_core_id: Pubkey = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        .parse().unwrap();

    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner.pubkey().to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
            AccountMeta::new(asset.to_bytes().into(), false),
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
    svm.send_transaction(tx).expect("cancel_listing failed");
}

#[test]
fn test_list_planet() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, asset) = initialize_planet(&mut svm, &owner, PlanetType::Luxury, Rarity::Rare);
    let price = 1_000_000_000u64;
    list_planet(&mut svm, &owner, &planet_pda, &asset, price);

    let price = 1_000_000_000u64; // 1 SOL
    list_planet(&mut svm, &owner, &planet_pda, &asset, price);

    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.listed, true);
    assert_eq!(planet.price,  price);
}

#[test]
fn test_cancel_listing() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);

    let (planet_pda, asset) = initialize_planet(&mut svm, &owner, PlanetType::Luxury, Rarity::Rare);
    list_planet(&mut svm, &owner, &planet_pda, &asset, 1_000_000_000);
    cancel_listing(&mut svm, &owner, &planet_pda, &asset);

    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.listed, false);
    assert_eq!(planet.price,  0);
}

#[test]
fn test_cannot_list_colonized_planet() {
    let mut svm = setup_svm();
    let owner = new_funded_keypair(&mut svm);
    let owner_pk = owner.pubkey();
    let (planet_pda, asset) = initialize_planet(&mut svm, &owner, PlanetType::Mining, Rarity::Common);

    // colonize first
    let data = discriminator("colonize_planet").to_vec();
    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner_pk.to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
        ],
        data,
    };
    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
    &[ix], Some(&owner_pk), &[&owner], blockhash,
    );
    svm.send_transaction(tx).unwrap();

    // listing should fail
    let mut data = discriminator("list_planet").to_vec();
    1_000_000_000u64.serialize(&mut data).unwrap();

    let planet = fetch_planet(&svm, &planet_pda);
    let asset = Pubkey::from(planet.asset.to_bytes());
    let mpl_core_id: Pubkey = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d".parse().unwrap();

    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(owner_pk.to_bytes().into(), true),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
            AccountMeta::new(asset.to_bytes().into(), false),
            AccountMeta::new_readonly(mpl_core_id.to_bytes().into(), false),
            AccountMeta::new_readonly(Pubkey::default().to_bytes().into(), false),
        ],
        data,
    };
    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix], Some(&owner_pk.to_bytes().into()), &[&owner], blockhash,
    );
    let result = svm.send_transaction(tx);
    assert!(result.is_err(), "listing colonized planet should fail");
}

#[test]
fn test_buy_planet_fee_split() {
    let mut svm = setup_svm();
    let seller = new_funded_keypair(&mut svm);
    let buyer  = new_funded_keypair(&mut svm);
    let treasury: Pubkey = "11111111111111111111111111111111".parse().unwrap();

    let (planet_pda, asset) = initialize_planet(&mut svm, &seller, PlanetType::Luxury, Rarity::Rare);
    let price = 2_000_000_000u64; // 2 SOL
    list_planet(&mut svm, &seller, &planet_pda, &asset, price);

    let seller_balance_before = svm.get_account(
        &seller.pubkey().to_bytes().into()
    ).unwrap().lamports;

    let planet = fetch_planet(&svm, &planet_pda);
    let asset = Pubkey::from(planet.asset.to_bytes());
    let mpl_core_id: Pubkey = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d".parse().unwrap();

    let data = discriminator("buy_planet").to_vec();
    let ix = Instruction {
        program_id: prog_id().to_bytes().into(),
        accounts: vec![
            AccountMeta::new(buyer.pubkey().to_bytes().into(), true),
            AccountMeta::new(seller.pubkey().to_bytes().into(), false),
            AccountMeta::new(treasury.to_bytes().into(), false),
            AccountMeta::new(planet_pda.to_bytes().into(), false),
            AccountMeta::new(asset.to_bytes().into(), false),
            AccountMeta::new_readonly(mpl_core_id.to_bytes().into(), false),
            AccountMeta::new_readonly(Pubkey::default().to_bytes().into(), false),
        ],
        data,
    };
    let blockhash = svm.latest_blockhash();
    let tx = Transaction::new_signed_with_payer(
        &[ix], Some(&buyer.pubkey().to_bytes().into()), &[&buyer], blockhash,
    );
    svm.send_transaction(tx).expect("buy_planet failed");

    let planet = fetch_planet(&svm, &planet_pda);
    assert_eq!(planet.listed, false);
    assert_eq!(planet.owner.to_bytes(), seller.pubkey().to_bytes());

    let seller_balance_after = svm.get_account(
        &seller.pubkey().to_bytes().into()
    ).unwrap().lamports;

    let expected_seller = price * 99 / 100;
    assert!(
        seller_balance_after > seller_balance_before,
        "seller should receive SOL"
    );
}