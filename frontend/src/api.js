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

  const text = await res.text(); // read once

  if (!res.ok) {
    console.error('API error:', res.status, text);
    throw new Error(text || `HTTP ${res.status}`);
  }

  // parse from text, NOT res.json()
  try {
    return text ? JSON.parse(text) : null;
  } catch (err) {
    console.error('Invalid JSON from API:', text);
    throw new Error('Invalid JSON response from API');
  }
}
