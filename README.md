# Building on Fuel with Sway - Web3RSVP

In this workshop, we'll build a fullstack dapp on Fuel.

This dapp is a bare-bones architectural reference for an event creation and management platform, similar to Eventbrite or Luma. Users can create a new event and RSVP to an existing event. This is the functionality we're going to build out in this workshop:

- Create a function in the smart contract to create a new event
- Create a function in the smart contract to RSVP to an existing event

<img width="941" alt="Screenshot 2023-02-08 at 7 33 34 PM" src="https://user-images.githubusercontent.com/32997409/217552100-0eedfe5b-f9ca-4a57-8cc5-a138e58b4ff1.png">

Let's break down the tasks associated with each function:

_In order to create a function to create a new event, the program will have to be able to handle the following:_

- the user should pass in the name of the event, a deposit amount for attendees to pay to be able to RSVP to the event, and the max capacity for the event.
- Once a user passes this information in, our program should create an event, represented as a data structure called a `struct`.
- Because this is an events platform, our program should be able to handle multiple events at once. Therefore, we need a mechanism to store multiple events.
- To store multiple events, we will use a hash map, someimtes known as a hash table in other programming languages. This hash map will `map` a unique identifier, which we'll call an `eventId`, to an event (that is represented as a struct).

_In order to create a function to handle a user RSVP'ing, or confirming their attendance to the event, our program will have to be able to handle the following_

- We should have a mechsnism to identify the event that the user wants to rsvp to

_Some resources that may be helpful:_

- [Fuel Book](https://fuellabs.github.io/fuel-docs/master/)
- [Sway Book](https://fuellabs.github.io/sway/v0.19.2/)
- [Fuel discord](discord.gg/fuelnetwork) - get help

## Run this project locally

In order to test out Web3RSVP locally, carry out the following steps:

1. Clone this repository and move into the root folder `learnsway-web3rsvp`:

```bash
git clone https://github.com/camiinthisthang/learnsway-web3rsvp.git

cd learnsway-web3rsvp
```

2. Move into the `rsvpContract` folder and compile the contact files:

```bash
cd rsvpContract

forc build
```

3. Deploy the contract using the `forc deploy` command:

```bash
forc deploy --url https://node-beta-1.fuel.network/graphql --gas-price 1
```

> 💡 Note: Before you can carry out the next step, make sure you have the fuel wallet CLI installed and an active wallet account. Additionally, you will need test eth from the faucet to sign the transaction. You can get test tokens [here](https://faucet-beta-2.fuel.network/).

4. Enter the wallet address when prompted.

5. Copy the message to be signed. Let's assume that the message string is `X`. Run the following command in a separate terminal:

```bash
forc wallet sign `X` `wallet account index`
```

So for instance, if your wallet account index is 0, the above command should look something like:

```bash
forc wallet sign 16d7a8f9d15cfba1bd000d3f99cd4077dfa1fce2a6de83887afc3f739d6c84df 0
```

6. Paste the returned signature in the previous terminal. Voila! Your contract has now been successfully deployed.

7. Move into the `frontend` folder to install dependencies and run the app locally:

```bash
cd frontend

npm install

npm start
```

Awesome! You can now test out the app and play around with it locally to understand what you be learning to implement and how it should look like in the end.

Now, let's go ahead and get started with building the app yourself!

## Installation

1. Install `cargo` using [`rustup`](https://www.rust-lang.org/tools/install)

   Mac and Linux:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. Check for correct setup:

   ```bash
   $ cargo --version
   cargo 1.62.0
   ```

3. Install `forc` using [`fuelup`](https://fuellabs.github.io/sway/v0.18.1/introduction/installation.html#installing-from-pre-compiled-binaries)

   Mac and Linux:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf \
   https://fuellabs.github.io/fuelup/fuelup-init.sh | sh
   ```

4. Check for correct setup:

   ```bash
   $ forc --version
   forc 0.26.0
   ```

### Editor

You are welcome to use your editor of choice.

- [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=FuelLabs.sway-vscode-plugin)
- [Vim highlighting](https://github.com/FuelLabs/sway.vim)

## Getting Started

This guide will walk developers through writing a smart contract in Sway, a simple test, deploying to Fuel, and building a frontend.

Before we begin, it may be helpful to understand terminology that will used throughout the docs and how they relate to each other:

- **Fuel**: the Fuel blockchain.
- **FuelVM**: the virtual machine powering Fuel.
- **Sway**: the domain-specific language crafted for the FuelVM; it is inspired by Rust.
- **Forc**: the build system and package manager for Sway, similar to Cargo for Rust.

## Understand Sway Program Types

There are four types of Sway programs:

- `contract`
- `predicate`
- `script`
- `library`

Contracts, predicates, and scripts can produce artifacts usable on the blockchain, while a library is simply a project designed for code reuse and is not directly deployable.

The main features of a smart contract that differentiate it from scripts or predicates are that it is callable and stateful.

A script is runnable bytecode on the chain which can call contracts to perform some task. It does not represent ownership of any resources and it cannot be called by a contract.

## Create a new Fuel project

**Start by creating a new, empty folder. We'll call it `learnsway-web3rsvp`.**

### Writing the Contract

Then with `forc` installed, create a project inside of your `Web3RSVP` folder:

```sh
$ cd Web3RSVP
$ forc new eventPlatform
To compile, use `forc build`, and to run tests use `forc test`

---
```

Here is the project that `Forc` has initialized:

```console
$ tree learnsway-web3rsvp
rsvpContract
├── Cargo.toml
├── Forc.toml
├── src
│   └── main.sw
└── tests
    └── harness.rs
```

## Defining the ABI

First, we'll define the ABI. An ABI defines an interface, and there is no function body in the ABI. A contract must either define or import an ABI declaration and implement it. It is considered best practice to define your ABI in a separate library and import it into your contract because this allows callers of the contract to import and use the ABI in scripts to call your contract.

To define the ABI as a library, we'll create a new file in the `src` folder. Create a new file named `event_platform.sw`

Here is what your project structure should look like now:
Here is the project that `Forc` has initialized:

```console
rsvpContract
├── Cargo.toml
├── Forc.toml
├── src
│   └── main.sw
│   └── event_platform.sw
└── tests
    └── harness.rs
```

Add the following code to your ABI file, `event_platform.sw`:

```rust
library event_platform;

use std::{
    identity::Identity,
    contract_id::ContractId,
};

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

```

Now, in the `main.sw` file, we'll implement these functions. This is where you will write out the function bodies. Here is what your `main.sw` file should look like:

```rust
contract;

dep event_platform;
use event_platform::*;

use std::{
   chain::auth::{AuthError, msg_sender},
    constants::BASE_ASSET_ID,
    context::{
   call_frames::msg_asset_id,
        msg_amount,
        this_balance,
    },
    contract_id::ContractId,
    identity::Identity,
    logging::log,
    result::Result,
    storage::StorageMap,
    token::transfer,
};

storage {
    events: StorageMap<u64, Event> = StorageMap {},
    event_id_counter: u64 = 0,
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
        let mut selectedEvent = storage.events.get(storage.event_id_counter - 1);
        return selectedEvent;
    }

    #[storage(read, write)]
    fn rsvp(event_id: u64) -> Event {
        let sender = msg_sender().unwrap();
        let asset_id = msg_asset_id();
        let amount = msg_amount();

     // get the event
     //variables are immutable by default, so you need to use the mut keyword
        let mut selected_event = storage.events.get(event_id);

    // check to see if the eventId is greater than storage.event_id_counter, if
    // it is, revert
        require(selected_event.unique_id < storage.event_id_counter, InvalidRSVPError::InvalidEventID);

    // check to see if the asset_id and amounts are correct, etc, if they aren't revert
        require(asset_id == BASE_ASSET_ID, InvalidRSVPError::IncorrectAssetId);
        require(amount >= selected_event.deposit, InvalidRSVPError::NotEnoughTokens);

          //send the payout from the msg_sender to the owner of the selected event
        transfer(amount, asset_id, selected_event.owner);

    // edit the event
        selected_event.num_of_rsvps += 1;
        storage.events.insert(event_id, selected_event);

    // return the event
        return selected_event;
    }
}
```

### Build the Contract

From inside the `learnsway-web3rsvp/rsvpContract` directory, run the following command to build your contract:

```console
$ forc build
  Compiled library "core".
  Compiled library "std".
  Compiled contract "rsvpContract".
  Bytecode size is 224 bytes.
```

### Deploy the Contract

It's now time to deploy the contract to the testnet. We will show how to do this using `forc` from the command line, but you can also do it using the [Rust SDK](https://github.com/FuelLabs/fuels-rs#deploying-a-sway-contract) or the [TypeScript SDK](https://github.com/FuelLabs/fuels-ts/#deploying-contracts).

In order to deploy a contract, you need to have a wallet to sign the transaction and coins to pay for gas. First, we'll create a wallet.

### Install the Wallet CLI

Follow [these steps to set up a wallet and create an account](https://github.com/FuelLabs/forc-wallet#forc-wallet).

After typing in a password, be sure to save the mnemonic phrase that is output.

With this, you'll get a fuel address that looks something like this: `fuel1efz7lf36w9da9jekqzyuzqsfrqrlzwtt3j3clvemm6eru8fe9nvqj5kar8`. Save this address as you'll need it to sign transactions when we deploy the contract.

#### Get Testnet Coins

With your account address in hand, head to the [testnet faucet](https://faucet-beta-1.fuel.network/) to get some coins sent to your wallet.

## Deploy To Testnet

Now that you have a wallet, you can deploy with `forc deploy` and passing in the testnet endpoint like this:

`forc deploy --url https://node-beta-2.fuel.network/graphql --gas-price 1`

> **Note**
> We set the gas price to 1. Without this flag, the gas price is 0 by default and the transaction will fail.

The terminal will ask for the address of the wallet you want to sign this transaction with, paste in the address you saved earlier, it looks like this: `fuel1efz7lf36w9da9jekqzyuzqsfrqrlzwtt3j3clvemm6eru8fe9nvqj5kar8`

The terminal will output your contract id. Be sure to save this as you will need it to build a frontend with the Typescript SDK.

The terminal will output a `transaction id to sign` and prompt you for a signature. Open a new terminal tab and view your accounts by running `forc wallet list`. If you followed these steps, you'll notice you only have one account, `0`.

Grab the `transaction id` from your other terminal and sign with a specified account by running the following command:

```console
forc wallet sign` + `[transaction id here, without brackets]` + `[the account number, without brackets]`
```

Your command should look like this:

```console
$ forc wallet sign 16d7a8f9d15cfba1bd000d3f99cd4077dfa1fce2a6de83887afc3f739d6c84df 0
Please enter your password to decrypt initialized wallet's phrases:
Signature: 736dec3e92711da9f52bed7ad4e51e3ec1c9390f4b05caf10743229295ffd5c1c08a4ca477afa85909173af3feeda7c607af5109ef6eb72b6b40b3484db2332c
```

Enter your password when prompted, and you'll get back a `signature`. Save that signature, and return to your other terminal window, and paste that in where its prompting you to `provide a signature for this transaction`.

Finally, you will get back a `TransactionId` to confirm your contract was deployed. With this ID, you can head to the [block explorer](https://fuellabs.github.io/block-explorer-v2/) and view your contract.

> **Note**
> You should prefix your `TransactionId` with `0x` to view it in the block explorer

## Create a Frontend to Interact with Contract

Now we are going to

1. **Initialize a React project.**
2. **Install the `fuels` SDK dependencies.**
3. **Modify the App.**
4. **Run our project.**

## Initialize a React project

To split better our project let's create a new folder `frontend` and initialize our project inside it.

In the terminal, go back up one directory and initialize a react project using [`Create React App`](https://create-react-app.dev/).

```console
$ cd ..
$ npx create-react-app frontend --template typescript
Success! Created frontend at learnsway-web3rsvp/frontend
```

You should now have your outer folder, `learnsway-Web3RSVP`, with two folders inside: `frontend` and `rsvpContract`

![project folder structure](./images/quickstart-folder-structure.png)

### Install the `fuels` SDK dependencies

In this step, you need to install 3 dependencies for the project:

1. `fuels`: The umbrella package that includes all the main tools; `Wallet`, `Contracts`, `Providers`, and more!
2. `fuelchain`: Fuelchain is the ABI TypeScript generator.
3. `typechain-target-fuels`: The Fuelchain Target is the specific interpreter for the [Fuel ABI Spec](https://fuellabs.github.io/fuel-specs/master/protocol/abi/index.html).

> ABI stands for Application Binary Interface. The ABI of your smart contract informs the application of the interface to interact with the VM. In other words, it provides info to the app about the contract methods, params, expected types, etc.

### Install

Move into the `frontend` folder, then install the dependencies as follows:

```console
$ cd frontend
$ npm install fuels --save
added 65 packages, and audited 1493 packages in 4s
$ npm install fuelchain typechain-target-fuels --save-dev
added 33 packages, and audited 1526 packages in 2s
```

### Generating contract types

To make it easier to interact with your contract, let's use `fuelchain` to interpret the output ABI JSON from your contract. This JSON was created at the moment you executed the `forc build` to compile your Sway Contract into binary.

If you see the folder `learnsway-Web3RSVP/rsvpContract/out`, you will be able to see the ABI JSON inside it. To learn more, read the [ABI Specs here](https://github.com/FuelLabs/fuel-specs/blob/master/specs/protocol/abi.md).

Inside `learnsway-Web3RSVP/frontend` run;

```console
$ npx fuelchain --target=fuels --out-dir=./src/contracts ../rsvpContract/out/debug/*-abi.json
Successfully generated 4 typings!
```

Now you should be able to find a new folder `learnsway-Web3RSVP/frontend/src/contracts`. This folder was auto-generated by the `fuelchain` command you executed. These files abstract away the work you would need to do to create a contract instance and generate a complete TypeScript interface for the contract.

### Integrating Fuel Wallet

For interacting with the Fuel network we have to submit signed transactions with enough funds to cover network fees.

#### Write wallet hooks

1. `useFuel`

Create a file called `useFuelWeb3.tsx` in your `hooks` folder. Go ahead and add the code below to write your `useFuel` wallet hook:

```js
import { useState, useEffect } from 'react';
import { Fuel } from '@fuel-wallet/sdk';

const globalWindow: Window & {
    fuel: Fuel;
} = typeof window !== 'undefined' ? window as any : ({} as any);

export function useFuel() {
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [fuel, setFuel] = useState<Fuel>(
    globalWindow.fuel
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (globalWindow.fuel) {
        setFuel(globalWindow.fuel);
      } else {
        setError('Fuel Wallet not detected on the window!');
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return [fuel, error, isLoading] as const;
}
```

2. `useIsConnected`

Create another file called `useIsConnected.tsx` in your `hooks` folder and add the following code to define the `useIsConnected` wallet hook:

```js
import { useEffect, useState } from 'react';

import { useFuel } from './useFuel';

export function useIsConnected() {
  const [fuel] = useFuel();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function main() {
      try {
        const accounts = await fuel.accounts();
        setIsConnected(Boolean(accounts.length));
      } catch (err) {
        setIsConnected(false);
      }
    }

    if (fuel) {
      main();
    }

    fuel?.on('connection', main);
    return () => {
      fuel?.off('connection', main);
    };
  }, [fuel]);

  return isConnected;
}

```

Now you're ready to build and ship ⛽

### Modify the App

Inside the `frontend` folder let's add code that interacts with our contract.
Read the comments to help you understand the App parts.

1. Import the wallet hooks:

```js
import { useFuel } from "./hooks/useFuelWeb3";
import { useIsConnected } from "./hooks/useIsConnected";
import { FuelWalletProvider } from "@fuel-wallet/sdk";
```

2. Add the contract id of the Sway smart contract you have deployed in your `App.tsx` file

```js
const CONTRACT_ID = "your_contract_id"
```

3. Define `fuel` and `isConnected` using the wallet hooks you wrote earlier

```js
export default function App() {
  const isConnected = useIsConnected();
  const [fuel] = useFuel();
}
```

4. Get `accounts` and `provider`

```
useEffect(() => {
    async function getAccounts() {
      const accounts = await fuel.accounts();
      const prov = await fuel.getProvider();
      setAccounts(accounts);
      setProvider(prov);
    }
    if (fuel) getAccounts();
  }, [fuel]);
```

5. Connect contract instance to the deployed contract  address using the given wallet

```js
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
```

Awesome! Now that we've integrated the wallet, let's go ahead and write our functions for creating an event and then rsvping to it.

Your `learnsway-Web3RSVP/frontend/src/App.tsx` file should look something like this:

```js
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
```

### Run your project

Now it's time to have fun run the project on your browser;

Inside `Web3RSVP/frontend` run;

```console
$ npm start
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3001
  On Your Network:  http://192.168.4.48:3001

Note that the development build is not optimized.
To create a production build, use npm run build.
```

#### ✨⛽✨ Congrats you have completed your first DApp on Fuel ✨⛽✨

<img width="941" alt="Screenshot 2023-02-08 at 7 33 34 PM" src="https://user-images.githubusercontent.com/32997409/217552100-0eedfe5b-f9ca-4a57-8cc5-a138e58b4ff1.png">

Tweet me [@camiinthisthang](https://twitter.com/camiinthisthang) and let me know you just built a dapp on Fuel, you might get invited to a private group of builders, be invited to the next Fuel dinner, get alpha on the project, or something 👀.

> Note: To push this project up to a github repo, you'll have to remove the `.git` file that automatically gets created with `create-react-app`. You can do that by running the following command in `learnsway-Web3RSVP/frontend`: `Rm -rf .git`. Then, you'll be good to add, commit, and push these files.

### Updating The Contract

If you make changes to your contract, here are the steps you should take to get your frontend and contract back in sync:

- In your contract directory, run `forc build`
- In your contract directory, redeploy the contract by running this command and following the same steps as above to sign the transaction with your wallet: `forc deploy --url https://node-beta-1.fuel.network/graphql --gas-price 1`
- In your frontend directory, re-run this command: `npx fuelchain --target=fuels --out-dir=./src/contracts ../rsvpContract/out/debug/*-abi.json`
- In your frontend directory, update the contract ID in your `App.tsx` file

## Need Help?

Head over to the [Fuel discord](https://discord.com/invite/fuelnetwork) to get help.
