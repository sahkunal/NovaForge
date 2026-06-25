pub fn calculate_resources(
    rate: u64,
    elapsed_seconds: i64,
) -> u64 {

    (rate * elapsed_seconds as u64)
        / 3600
}

pub fn upgrade_cost(
    level: u16,
) -> (u64, u64) {

    let iron =
        100 * level as u64;

    let gold =
        20 * level as u64;

    (iron, gold)
}