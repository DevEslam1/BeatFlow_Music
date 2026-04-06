import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/services/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = '@gig_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error loading user:', e);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulated login — in production, call a real auth API
    const simulatedUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
    };
    setUser(simulatedUser);
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(simulatedUser));
    return true;
  };

  const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
    const simulatedUser: User = {
      id: Date.now().toString(),
      email,
      name,
    };
    setUser(simulatedUser);
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(simulatedUser));
    return true;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
