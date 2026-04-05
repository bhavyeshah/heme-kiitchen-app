const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TOKEN_KEY = 'heme_admin_token';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.error ||
      (body.detail && typeof body.detail === 'string' ? body.detail : null) ||
      body.detail?.errors?.join(', ') ||
      body.errors?.join(', ') ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

export async function apiFormData<T>(
  path: string,
  method: 'POST' | 'PATCH',
  formData: FormData
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    body: formData,
    headers: {
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.error ||
      (body.detail && typeof body.detail === 'string' ? body.detail : null) ||
      body.detail?.errors?.join(', ') ||
      body.errors?.join(', ') ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}
