import type { OrchestrationResult } from "../types/orchestration";

// Backend base URL comes from env. In Vite, frontend env vars must start with VITE_.
// Configure in frontend/.env, e.g. VITE_BACKEND_URL=http://localhost:3000
const API_BASE_URL: string =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "http://localhost:3000";

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export interface ApiError extends Error {
  status?: number;
  payload?: unknown;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<OrchestrationResult<T>> {
  const { method = "GET", body, token } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  let json: OrchestrationResult<T> | null = null;
  try {
    json = (await response.json()) as OrchestrationResult<T>;
  } catch {
    // ignore JSON parse errors
  }

  if (!response.ok) {
    const error: ApiError = new Error(
      (json && json.message) || "Request failed",
    );
    error.status = response.status;
    error.payload = json;
    throw error;
  }

  // Fallback in case backend didn't send a body
  if (!json) {
    return {
      code: "FAILURE",
      statusCode: "UNKNOWN",
      message: "Empty response body",
      data: null,
    };
  }

  return json;
}
