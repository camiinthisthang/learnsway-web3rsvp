import { useState, useEffect } from 'react';
import { FuelWeb3SDK } from '@fuel-wallet/sdk';
import { Provider } from 'fuels';

export type FuelWeb3 = FuelWeb3SDK & {
  getProvider: () => Provider
};

const globalWindow: Window & {
    fuel: FuelWeb3;
} = typeof window !== 'undefined' ? window as any : ({} as any);

// install FuelWeb3 and import as a package
export function useFuelWeb3() {
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [fuelWeb3, setFuelWeb3] = useState<FuelWeb3>(
    globalWindow.fuel
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (globalWindow.fuel) {
        setFuelWeb3(globalWindow.fuel);
      } else {
        setError('FuelWeb3 not detected on the window!');
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return [fuelWeb3, error, isLoading] as const;
}