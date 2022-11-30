extern crate alloc;
use fuel_indexer_macros::indexer;

#[indexer(manifest = "/Users/camiinthisthang/Desktop/Workspace/Fuel/learnsway-web3rsvp/indexer/rsvp-index/rsvp_index.manifest.yaml")]
pub mod rsvp_index_index_mod {

    fn rsvp_index_handler(event: Event) {

        let created_event = CreatedEvent {
            id: event.unique_id,
            event_id: event.unique_id, 
            max_capacity: event.max_capacity,
            deposit: event.deposit,
            owner: event.owner,
            rsvps: event.num_of_rsvps,

        };

        created_event.save();
    }

}
