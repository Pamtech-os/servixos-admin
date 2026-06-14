import { storage } from './storage';

const BASE = (import.meta.env.VITE_API_URL as string).replace(/\/$/, '');
const PREFIX = '/api/admin/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Access token lives in memory only — never written to localStorage
let _accessToken: string | null = null;
// Deduplicates concurrent refresh calls (survives StrictMode remount cycles)
let _refreshPromise: Promise<string | null> | null = null;
// Deduplicates the initial session-restore call across StrictMode double-effect
let _restorePromise: Promise<string | null> | null = null;

export const tokenStore = {
  get: () => _accessToken,
  set: (t: string) => {
    _accessToken = t;
  },
  clear: () => {
    _accessToken = null;
  },
};

async function callRefresh(): Promise<string | null> {
  const rt = storage.getRefreshToken();
  if (!rt) return null;
  try {
    const res = await fetch(`${BASE}${PREFIX}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data?.accessToken as string) ?? null : null;
  } catch {
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  if (_accessToken) return _accessToken;
  if (!_refreshPromise) {
    _refreshPromise = callRefresh().finally(() => {
      _refreshPromise = null;
    });
  }
  const token = await _refreshPromise;
  if (token) _accessToken = token;
  return token;
}

/**
 * Restores session on app mount by refreshing the stored token.
 * Module-level promise ensures a single network call even when React
 * StrictMode fires the calling useEffect twice (mount → unmount → remount).
 */
export function restoreSession(): Promise<string | null> {
  if (_accessToken) return Promise.resolve(_accessToken);
  if (!_restorePromise) {
    _restorePromise = callRefresh()
      .then((token) => {
        if (token) _accessToken = token;
        return token;
      })
      .finally(() => {
        _restorePromise = null;
      });
  }
  return _restorePromise;
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  _isRetry?: boolean;
}

// Returns the full parsed JSON body (validated for success).
async function doRequest(path: string, options: RequestOptions = {}): Promise<Record<string, unknown>> {
  const { auth = true, _isRetry = false, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOpts.headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${PREFIX}${path}`, { ...fetchOpts, headers });
  const json = await res.json() as Record<string, unknown>;

  // One retry after token refresh on 401
  if (res.status === 401 && !_isRetry && auth) {
    tokenStore.clear();
    const fresh = await callRefresh();
    if (fresh) {
      tokenStore.set(fresh);
      return doRequest(path, { ...options, _isRetry: true });
    }
    storage.clear();
  }

  if (!json.success) {
    throw new ApiError((json.message as string) ?? 'Request failed', (json.statusCode as number) ?? res.status);
  }

  return json;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const json = await doRequest(path, options);
  return json.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  // For endpoints where `meta` is a sibling of `data` (not nested inside it).
  getList: <T>(path: string): Promise<{ data: T; meta: Record<string, unknown> }> =>
    doRequest(path, { method: 'GET' }).then((json) => ({
      data: json.data as T,
      meta: json.meta as Record<string, unknown>,
    })),
  post: <T>(path: string, body: unknown, opts?: Pick<RequestOptions, 'auth'>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  patch: <T>(path: string, body: unknown, opts?: Pick<RequestOptions, 'auth'>) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: <T>(path: string, opts?: Pick<RequestOptions, 'auth'>) =>
    request<T>(path, { method: 'DELETE', ...opts }),
};
