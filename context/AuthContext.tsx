import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

type User = {
  id: number;
  name: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isFirstLaunch: boolean | null;
  completeOnboarding: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isFirstLaunch: null,
  completeOnboarding: async () => { },
  login: async () => { },
  logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkState = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }

        // Ensure user is null on load to force login screen
        setUser(null);
      } catch (e) {
        console.error('Failed to load state', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkState();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setIsFirstLaunch(false);
    } catch (e) {
      console.error('Failed to save state', e);
    }
  };

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      // Mocking successful login for the demo
      setUser({
        id: 1,
        name: 'Swarup Kumar Behera',
        role: 'Software Developer',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isFirstLaunch, completeOnboarding, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
