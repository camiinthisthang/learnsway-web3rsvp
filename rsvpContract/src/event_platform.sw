library event_platform;

use std::{
    identity::Identity,
    contract_id::ContractId,
};

abi eventPlatform {
    #[storage(read, write)]
    fn create_event(maxCapacity: u64, deposit: u64, eventName: str[10]) -> Event;

    #[storage(read, write)]
    fn rsvp(eventId: u64) -> Event;
}

// defining the struct here because it would be used by other developers who would be importing this ABI
pub struct Event {
    uniqueId: u64,
    maxCapacity: u64, 
    deposit: u64, 
    owner: Identity,
    name: str[10],
    numOfRSVPs: u64,
}

