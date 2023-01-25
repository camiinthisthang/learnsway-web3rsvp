import { useState, useEffect } from 'react';
import { useFuel } from './useFuelWeb3';

export function useIsConnected() {
    const [fuel] = useFuel();
    const [isConnected, setConnect] = useState(false);

    useEffect(() => {
        async function connect() {
            console.log('connection changed');
            const accounts = await fuel.accounts();
            console.log('accounts', accounts);
            //if length is 0 it means you're not connected
            setConnect(accounts.length > 0);
        }
        if (fuel) {
            connect();
        }
        fuel?.on('connection', connect);
        return () => {
            fuel?.off('connection', connect)
        };
    }, [fuel]);

    return isConnected;
}