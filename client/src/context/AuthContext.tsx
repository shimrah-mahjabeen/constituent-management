import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, AuthAction, User } from '../types/auth';
import {
  checkAuthStatus,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from '../services/auth';

interface AuthContextType extends AuthState {
  login: (
    username: string,
    password: string,
    createdAt: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    username: string,
    password: string,
    createdAt: string,
  ) => Promise<void>;
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'SET_UNAUTH':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    console.log('hello3');
    const initAuth = async () => {
      try {
        const user = await checkAuthStatus();
        dispatch({ type: 'SET_AUTH', payload: user });
      } catch (error) {
        dispatch({ type: 'SET_UNAUTH' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await loginService(username, password);
      dispatch({ type: 'SET_AUTH', payload: user });
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await logoutService();
      dispatch({ type: 'SET_UNAUTH' });
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await registerService(username, password);
      dispatch({ type: 'SET_AUTH', payload: user });
    } catch (error) {
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const authContext: AuthContextType = {
    ...state,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
