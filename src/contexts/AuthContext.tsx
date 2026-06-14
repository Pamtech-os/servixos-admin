/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from 'react';
import { tokenStore, restoreSession } from '@/lib/api-client';
import { storage } from '@/lib/storage';
import { authService } from '@/services/auth.service';
import { isOtpRequired, type Admin, type LoginResult, type LoginSuccessData } from '@/types/auth';

interface AuthState {
  admin: Admin | null;
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  loginWithCredentials: (email: string, password: string) => Promise<LoginResult>;
  loginWithOtp: (otpToken: string, otp: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function applySession(data: LoginSuccessData, setState: (s: AuthState) => void) {
  tokenStore.set(data.accessToken);
  storage.setRefreshToken(data.refreshToken);
  storage.setAdmin(data.admin);
  setState({
    admin: data.admin,
    mustChangePassword: data.mustChangePassword,
    isAuthenticated: true,
    isLoading: false,
  });
}

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => ({
    admin: null,
    mustChangePassword: false,
    isAuthenticated: false,
    isLoading: !!storage.getRefreshToken(),
  }));

  useEffect(() => {
    let cancelled = false;

    const rt = storage.getRefreshToken();
    if (!rt) {
      return;
    }

    const cachedAdmin = storage.getAdmin<Admin>();

    // restoreSession() is deduplicated at module level — safe against StrictMode double-effect
    restoreSession()
      .then((accessToken) => {
        if (cancelled) return;
        if (accessToken) {
          setState({
            admin: cachedAdmin,
            mustChangePassword: false,
            isAuthenticated: !!cachedAdmin,
            isLoading: false,
          });
        } else {
          storage.clear();
          setState({ admin: null, mustChangePassword: false, isAuthenticated: false, isLoading: false });
        }
      })
      .catch(() => {
        if (cancelled) return;
        storage.clear();
        tokenStore.clear();
        setState({ admin: null, mustChangePassword: false, isAuthenticated: false, isLoading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const result = await authService.login(email, password);
    if (!isOtpRequired(result)) {
      applySession(result, setState);
    }
    return result;
  }, []);

  const loginWithOtp = useCallback(async (otpToken: string, otp: string) => {
    const data = await authService.verifyOtp(otpToken, otp);
    applySession(data, setState);
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    await authService.changePassword(current, next);
    setState((s) => ({ ...s, mustChangePassword: false }));
  }, []);

  const logout = useCallback(async () => {
    const rt = storage.getRefreshToken();
    if (rt) {
      try { await authService.logout(rt); } catch { /* best-effort */ }
    }
    tokenStore.clear();
    storage.clear();
    setState({ admin: null, mustChangePassword: false, isAuthenticated: false, isLoading: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, loginWithCredentials, loginWithOtp, changePassword, logout }),
    [state, loginWithCredentials, loginWithOtp, changePassword, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { AuthProvider, useAuth };
