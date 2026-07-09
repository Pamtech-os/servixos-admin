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

// Deduplicates concurrent refresh calls (survives StrictMode remount cycles)
let _refreshPromise: Promise<boolean> | null = null;
// Deduplicates the initial session-restore call across StrictMode double-effect
let _restorePromise: Promise<boolean> | null = null;

async function callRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}${PREFIX}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-channel': 'web',
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}

/**
 * Restores session on app mount by refreshing the a_access_token cookie.
 * Module-level promise ensures a single network call even when React
 * StrictMode fires the calling useEffect twice (mount → unmount → remount).
 */
export function restoreSession(): Promise<boolean> {
  if (!_restorePromise) {
    _restorePromise = callRefresh().finally(() => {
      _restorePromise = null;
    });
  }
  return _restorePromise;
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
  _isRetry?: boolean;
}

async function doRequest(path: string, options: RequestOptions = {}): Promise<Record<string, unknown>> {
  const { auth = true, _isRetry = false, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-channel': 'web',
    ...(fetchOpts.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${PREFIX}${path}`, {
    ...fetchOpts,
    headers,
    credentials: 'include',
  });
  const json = (await res.json()) as Record<string, unknown>;

  // One retry after cookie refresh on 401
  if (res.status === 401 && !_isRetry && auth) {
    if (!_refreshPromise) {
      _refreshPromise = callRefresh().finally(() => {
        _refreshPromise = null;
      });
    }
    const refreshed = await _refreshPromise;
    if (refreshed) {
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
