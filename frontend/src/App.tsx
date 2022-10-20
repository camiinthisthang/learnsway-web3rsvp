import React, { useEffect, useState } from "react";
import { Wallet } from "fuels";
import "./App.css";
// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { RsvpContractAbi__factory } from "./contracts";
// The address of the contract deployed the Fuel testnet
const CONTRACT_ID = "0x01858dacd9e6f63baa695e7d40e94205edd2796bebab79df7de80dcfae140fe7";
//the private key from createWallet.js
const WALLET_SECRET = "0x147205e81ce5a1ff4e222617db3c1877c9bf04047bb7b1b0cfb809957230da55"
// Create a Wallet from given secretKey in this case
// The one we configured at the chainConfig.json
const wallet = new Wallet(WALLET_SECRET, "https://node-beta-1.fuel.network/graphql");
// Connects out Contract instance to the deployed contract
// address using the given wallet.
const contract = RsvpContractAbi__factory.connect(CONTRACT_ID, wallet);

export default function App(){
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState('');
  const [eventName, setEventName] = useState('')
  const [maxCap, setMaxCap] = useState(0)
  const [deposit, setDeposit] = useState(0)
  const [eventCreation, setEventCreation] = useState(false);
  const [rsvpConfirmed, setRSVPConfirmed] = useState(false);
  const [numOfRSVPs, setNumOfRSVPs] = useState(0);

  useEffect(() => {
    console.log('Wallet address', wallet.address.toString());
    wallet.getBalances().then(balances => {
      const balancesFormatted = balances.map(balance => {
        return [balance.assetId, balance.amount.format()];
      });
      console.log('Wallet balances', balancesFormatted);
    });
  }, []);

  useEffect(() => {
    // Update the document title using the browser API
    console.log("eventName", eventName);
    console.log("deposit", deposit);
    console.log("max cap", maxCap);
  },[eventName, maxCap, deposit]);

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
      console.log(transactionResult);
      console.log(transactionResponse);
      console.log("RSVP'd to the following event", value);
      console.log("deposit value", value.deposit.toString());
      console.log("# of RSVPs", value.numOfRSVPs.toString());
      setNumOfRSVPs(value.numOfRSVPs.toNumber());
      setEventName(value.name.toString());
      setEventId(value.uniqueId.toString());
      setMaxCap(value.maxCapacity.toNumber());
      setDeposit(value.deposit.toNumber());
      //value.deposit.format()
      console.log("event name", value.name);
      console.log("event capacity", value.maxCapacity.toString());
      console.log("eventID", value.uniqueId.toString()) 
      setRSVPConfirmed(true);
      alert("rsvp successful")
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false)
    }
  }

  async function createEvent(e: any){
    e.preventDefault();
    setLoading(true);
    try {
      console.log("creating event")
      const { value } = await contract.functions.create_event(maxCap, deposit, eventName).txParams({gasPrice: 1}).call();

      console.log("return of create event", value);
      console.log("deposit value", value.deposit.toString());
      console.log("event name", value.name);
      console.log("event capacity", value.maxCapacity.toString());
      console.log("eventID", value.uniqueId.toString())
      setEventId(value.uniqueId.toString())
      setEventCreation(true);
      alert('Event created');
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false);
    }
  }
return (
  <div className="App">
      <div className="form_style">
      <form id="createEventForm" className="createEventForm_style" onSubmit={createEvent}>
        <div className="createEventForm_inputs">
          <input value = {eventName} className="form_input"  onChange={e => setEventName(e.target.value) }name="eventName" type="text" placeholder="Enter event name" />
          <input value = {maxCap} className="form_input" onChange={e => setMaxCap(+e.target.value)} name="maxCapacity" type="text" placeholder="Enter max capacity" />
          <input value = {deposit} className="form_input" onChange={e => setDeposit(+e.target.value)} name="price" type="number" placeholder="Enter price" />
        </div>
        <button className="form_button" role="button" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
      <div className="form_eventid">
        <input name="eventId" className="form_input input_eventid" onChange={e => setEventId(e.target.value)} placeholder="pass in the eventID"/>
        <button className="form_button" role="button" onClick={rsvpToEvent}>RSVP</button>
      </div>
      <div> 
      {eventCreation &&
      <div className="event_style">
      <h1> New Event Created</h1>
      <h2> Event Name: {eventName} </h2>
      <h2> Event ID: {eventId}</h2>
      <h2>Max capacity: {maxCap}</h2>
      <h2>Deposit: {deposit}</h2>
      <h2>Num of RSVPs: {numOfRSVPs}</h2>
      </div>
      }
      </div> 
      <div className="event_rsvpconfirmed">
      {rsvpConfirmed && <>
      <h1>RSVP Confirmed to the following event: {eventName}</h1>
      <h2>Num of RSVPs: {numOfRSVPs}</h2>
      </>}
      </div>
    </div>
  </div>
  
);
}
