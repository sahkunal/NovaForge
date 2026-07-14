use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_pubkey::Pubkey;
use solana_signer::Signer;

pub fn setup_svm() -> LiteSVM {
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(
        novaforge::ID.to_bytes().into(),
        "../target/deploy/novaforge.so",
    )
    .expect("failed to load novaforge.so — run anchor build --no-idl first");
    svm
}

pub fn fund(svm: &mut LiteSVM, pubkey: &Pubkey, lamports: u64) {
    svm.airdrop(pubkey, lamports).unwrap();
}

pub fn warp_time(svm: &mut LiteSVM, seconds: i64) {
    let mut clock = svm.get_sysvar::<anchor_lang::prelude::Clock>();
    clock.unix_timestamp += seconds;
    svm.set_sysvar(&clock);
}

pub fn new_funded_keypair(svm: &mut LiteSVM) -> Keypair {
    let kp = Keypair::new();
    fund(svm, &kp.pubkey(), 10_000_000_000);
    kp
}