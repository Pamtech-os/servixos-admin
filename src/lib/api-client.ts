import { storage } from './storage';

const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/$/, '');
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

// Performs the fetch with auth cookie + channel header, retrying once after a cookie refresh on 401.
async function send(path: string, options: RequestOptions = {}): Promise<Response> {
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

  if (res.status === 401 && !_isRetry && auth) {
    if (!_refreshPromise) {
      _refreshPromise = callRefresh().finally(() => {
        _refreshPromise = null;
      });
    }
    const refreshed = await _refreshPromise;
    if (refreshed) {
      return send(path, { ...options, _isRetry: true });
    }
    storage.clear();
  }

  return res;
}

async function doRequest(path: string, options: RequestOptions = {}): Promise<Record<string, unknown>> {
  const res = await send(path, options);
  const json = (await res.json()) as Record<string, unknown>;

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
  // For file downloads. Errors still arrive in the standard JSON envelope.
  download: async (path: string): Promise<{ blob: Blob; filename: string | null }> => {
    const res = await send(path, { method: 'GET' });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      throw new ApiError((json.message as string) ?? 'Download failed', (json.statusCode as number) ?? res.status);
    }
    // Requires the server to expose Content-Disposition via Access-Control-Expose-Headers.
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? null;
    return { blob: await res.blob(), filename };
  },
};
