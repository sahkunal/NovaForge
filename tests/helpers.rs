use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_pubkey::Pubkey;
use solana_signer::Signer;
use solana_account::Account;
use solana_instruction::Instruction;
use solana_transaction::Transaction;
use solana_instruction::AccountMeta;
use shared::{PlanetType, Rarity};
use borsh::BorshSerialize;
/*pub fn setup_svm() -> LiteSVM {
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(
        novaforge::ID.to_bytes(),
        "../target/deploy/novaforge.so",
    )
    .expect("failed to load novaforge.so");
    svm
}*/

pub fn fund(svm: &mut LiteSVM, pubkey: &Pubkey, lamports: u64) {
    svm.airdrop(pubkey, lamports).unwrap();
}

pub fn warp_time(svm: &mut LiteSVM, seconds: i64) {
    let mut clock = svm.get_sysvar::<solana_clock::Clock>();
    clock.unix_timestamp += seconds;
    svm.set_sysvar(&clock);
}

pub fn new_funded_keypair(svm: &mut LiteSVM) -> Keypair {
    let kp = Keypair::new();
    fund(svm, &kp.pubkey(), 10_000_000_000);
    kp
}

pub fn setup_svm() -> LiteSVM {
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(
        novaforge::ID.to_bytes(),
        "../target/deploy/novaforge.so",
    )
    .expect("failed to load novaforge.so");

    // load MPL-Core program
    svm.add_program_from_file(
        "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            .parse::<Pubkey>()
            .unwrap()
            .to_bytes(),
        "../target/deploy/mpl_core.so",
    )
    .expect("failed to load mpl_core.so");

    svm
}

pub fn create_mpl_core_asset(
    svm: &mut LiteSVM,
    owner: &Keypair,
    asset: &Keypair,
) {
    let mpl_core_id: Pubkey = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        .parse().unwrap();

    let name     = "NovaForge Planet";
    let uri      = "https://novaforge.io/metadata/1.json";
    let name_b   = name.as_bytes();
    let uri_b    = uri.as_bytes();

    let mut data: Vec<u8> = vec![];
    data.push(1u8);                                                      // Key::AssetV1
    data.extend_from_slice(&owner.pubkey().to_bytes());                  // owner
    data.push(0u8);                                                      // UpdateAuthority::None
    data.extend_from_slice(&(name_b.len() as u32).to_le_bytes());       // name len
    data.extend_from_slice(name_b);                                      // name
    data.extend_from_slice(&(uri_b.len() as u32).to_le_bytes());        // uri len
    data.extend_from_slice(uri_b);                                       // uri
    data.push(0u8);                                                      // seq: None

    let lamports = svm.minimum_balance_for_rent_exemption(data.len());

    svm.set_account(
        asset.pubkey().to_bytes().into(),
        Account {
            lamports,
            data,
            owner: mpl_core_id.to_bytes().into(),
            executable: false,
            rent_epoch: 0,
        },
    ).unwrap();
}

pub fn find_building_pda(planet: &Pubkey, slot: u8) -> Pubkey {
    Pubkey::find_program_address(
        &[
            b"building",
            &planet.to_bytes(),
            &[slot],
        ],
        &prog_id(),
    )
    .0
}

pub fn find_raid_pda(attacker_planet: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[
            b"raid",
            &attacker_planet.to_bytes(),
        ],
        &prog_id(),
    )
    .0
}

pub fn fetch_account<T: borsh::BorshDeserialize>(
    svm: &LiteSVM,
    address: &Pubkey,
) -> T {
    let account = svm
        .get_account(&address.to_bytes().into())
        .unwrap();

    borsh::BorshDeserialize::deserialize(&mut &account.data[8..])
        .unwrap()
}
pub fn create_planet(
    svm: &mut LiteSVM,
    owner: &Keypair,
    planet_type: PlanetType,
    rarity: Rarity,
) -> (Keypair, Pubkey) {
    let asset = Keypair::new();

    let planet_pda =
        find_planet_pda(&asset.pubkey());

    let mut data =
        discriminator("initialize_planet").to_vec();

    planet_type
        .serialize(&mut data)
        .unwrap();

    rarity
        .serialize(&mut data)
        .unwrap();

    send(
        svm,
        Instruction {
            program_id: prog_id().to_bytes().into(),
            accounts: vec![
                AccountMeta::new(
                    owner.pubkey().to_bytes().into(),
                    true,
                ),
                AccountMeta::new(
                    planet_pda.to_bytes().into(),
                    false,
                ),
                AccountMeta::new(
                    asset.pubkey().to_bytes().into(),
                    false,
                ),
                AccountMeta::new_readonly(
                    mpl_core_id().to_bytes().into(),
                    false,
                ),
                AccountMeta::new_readonly(
                    Pubkey::default().to_bytes().into(),
                    false,
                ),
            ],
            data,
        },
        owner,
    );

    create_mpl_core_asset(
        svm,
        owner,
        &asset,
    );

    send(
        svm,
        Instruction {
            program_id: prog_id().to_bytes().into(),
            accounts: vec![
                AccountMeta::new(
                    owner.pubkey().to_bytes().into(),
                    true,
                ),
                AccountMeta::new(
                    planet_pda.to_bytes().into(),
                    false,
                ),
            ],
            data: discriminator("colonize_planet").to_vec(),
        },
        owner,
    );

    (asset, planet_pda)
}
pub fn discriminator(name: &str) -> [u8; 8] {
    let preimage = format!("global:{}", name);
    let hash =
        solana_sha256_hasher::hashv(&[preimage.as_bytes()]);

    let mut disc = [0u8; 8];
    disc.copy_from_slice(&hash.as_ref()[..8]);
    disc
}
pub fn prog_id() -> Pubkey {
    Pubkey::from(novaforge::ID.to_bytes())
}
pub fn find_planet_pda(asset: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[b"planet", &asset.to_bytes()],
        &prog_id(),
    )
    .0
}
pub fn fetch_planet(
    svm: &LiteSVM,
    pda: &Pubkey,
) -> novaforge::state::Planet {
    let acc = svm
        .get_account(&pda.to_bytes().into())
        .unwrap();

    borsh::BorshDeserialize::deserialize(
        &mut &acc.data[8..],
    )
    .unwrap()
}
pub fn mpl_core_id() -> Pubkey {
    "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        .parse()
        .unwrap()
}

pub fn send(
    svm: &mut LiteSVM,
    ix: Instruction,
    payer: &Keypair,
) {
    svm.expire_blockhash();

    let bh = svm.latest_blockhash();

    let tx = Transaction::new_signed_with_payer(
        &[ix],
        Some(&payer.pubkey()),
        &[payer],
        bh,
    );

    svm.send_transaction(tx).unwrap();
}