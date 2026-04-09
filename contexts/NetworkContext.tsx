import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isOffline: boolean;
  isConnected: boolean;
  isOfflineModeEnabled: boolean;
  toggleOfflineMode: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isOffline: false,
  isConnected: true,
  isOfflineModeEnabled: false,
  toggleOfflineMode: () => {},
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isOfflineModeEnabled, setIsOfflineModeEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected !== false);
    });

    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected !== false);
    });

    return () => unsubscribe();
  }, []);

  const toggleOfflineMode = () => {
    setIsOfflineModeEnabled((prev) => !prev);
  };

  const isOffline = !isConnected || isOfflineModeEnabled;

  return (
    <NetworkContext.Provider
      value={{ isOffline, isConnected, isOfflineModeEnabled, toggleOfflineMode }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
