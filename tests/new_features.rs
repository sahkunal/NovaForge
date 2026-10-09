use litesvm::LiteSVM;
use solana_keypair::Keypair;
use anchor_lang::prelude::Pubkey;
use solana_signer::Signer;
use solana_instruction::{AccountMeta, Instruction};
use borsh::{BorshDeserialize, BorshSerialize};

use shared::{PlanetType, Rarity};

use novaforge::state::{
    Building,
    BuildingType,
    Raid,
    RaidStatus,
};

mod helpers;
use helpers::*;

fn keypair_pubkey(keypair: &Keypair) -> Pubkey {
    Pubkey::new_from_array(keypair.pubkey().to_bytes())
}

#[test]
fn test_building_lifecycle() {
    let mut svm = setup_svm();

    let owner = new_funded_keypair(&mut svm);

    // --------------------------------------------------
    // Create planet
    // --------------------------------------------------

    let asset = Keypair::new();

    let planet_pda = find_planet_pda(&asset.pubkey());

    let mut data = discriminator("initialize_planet").to_vec();

    PlanetType::Mining
        .serialize(&mut data)
        .unwrap();

    Rarity::Rare
        .serialize(&mut data)
        .unwrap();

    send(
        &mut svm,
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
        &owner,
    );

    create_mpl_core_asset(
        &mut svm,
        &owner,
        &asset,
    );

    // --------------------------------------------------
    // Colonize
    // --------------------------------------------------

    send(
        &mut svm,
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
        &owner,
    );

    // Claim enough resources
    warp_time(&mut svm, 86_400);

    send(
        &mut svm,
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
            data: discriminator("claim_resources").to_vec(),
        },
        &owner,
    );

    let planet_before = fetch_planet(
        &svm,
        &planet_pda,
    );

    // --------------------------------------------------
    // Build Turret in slot 0
    // --------------------------------------------------

    let slot = 0u8;

    let building_pda =
        find_building_pda(&planet_pda, slot);

    let mut data =
        discriminator("build_building").to_vec();

    slot.serialize(&mut data).unwrap();

    BuildingType::Turret
        .serialize(&mut data)
        .unwrap();

    let iron_before = planet_before.iron_balance;
    let gold_before = planet_before.gold_balance;
    let uranium_before = planet_before.uranium_balance;

    send(
        &mut svm,
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
                    building_pda.to_bytes().into(),
                    false,
                ),
                AccountMeta::new_readonly(
                    Pubkey::default().to_bytes().into(),
                    false,
                ),
            ],
            data,
        },
        &owner,
    );

    let building: Building =
        fetch_account(&svm, &building_pda);

   assert_eq!(
    building.planet,
    Pubkey::new_from_array(planet_pda.to_bytes())
);

    assert_eq!(
        building.slot,
        0
    );

    assert_eq!(
        building.building_type,
        BuildingType::Turret
    );

    assert_eq!(
        building.level,
        1
    );

    assert_eq!(
        building.health,
        building.max_health
    );

    assert!(
        building.active
    );

    let planet_after_build =
        fetch_planet(&svm, &planet_pda);

    assert!(
        planet_after_build.iron_balance < iron_before
    );

    assert!(
        planet_after_build.gold_balance < gold_before
    );

    assert!(
        planet_after_build.uranium_balance < uranium_before
    );

    println!("✅ Build Turret");

    // --------------------------------------------------
    // Upgrade Turret
    // --------------------------------------------------

    let mut data =
        discriminator("upgrade_building").to_vec();

    send(
        &mut svm,
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
                    building_pda.to_bytes().into(),
                    false,
                ),
            ],
            data,
        },
        &owner,
    );

    let building: Building =
        fetch_account(&svm, &building_pda);

    assert_eq!(
        building.level,
        2
    );

    assert!(
        building.max_health > 350
    );

    println!("✅ Upgrade Turret");

    let mut account = svm
        .get_account(&building_pda.to_bytes().into())
        .unwrap();

    let mut damaged =
        building.clone();

    damaged.health =
        damaged.max_health / 2;

    let mut encoded = Vec::new();

    damaged.serialize(&mut encoded)
        .unwrap();

    account.data.truncate(8);
    account.data.extend_from_slice(&encoded);

    svm.set_account(
        building_pda.to_bytes().into(),
        account,
    )
    .unwrap();

    let damaged_building: Building =
        fetch_account(&svm, &building_pda);

    assert!(
        damaged_building.health
            < damaged_building.max_health
    );

    // --------------------------------------------------
    // Repair
    // --------------------------------------------------

    send(
        &mut svm,
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
                    building_pda.to_bytes().into(),
                    false,
                ),
            ],
            data: discriminator("repair_building").to_vec(),
        },
        &owner,
    );

    let repaired: Building =
        fetch_account(&svm, &building_pda);

    assert_eq!(
        repaired.health,
        repaired.max_health
    );

    assert!(
        repaired.active
    );

    println!("✅ Repair Turret");

    println!("✅ Building lifecycle complete");
}
#[test]
fn test_pvp_raid() {
    let mut svm = setup_svm();

    let attacker = new_funded_keypair(&mut svm);
    let defender = new_funded_keypair(&mut svm);

    let (_attacker_asset, attacker_planet) =
        create_planet(
            &mut svm,
            &attacker,
            PlanetType::Mining,
            Rarity::Rare,
        );

    let (_defender_asset, defender_planet) =
        create_planet(
            &mut svm,
            &defender,
            PlanetType::Mining,
            Rarity::Rare,
        );

    // Give attacker military power.
    warp_time(&mut svm, 86_400);

    send(
        &mut svm,
        Instruction {
            program_id: prog_id().to_bytes().into(),
            accounts: vec![
                AccountMeta::new(
                    attacker.pubkey().to_bytes().into(),
                    true,
                ),
                AccountMeta::new(
                    attacker_planet.to_bytes().into(),
                    false,
                ),
            ],
            data: discriminator("claim_resources").to_vec(),
        },
        &attacker,
    );

    send(
        &mut svm,
        Instruction {
            program_id: prog_id().to_bytes().into(),
            accounts: vec![
                AccountMeta::new(
                    attacker.pubkey().to_bytes().into(),
                    true,
                ),
                AccountMeta::new(
                    attacker_planet.to_bytes().into(),
                    false,
                ),
            ],
            data: discriminator("upgrade_military").to_vec(),
        },
        &attacker,
    );

    // --------------------------------------------------
    // Launch raid
    // --------------------------------------------------

    let raid_pda =
        find_raid_pda(&attacker_planet);

    send(
        &mut svm,
        Instruction {
            program_id: prog_id().to_bytes().into(),
            accounts: vec![
                AccountMeta::new(
                    attacker.pubkey().to_bytes().into(),
                    true,
                ),
                AccountMeta::new(
                    attacker_planet.to_bytes().into(),
                    false,
                ),
                AccountMeta::new(
                    defender_planet.to_bytes().into(),
                    false,
                ),
                AccountMeta::new(
                    raid_pda.to_bytes().into(),
                    false,
                ),
                AccountMeta::new_readonly(
                    Pubkey::default().to_bytes().into(),
                    false,
                ),
            ],
            data: discriminator("launch_raid").to_vec(),
        },
        &attacker,
    );

    let raid: Raid =
        fetch_account(&svm, &raid_pda);

   assert_eq!(raid.attacker, keypair_pubkey(&attacker));
assert_eq!(raid.defender, keypair_pubkey(&defender));

assert_eq!(
    raid.attacker_planet,
    Pubkey::new_from_array(attacker_planet.to_bytes())
);

assert_eq!(
    raid.target_planet,
    Pubkey::new_from_array(defender_planet.to_bytes())
);
    assert_eq!(
        raid.status,
        RaidStatus::InProgress
    );

    assert!(
        raid.resolve_at > raid.started_at
    );

    println!("✅ Raid launched");

    // --------------------------------------------------
    // Resolve too early
    // --------------------------------------------------

    let mut resolve_data =
        discriminator("resolve_raid").to_vec();

    let result = std::panic::catch_unwind(
        std::panic::AssertUnwindSafe(|| {
            send(
                &mut svm,
                Instruction {
                    program_id:
                        prog_id().to_bytes().into(),
                    accounts: vec![
                        AccountMeta::new(
                            attacker
                                .pubkey()
                                .to_bytes()
                                .into(),
                            true,
                        ),
                        AccountMeta::new(
                            attacker_planet
                                .to_bytes()
                                .into(),
                            false,
                        ),
                        AccountMeta::new(
                            defender_planet
                                .to_bytes()
                                .into(),
                            false,
                        ),
                        AccountMeta::new(
                            raid_pda
                                .to_bytes()
                                .into(),
                            false,
                        ),

                        // Battle report PDA.
                        AccountMeta::new(
                            Pubkey::default()
                                .to_bytes()
                                .into(),
                            false,
                        ),

                        AccountMeta::new_readonly(
                            Pubkey::default()
                                .to_bytes()
                                .into(),
                            false,
                        ),
                    ],
                    data: resolve_data.clone(),
                },
                &attacker,
            );
        }),
    );

    assert!(
        result.is_err()
    );

    println!("✅ Raid cannot resolve early");

    // --------------------------------------------------
    // Wait for raid
    // --------------------------------------------------

    warp_time(&mut svm, 61);

    // --------------------------------------------------
    // Resolve
    // --------------------------------------------------

    // We need the actual BattleReport PDA.
    let raid: Raid =
    fetch_account(&svm, &raid_pda);

let attacker_planet_bytes = attacker_planet.to_bytes();
let started_at_bytes = raid.started_at.to_le_bytes();

let program_id = Pubkey::new_from_array(prog_id().to_bytes());

let (battle_report_pda, _) = Pubkey::find_program_address(
    &[
        b"battle_report".as_ref(),
        attacker_planet_bytes.as_ref(),
        started_at_bytes.as_ref(),
    ],
    &program_id,
);

    send(
        &mut svm,
        Instruction {
            program_id:
                prog_id().to_bytes().into(),

            accounts: vec![
                AccountMeta::new(
                    attacker
                        .pubkey()
                        .to_bytes()
                        .into(),
                    true,
                ),
                AccountMeta::new(
                    attacker_planet
                        .to_bytes()
                        .into(),
                    false,
                ),
                AccountMeta::new(
                    defender_planet
                        .to_bytes()
                        .into(),
                    false,
                ),
                AccountMeta::new(
                    raid_pda
                        .to_bytes()
                        .into(),
                    false,
                ),
                AccountMeta::new(
                    battle_report_pda
                        .to_bytes()
                        .into(),
                    false,
                ),
                AccountMeta::new_readonly(
                    Pubkey::default()
                        .to_bytes()
                        .into(),
                    false,
                ),
            ],

            data: resolve_data,

        },
        &attacker,
    );

    let resolved: Raid =
        fetch_account(&svm, &raid_pda);

    assert!(
        resolved.status
            != RaidStatus::InProgress
    );

    println!(
        "✅ Raid resolved: {:?}",
        resolved.status
    );
}