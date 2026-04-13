import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isOffline: boolean;
  isConnected: boolean;
  isRefreshing: boolean;
  isOfflineModeEnabled: boolean;
  toggleOfflineMode: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isOffline: false,
  isConnected: true,
  isRefreshing: false,
  isOfflineModeEnabled: false,
  toggleOfflineMode: () => {},
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Periodic refresh when offline
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (!isConnected) {
      intervalId = setInterval(async () => {
        setIsRefreshing(true);
        try {
          // Force a re-check of the network state
          await NetInfo.refresh();
        } catch (error) {
          console.log('[NetworkContext] Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isConnected]);

  const toggleOfflineMode = () => {
    setIsOfflineModeEnabled((prev) => !prev);
  };

  const isOffline = !isConnected || isOfflineModeEnabled;

  return (
    <NetworkContext.Provider
      value={{ isOffline, isConnected, isRefreshing, isOfflineModeEnabled, toggleOfflineMode }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
