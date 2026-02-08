const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, body, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "An unknown error occurred" }));

    throw new ApiError(response.status, error.detail || "Request failed");
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  return JSON.parse(text);
}

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token?: string;
  user_id: string;
  email: string;
  role: "user" | "admin" | "owner" | "super_admin";
  tenant_id: string;
  tenant_name: string;
}

export interface MeResponse {
  user_id: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  is_supabase_auth: boolean;
}

// Auth API functions
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: data,
    }),

  me: (token: string) =>
    apiClient<MeResponse>("/api/auth/me", {
      token,
    }),
};
