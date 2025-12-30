// frontend/src/api.js
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

if (!API_BASE) {
  console.error('VITE_API_BASE_URL is not defined');
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  // DO NOT read res.json() or res.text() here
  // Just return the Response object
  return res;
}
