library event_platform;

use std::{contract_id::ContractId, identity::Identity};

abi eventPlatform {
    #[storage(read, write)]
    fn create_event(max_capacity: u64, deposit: u64, event_name: str[10]) -> Event;

    #[storage(read, write)]
    fn rsvp(event_id: u64) -> Event;
}

// defining the struct here because it would be used by other developers who would be importing this ABI
pub struct Event {
    unique_id: u64,
    max_capacity: u64,
    deposit: u64,
    owner: Identity,
    name: str[10],
    num_of_rsvps: u64,
}