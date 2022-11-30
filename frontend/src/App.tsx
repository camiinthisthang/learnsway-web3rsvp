import React, { useEffect, useState } from "react";
import { Wallet } from "fuels";
import "./App.css";
import ConnectWalletButton from "./components/ConnectWalletButton";
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
// import { RsvpContractAbi__factory } from "./contracts";
// // The address of the contract deployed the Fuel testnet
// // const CONTRACT_ID = "0x32f10d6f296fbd07e16f24867a11aab9d979ad95f54b223efc0d5532360ef5e4";
// const CONTRACT_ID = "0xfca6afc9ccb9def9b0b61044eaf6e4600f00f60789b621ce91b58c577a069cde";
// //the private key from createWallet.js
// const WALLET_SECRET = "0x5ac6d72b42e6a558e50458956244185267976a0d602d8be50e3b60ade7e22b65"
// // Create a Wallet from given secretKey in this case
// // The one we configured at the chainConfig.json
// const wallet = new Wallet(WALLET_SECRET, "https://node-beta-1.fuel.network/graphql");
// // Connects out Contract instance to the deployed contract
// // address using the given wallet.
// const contract = RsvpContractAbi__factory.connect(CONTRACT_ID, wallet);

export default function App(){
  const [loading, setLoading] = useState(false);
  //-----------------------------------------------//
  //state variables to capture the selection of an existing event to RSVP to
  const [eventName, setEventName] = useState('');
  const [maxCap, setMaxCap] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [eventCreation, setEventCreation] = useState(false);
  const [rsvpConfirmed, setRSVPConfirmed] = useState(false);
  const [numOfRSVPs, setNumOfRSVPs] = useState(0);
  const [eventId, setEventId] = useState('');
  //-------------------------------------------------//
  //state variables to capture the creation of an event
  const [newEventName, setNewEventName] = useState('');
  const [newEventMax, setNewEventMax] = useState(0);
  const [newEventDeposit, setNewEventDeposit] = useState(0);
  const [newEventID, setNewEventID] = useState('')
  const [newEventRSVP, setNewEventRSVP] = useState(0);

  




  // useEffect(() => {
  //   // console.log('Wallet address', wallet.address.toString());
  //   // wallet.getBalances().then(balances => {
  //   //   const balancesFormatted = balances.map(balance => {
  //   //     return [balance.assetId, balance.amount.format()];
  //   //   });
  //   //   console.log('Wallet balances', balancesFormatted);
  //   });
  // }, []);

  async function rsvpToEvent(){
    setLoading(true);
    try {
      console.log('amount deposit', deposit);
      const { value, transactionResponse, transactionResult } = await contract.functions.rsvp(eventId).callParams({
        forward: [deposit]
        //variable outputs is when a transaction creates a new dynamic UTXO
        //for each transaction you do, you'll need another variable output
        //for now, you have to set it manually, but the TS team is working on an issue to set this automatically
      }).txParams({gasPrice: 1, variableOutputs: 1}).call();
      console.log("transactionResult", transactionResult);
      console.log("transactionResponse", transactionResponse);
      console.log("RSVP'd to the following event (value)", value);
      console.log("deposit value", value.deposit.toString());
      console.log("# of RSVPs", value.num_of_rsvps.toString());
      setNumOfRSVPs(value.num_of_rsvps.toNumber());
      setEventName(value.name.toString());
      setEventId(value.unique_id.toString());
      setMaxCap(value.max_capacity.toNumber());
      setDeposit(value.deposit.toNumber());
      //value.deposit.format()
      console.log("event name", value.name);
      console.log("event capacity", value.max_capacity.toString());
      console.log("eventID", value.unique_id.toString())
      setRSVPConfirmed(true);
      alert("rsvp successful")
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false)
    }
  }

  async function getEvent(id: any){
    const result = await contract.functions.get_event(id);
    return result;

  }

  async function createEvent(e: any){
    e.preventDefault();
    setLoading(true);
    try {
      console.log("creating event")
      const { value } = await contract.functions.create_event(newEventMax, newEventDeposit, newEventName).txParams({gasPrice: 1}).call(); 
      console.log("return of create event", value);
      console.log("deposit value", value.deposit.toString());
      console.log("event name", value.name);
      console.log("event capacity", value.max_capacity.toString());
      console.log("eventID", value.unique_id.toString())
      //pass this unique ID to the getLatest
      setNewEventID(value.unique_id.toString())
      //setEventId(value.uniqueId.toString())
      setEventCreation(true);
      alert('Event created');
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false);
    }
  }
return (
  <div className="main">
    <header className="header">
      Building on Fuel with Sway - Web3RSVP
      <ConnectWalletButton/>
      </header>
      <div className="form">
        <h2>Create Your Event Today!</h2>
        
        <form id="createEventForm" onSubmit={createEvent}>
          <label className="label">Event Name</label>
          <input className="input" value = {newEventName} onChange={e => setNewEventName(e.target.value) }name="eventName" type="text" placeholder="Enter event name" />
          <label className="label">Max Cap</label>
          <input className="input" value = {newEventMax} onChange={e => setNewEventMax(+e.target.value)} name="maxCapacity" type="text" placeholder="Enter max capacity" />
          <label className="label">Deposit</label>
          <input className="input" value = {newEventDeposit} onChange={e => setNewEventDeposit(+e.target.value)} name="price" type="number" placeholder="Enter price" />
          <button className="button" disabled={loading}>
            {loading ? "creating..." : "create"}
          </button>
        </form>
      </div>
      <div className="form rsvp">
        <h2>RSVP to an Event</h2>
        <label className="label">Event Id</label>
        <input className="input" name="eventId" onChange={e => setEventId(e.target.value)} placeholder="pass in the eventID"/>
        <button className="button" onClick={rsvpToEvent}>RSVP</button>
      </div>
      <div className="results">
        <div className="card">
          {eventCreation &&
          <>
          <h1> New event created</h1>
          <h2> Event Name: {newEventName} </h2>
          <h2> Event ID: {newEventID}</h2>
          <h2>Max capacity: {newEventMax}</h2>
          <h2>Deposit: {newEventDeposit}</h2>
          <h2>Num of RSVPs: {newEventRSVP}</h2>d
          </>
          }
        </div>
          {rsvpConfirmed && <>
          <div className="card">
            <h1>RSVP Confirmed to the following event: {eventName}</h1>
            <h2>Num of RSVPs: {numOfRSVPs}</h2>
          </div>
          </>}
      </div>
  </div>

);
}
