use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_pubkey::Pubkey;
use solana_signer::Signer;
use solana_account::Account;

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