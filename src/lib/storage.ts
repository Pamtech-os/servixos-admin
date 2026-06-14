const KEYS = {
  REFRESH_TOKEN: 'srv_rt',
  ADMIN: 'srv_admin',
} as const;

export const storage = {
  getRefreshToken: (): string | null => localStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string): void => localStorage.setItem(KEYS.REFRESH_TOKEN, token),

  getAdmin: <T>(): T | null => {
    try {
      const raw = localStorage.getItem(KEYS.ADMIN);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  setAdmin: <T>(admin: T): void => localStorage.setItem(KEYS.ADMIN, JSON.stringify(admin)),

  clear: (): void => {
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.ADMIN);
  },
};
