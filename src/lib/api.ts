export const apiBase = () =>
  (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function refreshTokens(): Promise<boolean> {
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) return false;

  const response = await fetch(`${apiBase()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token }),
  });

  if (!response.ok) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return false;
  }

  const data = await response.json();
  const { access_token, refresh_token: new_refresh_token } = data.result ?? data;
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', new_refresh_token);
  return true;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = localStorage.getItem('access_token');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${apiBase()}${path}`, { ...init, headers });

  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      window.location.href = '/login';
      return response;
    }

    const retryHeaders = new Headers(init.headers);
    retryHeaders.set('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
    return fetch(`${apiBase()}${path}`, { ...init, headers: retryHeaders });
  }

  return response;
}
