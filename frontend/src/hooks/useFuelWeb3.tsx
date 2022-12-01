import { useState, useEffect } from 'react';
import { FuelWeb3SDK } from '@fuel-wallet/sdk';
import { Provider } from 'fuels';

export type FuelWeb3 = FuelWeb3SDK & {
  getProvider: () => Provider
};

const globalWindow: Window & {
    FuelWeb3: FuelWeb3;
} = typeof window !== 'undefined' ? window as any : ({} as any);

// install FuelWeb3 and import as a package
export function useFuelWeb3() {
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [fuelWeb3, setFuelWeb3] = useState<FuelWeb3>(
    globalWindow.FuelWeb3
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (globalWindow.FuelWeb3) {
        setFuelWeb3(globalWindow.FuelWeb3);
      } else {
        setError('FuelWeb3 not detected on the window!');
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return [fuelWeb3, error, isLoading] as const;
}