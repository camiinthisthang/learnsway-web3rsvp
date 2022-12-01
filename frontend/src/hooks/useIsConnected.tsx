import { useState, useEffect } from 'react';
import { useFuelWeb3 } from './useFuelWeb3';

export function useIsConnected() {
    const [FuelWeb3] = useFuelWeb3();
    const [isConnected, setConnect] = useState(false);

    useEffect(() => {
        async function connect() {
            const accounts = await FuelWeb3.accounts();
            console.log('accounts', accounts);
            //if length is 0 it means you're not connected
            setConnect(accounts.length > 0);
        }
        if (FuelWeb3) {
            connect();
        }
        FuelWeb3?.on('connection', connect);
        return () => {
            FuelWeb3?.off('connection', connect)
        };
    }, []);

    return isConnected;
}