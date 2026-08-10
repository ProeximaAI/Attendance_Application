import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { TokenManager } from '../utils/tokenManager';

type User = {
  id: number;
  name: string;
  role: string;
  is_first_login?: number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isFirstLaunch: boolean | null;
  isSplashFinished: boolean;
  setSplashFinished: (finished: boolean) => void;
  completeOnboarding: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isFirstLaunch: null,
  isSplashFinished: false,
  setSplashFinished: () => { },
  completeOnboarding: async () => { },
  login: async () => { },
  logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isSplashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    const checkState = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }

        // Check if we have an existing session
        const token = await TokenManager.getAccessToken();
        if (token) {
          try {
            const userData = await authService.me();
            setUser(userData);
          } catch (e) {
            // Token invalid or expired without refresh working
            await TokenManager.clearTokens();
            setUser(null);
          }
        } else {
          setUser(null);
        }
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
      const response = await authService.login(credentials);
      
      const { token, user: userData } = response.data;
      await TokenManager.setAccessToken(token);

      // Extract refresh token from headers
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const cookieStr = Array.isArray(setCookie) ? setCookie.find((c: string) => c.startsWith('refresh_token=')) : setCookie;
        if (cookieStr) {
          const newRefreshToken = cookieStr.split(';')[0].split('=')[1];
          await TokenManager.setRefreshToken(newRefreshToken);
        }
      }

      setUser(userData);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      await TokenManager.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isFirstLaunch, isSplashFinished, setSplashFinished, completeOnboarding, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
