import { createContext, useContext, useMemo, useState, type FC, type PropsWithChildren } from 'react';
/* eslint-disable react-refresh/only-export-components */

interface AuthState {
  userEmail: string;
}

interface AuthContextValue {
  auth: AuthState;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ userEmail: 'admin@servixos.com' });

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      login: (email: string) => setAuth({ userEmail: email }),
      logout: () => setAuth({ userEmail: '' }),
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
