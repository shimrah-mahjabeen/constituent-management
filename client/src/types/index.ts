export interface Constituent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}
