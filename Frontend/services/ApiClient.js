// const DEFAULT_BASE_URL = "http://localhost:5001";

function getBaseUrl() {
  const fromEnvRaw = (import.meta?.env?.VITE_API_URL || "").trim();

  // In docker-compose env files, placeholders like ${BACKEND_PORT} are not
  // expanded for the browser. Treat those values as invalid.
  const looksUnexpanded = fromEnvRaw.includes("${") || fromEnvRaw.includes("}");
  const looksHttp = /^https?:\/\//i.test(fromEnvRaw);
  const fromEnv = !fromEnvRaw || looksUnexpanded || !looksHttp ? "" : fromEnvRaw;

  const baseUrl = fromEnv || DEFAULT_BASE_URL;
  return baseUrl ? baseUrl.replace(/\/$/, "") : "";
}

function buildUrl(path) {
  const baseUrl = getBaseUrl();
  if (!path.startsWith("/")) return `${baseUrl}/${path}`;
  return `${baseUrl}${path}`;
}

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
export async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const BASE_URL = import.meta.env.VITE_API_URL ?? "";

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }

  return data;
}
