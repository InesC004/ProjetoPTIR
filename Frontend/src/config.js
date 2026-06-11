export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://takeacab.online"
).replace(/\/$/, "");

export const API_URL = `${API_BASE_URL}/api`;

export function apiUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
