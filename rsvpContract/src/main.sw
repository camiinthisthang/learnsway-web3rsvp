contract;

dep event_platform;
use event_platform::*;

use std::{
   auth::msg_sender,
   constants::BASE_ASSET_ID,
   call_frames::msg_asset_id,
   context::{
       this_balance,
       msg_amount,
   },
   contract_id::ContractId,
   logging::log,
   result::Result,
   token::transfer,
};

storage {
    events: StorageMap<u64, Event> = StorageMap {},
    event_id_counter: u64 = 0,
}

pub enum InvalidRSVPError {
    IncorrectAssetId: ContractId,
    NotEnoughTokens: u64,
    InvalidEventID: Identity,
}

impl eventPlatform for Contract {
    #[storage(read, write)]
    fn create_event(capacity: u64, price: u64, event_name: str[10]) -> Event {
        let campaign_id = storage.event_id_counter;
        let new_event = Event {
            unique_id: campaign_id,
            max_capacity: capacity,
            deposit: price,
            owner: msg_sender().unwrap(),
            name: event_name,
            num_of_rsvps: 0,
        };

        storage.events.insert(campaign_id, new_event);
        storage.event_id_counter += 1;
        let mut selected_event: Option<Event> = storage.events.get(storage.event_id_counter - 1);
        selected_event.unwrap_or(new_event)
    }

    #[storage(read, write, payable)]
    fn rsvp(event_id: u64) -> Event {
        let sender = msg_sender().unwrap();
        let asset_id = msg_asset_id();
        let amount = msg_amount();

     // get the event
        let mut selected_event = storage.events.get(event_id).unwrap();

    // check to see if the eventId is greater than storage.event_id_counter, if
    // it is, revert
        require(selected_event.unique_id < storage.event_id_counter, InvalidRSVPError::InvalidEventID(sender));
        // log(0);
    // check to see if the asset_id and amounts are correct, etc, if they aren't revert
        require(asset_id == BASE_ASSET_ID, InvalidRSVPError::IncorrectAssetId(asset_id));
        // log(1);
        require(amount >= selected_event.deposit, InvalidRSVPError::NotEnoughTokens(amount));
        // log(2);
    //send the payout
        transfer(amount, asset_id, selected_event.owner);

    // edit the event
        selected_event.num_of_rsvps += 1;
        storage.events.insert(event_id, selected_event);

    // return the event
        return selected_event;
    }

    #[storage(read)]
    fn get_rsvp(event_id: u64) -> Event {
        let selected_event = storage.events.get(event_id).unwrap();
        return selected_event;
    }
}
