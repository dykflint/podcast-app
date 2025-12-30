// frontend/src/api.js
// Helper to fetch api calls from Render on Vercel
const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');

if (!API_BASE) {
  console.error('❌ VITE_API_BASE_URL is not defined');
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  // Read text first (important for debugging)
  const text = await res.text();

  if (!res.ok) {
    console.error('API error:', res.status, text);
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Some endpoints might return empty bodies
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    console.error('Non-JSON response:', text);
    throw new Error('Invalid JSON response from API');
  }
}
