import { useState, useEffect } from 'react';
import { Fuel } from '@fuel-wallet/sdk';
import { Provider } from 'fuels';

export type fuel = Fuel & {
  getProvider: () => Provider
};

const globalWindow: Window & {
  fuel: fuel;
} = typeof window !== 'undefined' ? window as any : ({} as any);

// install FuelWeb3 and import as a package
export function useFuel() {
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [fuel, setFuel] = useState<fuel>(
    globalWindow.fuel
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (globalWindow.fuel) {
        setFuel(globalWindow.fuel);
      } else {
        setError('fuel not detected on the window!');
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return [fuel, error, isLoading] as const;
}