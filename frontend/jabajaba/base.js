const API_ROOT = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export { request }; 