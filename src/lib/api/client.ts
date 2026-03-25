const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error(`API GET ${path} failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API POST ${path} failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API PUT ${path} failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error(`API DELETE ${path} failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
