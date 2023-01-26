import React, { useEffect, useState, useMemo } from "react";
import { useFuel } from "./hooks/useFuelWeb3";
import { useIsConnected } from "./hooks/useIsConnected";
import { ConnectRequest } from "./pages/ConnectRequest";
import { WalletLocked, bn } from "fuels";
import { FuelWalletProvider } from "@fuel-wallet/sdk";
import Layout from "./components/Layout";
import DisplaySingleEvent from "./components/DisplaySingleEvent";

// Import the contract factory -- you can find the name in index.ts.
// You can also do command + space and the compiler will suggest the correct name.
import { RsvpContractAbi__factory } from "./contracts";
// The address of the contract deployed the Fuel testnet
// const CONTRACT_ID = "0x32f10d6f296fbd07e16f24867a11aab9d979ad95f54b223efc0d5532360ef5e4";
const CONTRACT_ID =
  "0x0314f13ea8a2f710de1317d0f50d7ec299e60dc8fe17c26de765766a39c8b04c";

export default function App() {
  const isConnected = useIsConnected();
  const [fuel] = useFuel();
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<FuelWalletProvider>();
  const [accounts, setAccounts] = useState<Array<string>>([]);

  useEffect(() => {
    async function getAccounts() {
      const accounts = await fuel.accounts();
      const prov = await fuel.getProvider();
      setAccounts(accounts);
      setProvider(prov);
    }
    if (fuel) getAccounts();
  }, [fuel]);

  const [contract, wallet] = useMemo(() => {
    if (fuel && accounts[0]) {
      const wallet = new WalletLocked(accounts[0], provider);
      // Connects out Contract instance to the deployed contract
      // address using the given wallet.
      const contract = RsvpContractAbi__factory.connect(CONTRACT_ID, wallet);

      return [contract, wallet];
    }
    return [null, null];
  }, [fuel, accounts, isConnected]);

  //-----------------------------------------------//
  //state variables to capture the selection of an existing event to RSVP to
  const [eventName, setEventName] = useState("");
  const [maxCap, setMaxCap] = useState(0);
  const [eventCreation, setEventCreation] = useState(false);
  const [rsvpConfirmed, setRSVPConfirmed] = useState(false);
  const [numOfRSVPs, setNumOfRSVPs] = useState(0);
  const [eventId, setEventId] = useState("");
  const [eventDeposit, setEventDeposit] = useState(0);
  //-----------------------------------------------//
  //state variables to capture the creation of an event
  const [newEventName, setNewEventName] = useState("");
  const [newEventMax, setNewEventMax] = useState(0);
  const [newEventDeposit, setNewEventDeposit] = useState(0);
  const [newEventID, setNewEventID] = useState("");
  const [newEventRSVP, setNewEventRSVP] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (wallet) {
      console.log("Wallet address", wallet.address.toString());
      setWalletAddress(wallet.address.toString());
      wallet.getBalances().then((balances) => {
        const balancesFormatted = balances.map((balance) => {
          return [balance.assetId, balance.amount.format()];
        });
        console.log("Wallet balances", balancesFormatted);
      });
    }
  }, [wallet]);

  if (!isConnected) {
    return <ConnectRequest />;
  }

  async function rsvpToEvent() {
    setLoading(true);
    try {
      console.log("RSVPing to event");
      // Retrieve the current RSVP data
      const { value: eventData } = await contract!.functions
        .get_rsvp(eventId)
        .get();
      const requiredAmountToRSVP = eventData.deposit.toString();

      console.log("deposit required to rsvp", requiredAmountToRSVP.toString());
      setEventId(eventData.unique_id.toString());
      setMaxCap(eventData.max_capacity.toNumber());
      setEventName(eventData.name.toString());
      setEventDeposit(eventData.deposit.toNumber());
      console.log("event name", eventData.name);
      console.log("event capacity", eventData.max_capacity.toString());
      console.log("eventID", eventData.unique_id.toString());

      // Create a transaction to RSVP to the event
      const { value: eventRSVP, transactionId } = await contract!.functions
        .rsvp(eventId)
        .callParams({
          forward: [requiredAmountToRSVP],
          //variable outputs is when a transaction creates a new dynamic UTXO
          //for each transaction you do, you'll need another variable output
          //for now, you have to set it manually, but the TS team is working on an issue to set this automatically
        })
        .txParams({ gasPrice: 1, variableOutputs: 1 })
        .call();

      console.log(
        "Transaction created",
        transactionId,
        `https://fuellabs.github.io/block-explorer-v2/transaction/${transactionId}`
      );
      console.log("# of RSVPs", eventRSVP.num_of_rsvps.toString());
      setNumOfRSVPs(eventRSVP.num_of_rsvps.toNumber());
      setRSVPConfirmed(true);
      alert("rsvp successful");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("creating event");
      const requiredDeposit = bn.parseUnits(newEventDeposit.toString());
      console.log("requiredDeposit", requiredDeposit.toString());
      const { value } = await contract!.functions
        .create_event(newEventMax, requiredDeposit, newEventName)
        .txParams({ gasPrice: 1 })
        .call();

      console.log("return of create event", value);
      console.log(
        "deposit value",
        bn.parseUnits(newEventDeposit.toString()).toString()
      );
      console.log("event name", value.name);
      console.log("event capacity", value.max_capacity.toString());
      console.log("eventID", value.unique_id.toString());
      setNewEventID(value.unique_id.toString());
      setEventCreation(true);
      alert("Event created");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Layout address={walletAddress}>
      <div className="main">
        <form
          onSubmit={createEvent}
          className="space-y-8 divide-y divide-gray-200"
        >
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div className="space-y-6 sm:space-y-5">
              <div>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Create events, manage ticket sales, and connect with your
                  community.
                </p>
              </div>
            </div>
            <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
              <p className="text-lg font-bold">Create a New Event</p>
              <div className="space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    Event name
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      type="text"
                      name="event-name"
                      id="event-name"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      placeholder="Enter event name"
                      className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    Max Capacity
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      value={newEventMax}
                      onChange={(e) => setNewEventMax(+e.target.value)}
                      type="number"
                      name="last-name"
                      id="last-name"
                      autoComplete="family-name"
                      className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    Ticket Price
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      value={newEventDeposit}
                      onChange={(e) => setNewEventDeposit(+e.target.value)}
                      id="email"
                      name="email"
                      type="number"
                      autoComplete="email"
                      className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create
              </button>
            </div>
          </div>
        </form>
        <form
          onSubmit={rsvpToEvent}
          className="space-y-8 divide-y divide-gray-200"
        >
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
              <p className="text-lg font-bold">RSVP To An Event</p>
              <div className="space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                  >
                    Event ID
                  </label>
                  <div className="mt-1 sm:col-span-2 sm:mt-0">
                    <input
                      type="number"
                      name="event-name"
                      id="event-name"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      placeholder="Enter event name"
                      className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="submit"
                onClick={rsvpToEvent}
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                RSVP
              </button>
            </div>
          </div>
        </form>
        <div className="results">
          <div className="card rounded-sm mt-4">
            {(eventCreation && newEventID != "0") && (
              <>
                <DisplaySingleEvent
                  eventName={newEventName}
                  deposit={newEventDeposit}
                  eventId={newEventID}
                  numOfRsvps={newEventRSVP}
                ></DisplaySingleEvent>
              </>
            )}
          </div>
          <div>
            {rsvpConfirmed && (
              <>
                <div className="card">
                  <DisplaySingleEvent
                    eventName={eventName}
                    numOfRsvps={numOfRSVPs}
                    eventId={eventId}
                    deposit={eventDeposit}
                  ></DisplaySingleEvent>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
