import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { authService } from '../services/api';
import { transformAuthResponseToUser, type AuthUser, type User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  name: string;
  role?: string;
  age?: number;
  verificationCode: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  
  // Check if the user is already authenticated
  useEffect(() => {      const checkAuthStatus = async () => {
      try {
        // Use authService and transform the response
        const authData: AuthUser = await authService.getCurrentUser();
        if (authData && authData.username) {
          const userData = transformAuthResponseToUser(authData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Just treat any error as not authenticated
        console.log('Not authenticated yet');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    clearError();
    try {
      // Use the authService
      const userData = await authService.login(username, password);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    clearError();
    try {
      // Use authService for logout
      await authService.logout();
      
      // Always clear user state on client
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state on client
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    clearError();
    try {
      // Use authService for registration
      await authService.register(userData);
      // Registration successful
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
      throw err; // Re-throw so the component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
