const API_ROOT = '/api';

export async function request(path, options = {}) {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.status === 204 ? null : res.json();
}