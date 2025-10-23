// src/lib/auth.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; // e.g., http://127.0.0.1:5000

const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

/**
 * Login against your backend.
 * Expects { token, user? } on success.
 */
export async function login({ email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || "Login failed");
  if (!data?.token) throw new Error("Malformed login response: missing token");
  // persist
  setToken(data.token);
  if (data.user) setUser(data.user);
  return data; // { token, user? }
}

/**
 * Fetch that adds Authorization header automatically.
 * Usage: const res = await authFetch("/api/profile");
 */
export function authFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}