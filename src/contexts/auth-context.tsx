"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, ApiError, type LoginResponse, type MeResponse } from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
  tenantSlug?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "access_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        try {
          const me = await authApi.me(storedToken);
          setUser({
            id: me.user_id,
            email: me.email,
            role: me.role,
            tenantId: me.tenant_id,
            tenantName: me.tenant_name,
            tenantSlug: me.tenant_slug,
          });
        } catch {
          // Token invalid, clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response: LoginResponse = await authApi.login({ email, password });

      // Store token
      localStorage.setItem(TOKEN_KEY, response.access_token);
      setToken(response.access_token);

      // Set user
      setUser({
        id: response.user_id,
        email: response.email,
        role: response.role,
        tenantId: response.tenant_id,
        tenantName: response.tenant_name,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return false;
    }

    try {
      const me = await authApi.me(storedToken);
      setToken(storedToken);
      setUser({
        id: me.user_id,
        email: me.email,
        role: me.role,
        tenantId: me.tenant_id,
        tenantName: me.tenant_name,
        tenantSlug: me.tenant_slug,
      });
      return true;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for checking if user is authenticated (for protected routes)
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
