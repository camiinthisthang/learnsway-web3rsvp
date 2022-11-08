use fuels::{prelude::*, tx::ContractId};

// Load abi from json
abigen!(MyContract, "out/debug/rsvpContract-abi.json");

async fn get_contract_instance() -> (MyContract, ContractId, Vec<WalletUnlocked>) {
    // Launch a local network and deploy the contract
    let mut wallets = launch_custom_provider_and_get_wallets(
        WalletsConfig::new(
            Some(4),             /* Single wallet */
            Some(1),             /* Single coin (UTXO) */
            Some(1_000_000_000), /* Amount per coin */
        ),
        None,
    )
    .await;
    let wallet = wallets.pop().unwrap();

    let id = Contract::deploy(
        "./out/debug/rsvpContract.bin",
        &wallet,
        TxParameters::default(),
        StorageConfiguration::with_storage_path(Some(
            "./out/debug/rsvpContract-storage_slots.json".to_string(),
        )),
    )
    .await
    .unwrap();

    let instance = MyContractBuilder::new(id.to_string(), wallet).build();

    (instance, id.into(), wallets)
}

#[tokio::test]
async fn can_get_contract_id() {
    let (_instance, _id , wallets) = get_contract_instance().await;
    
    let wallet_1 = wallets.get(0).unwrap();
    // println!("WALLET_1: {:?}", wallet_1);
    let wallet_2 = wallets.get(1).unwrap();
    // println!("WALLET_2: {:?}", wallet_2);
    let wallet_3 = wallets.get(2).unwrap();
    // println!("WALLET_3: {:?}", wallet_3);

    let capacity: u64 = 10;
    let price: u64 = 1;
    let event_name: fuels::core::types::SizedAsciiString<10> = "abcde12345".try_into().expect("Should have succeeded");


    // Now you have an instance of your contract you can use to test each function
}
