const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.error || body.errors?.join(', ') || `HTTP ${res.status}`;
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
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.error || body.errors?.join(', ') || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}
