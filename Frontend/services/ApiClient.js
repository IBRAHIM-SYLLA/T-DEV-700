const DEFAULT_BASE_URL = "http://localhost:5001";

function getBaseUrl() {
  const fromEnvRaw = (import.meta?.env?.VITE_API_URL || "").trim();

  // In docker-compose env files, placeholders like ${BACKEND_PORT} are not
  // expanded for the browser. Treat those values as invalid.
  const looksUnexpanded = fromEnvRaw.includes("${") || fromEnvRaw.includes("}");
  const looksHttp = /^https?:\/\//i.test(fromEnvRaw);
  const fromEnv = !fromEnvRaw || looksUnexpanded || !looksHttp ? "" : fromEnvRaw;

  const baseUrl = fromEnv || DEFAULT_BASE_URL;
  return baseUrl.replace(/\/$/, "");
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

export async function apiFetch(path, { method = "GET", body, token, headers } = {}) {
  const finalHeaders = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(headers || {})
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  console.log(response);

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && (data.message || data.error)) ||
      (typeof data === "string" ? data : null) ||
      `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
