contract;

dep event_platform;
use event_platform::*;

use std::{
    identity::Identity,
    contract_id::ContractId,
    storage::StorageMap,
    chain::auth::{AuthError, msg_sender},
    context::{call_frames::msg_asset_id, msg_amount, this_balance},
    result::Result,
};

storage {
    events: StorageMap<u64, Event> = StorageMap {},
    event_id_counter: u64 = 0,
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
        numOfRSVPs: 0
       };
 

       storage.events.insert(campaign_id, newEvent);
       storage.event_id_counter += 1;
       let mut selectedEvent = storage.events.get(storage.event_id_counter -1);
       return selectedEvent;
    }

    #[storage(read, write)]
    fn rsvp(eventId: u64) -> Event {
    //variables are immutable by default, so you need to use the mut keyword
    let mut selectedEvent = storage.events.get(eventId);
    if (eventId > storage.event_id_counter) {
        //if the user passes in an eventID that does not exist, return the first event
        let fallback = storage.events.get(0);
        return fallback;
    }
    //send the money from the msg_sender to the owner of the selected event
    selectedEvent.numOfRSVPs += 1;
    storage.events.insert(eventId, selectedEvent);
    return selectedEvent;
    }
}