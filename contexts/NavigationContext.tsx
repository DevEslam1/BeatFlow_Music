import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationStateContextType {
  currentRouteName: string | undefined;
  setCurrentRouteName: (name: string | undefined) => void;
}

const NavigationStateContext = createContext<NavigationStateContextType | undefined>(undefined);

export function NavigationStateProvider({ children }: { children: ReactNode }) {
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(undefined);

  return (
    <NavigationStateContext.Provider value={{ currentRouteName, setCurrentRouteName }}>
      {children}
    </NavigationStateContext.Provider>
  );
}

export function useNavigationStateContext() {
  const context = useContext(NavigationStateContext);
  if (context === undefined) {
    throw new Error('useNavigationStateContext must be used within a NavigationStateProvider');
  }
  return context;
}
