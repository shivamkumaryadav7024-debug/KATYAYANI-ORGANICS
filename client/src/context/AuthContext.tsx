import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AuthState, AuthAction, User } from '../types';

// ─── Reducer ───────────────────────────────────────────────────────────────────
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return { user: action.payload.user, isAuthenticated: true };
    case 'LOGOUT':
      localStorage.removeItem('user');
      return { user: null, isAuthenticated: false };
    default:
      return state;
  }
}

// ─── Initial state — rehydrate user info from localStorage ────────────────────
function getInitialState(): AuthState {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return { user: JSON.parse(userStr) as User, isAuthenticated: true };
    } catch {
      // corrupted storage — fall through
    }
  }
  return { user: null, isAuthenticated: false };
}

// ─── Context ───────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  const login = (user: User) => dispatch({ type: 'LOGIN', payload: { user } });
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
