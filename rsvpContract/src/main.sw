contract;

dep event_platform;
use event_platform::*;

use std::{
    identity::Identity,
    constants::BASE_ASSET_ID,
    contract_id::ContractId,
    storage::StorageMap,
    chain::auth::{AuthError, msg_sender},
    context::{call_frames::msg_asset_id, msg_amount, this_balance},
    result::Result,
    token::transfer,
};

storage {
    events: StorageMap<u64, Event> = StorageMap {},
    event_id_counter: u64 = 0,
}

pub enum InvalidRSVPError {
    IncorrectAssetId: (),
    NotEnoughTokens: (),
    InvalidEventID: (),
}

impl eventPlatform for Contract{
    #[storage(read, write)]
    fn create_event(capacity: u64, price: u64, eventName: str[10]) -> Event {
       let campaign_id = storage.event_id_counter;
       let newEvent = Event {
        uniqueId: campaign_id,
        maxCapacity: capacity,
        deposit: price,
        owner: msg_sender().unwrap(),
        name: eventName,
        numOfRSVPs: 0,
       };
 

       storage.events.insert(campaign_id, newEvent);
       storage.event_id_counter += 1;
       let mut selectedEvent = storage.events.get(storage.event_id_counter -1);
       return selectedEvent;
    }

    #[storage(read, write)]
    fn rsvp(eventId: u64) -> Event {
    let sender = msg_sender().unwrap();
    let asset_id = msg_asset_id();
    let amount = msg_amount();

     // get the event
    let mut selectedEvent = storage.events.get(eventId);

    // check to see if the eventId is greater than storage.event_id_counter, if
    // it is, revert
    require(selectedEvent.uniqueId < storage.event_id_counter, InvalidRSVPError::InvalidEventID);
 
    // check to see if the asset_id and amounts are correct, etc, if they aren't revert
    require(asset_id == BASE_ASSET_ID, InvalidRSVPError::IncorrectAssetId);
    require(amount >= selectedEvent.deposit, InvalidRSVPError::NotEnoughTokens);
    
    //send the payout
    transfer(selectedEvent.deposit, asset_id, selectedEvent.owner);

    // edit the event
    selectedEvent.numOfRSVPs += 1;
    storage.events.insert(eventId, selectedEvent);

    // return the event
    return selectedEvent;
}
}