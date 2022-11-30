import { useState, useEffect } from "react";

export default function ConnectWalletButton() {
    const [hasFuelWallet, setHasFuelWallet] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState();

    let myWindow = window as any;

    useEffect(() => {
        if(!hasFuelWallet && myWindow.FuelWeb3){
            setHasFuelWallet(true);
        } else{
            getAccounts();
        }
    },[hasFuelWallet])

    async function getAccounts(){
        // get all of the accounts for the connected wallet
        
        const accounts = await myWindow.FuelWeb3.accounts();
        // gets the first account in the list
        // TODO - choose the preferred account
        const account = accounts[0];
        console.log("ACCOUNT:", account);
        setAccount(account);
    }

    return (
        <>
        {!hasFuelWallet ? <div>You need to download the Fuel wallet extension</div> : <>
        <button>
            Connect Wallet
            </button>
        </>}
           
        </>
    )
}