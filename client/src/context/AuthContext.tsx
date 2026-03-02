import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AuthState, AuthAction, User } from '../types';
import { setAuthToken } from '../services/api';

// ─── Reducer ───────────────────────────────────────────────────────────────────
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { user: null, token: null, isAuthenticated: false };
    default:
      return state;
  }
}

// ─── Initial state — rehydrate from localStorage ───────────────────────────────
function getInitialState(): AuthState {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (token && userStr) {
    try {
      return { token, user: JSON.parse(userStr) as User, isAuthenticated: true };
    } catch {
      // corrupted storage — fall through
    }
  }
  return { token: null, user: null, isAuthenticated: false };
}

// ─── Context ───────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  // Keep axios default header in sync
  useEffect(() => {
    setAuthToken(state.token);
  }, [state.token]);

  const login = (user: User, token: string) =>
    dispatch({ type: 'LOGIN', payload: { user, token } });

  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
