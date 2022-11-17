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

    let instance = MyContract::new(id.clone().to_string(), wallet);

    (instance, id.into(), wallets)
}

#[tokio::test]
async fn can_create_event_and_rsvp() {
    let (instance, _id , wallets) = get_contract_instance().await;

    // Now you have an instance of your contract you can use to test each function
    

    // we can access some wallets for testing
    let wallet_1 = wallets.get(0).unwrap();
    let wallet_2 = wallets.get(1).unwrap();
    // let wallet_3 = wallets.get(2).unwrap();

    // check the initial balances for the wallets
    let initial_balance_1: u64 = wallet_1.get_asset_balance(&BASE_ASSET_ID).await.unwrap();
    let initial_balance_2: u64 = wallet_2.get_asset_balance(&BASE_ASSET_ID).await.unwrap();

    println!("BALANCE 1: {:?}", initial_balance_1);
    println!("BALANCE 2: {:?}", initial_balance_2);

    // let's define some mock event details to use as paramenters for the create_event function
    let capacity: u64 = 10;
    let price: u64 = 25;
    let event_name: SizedAsciiString<10> = "sway_party".try_into().expect("Should have succeeded");


    // make the first event 
    let project_1 = instance
        .with_wallet(wallet_1.clone())
        .unwrap()
        .methods()
        .create_event(capacity, price, event_name.clone())
        .call()
        .await
        .unwrap();

    println!("PROJECT 1: {:?}", project_1.value);
    // make sure the project details are correct
    assert!(project_1.value.max_capacity == capacity);
    assert!(project_1.value.deposit == price);
    assert!(project_1.value.name == event_name);

       // Bytes representation of the asset ID of the "base" asset used for gas fees.
       pub const BASE_ASSET_ID: AssetId = AssetId::new([0u8; 32]);

       // call params to send the event price
       let call_params = CallParameters::new(Some(price), Some(BASE_ASSET_ID), None);


    // RSVP to the first project from wallet 2
    let project_1_copy = instance
        .with_wallet(wallet_2.clone())
        .unwrap()
        .methods()
        .rsvp(0)
        .append_variable_outputs(1)
        .call_params(call_params)
        .call()
        .await
        .unwrap();

        println!("PROJECT 1 Copy: {:?}", project_1_copy.value);
        //check if the num_of_rsvps is incremented
        assert!(project_1_copy.value.num_of_rsvps == 1);

        // check if the event owner received the price amount
        let new_balance_1 = wallet_1.get_asset_balance(&BASE_ASSET_ID).await.unwrap();
        let new_balance_2= wallet_2.get_asset_balance(&BASE_ASSET_ID).await.unwrap();

        println!("BALANCE 1: {:?}", new_balance_1);
        println!("BALANCE 2: {:?}", new_balance_2);

        assert!(new_balance_1 == initial_balance_1 + price);
        assert!(new_balance_2 == initial_balance_2 - price);

}
