const KEYS = {
  ADMIN: 'srv_admin',
} as const;

export const storage = {
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
    localStorage.removeItem(KEYS.ADMIN);
  },
};
