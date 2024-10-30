export interface User {
  id: string;
  userName: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export type AuthAction = 
  | { type: 'SET_AUTH'; payload: User }
  | { type: 'SET_UNAUTH' }
  | { type: 'SET_LOADING'; payload: boolean };