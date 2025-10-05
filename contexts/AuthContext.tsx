import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/apiClient';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  apiClient: typeof apiClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Fetch user data
          const response = await apiClient['client'].get('/users/me');
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (token: string) => {
    try {
      localStorage.setItem('auth_token', token);
      
      // Fetch user data after login
      const response = await apiClient['client'].get('/users/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('auth_token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };
  
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    apiClient,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}