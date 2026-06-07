"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { backendFetch, getClientBackendBase } from "./backend";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  authType: "local" | "google";
  phone?: string;
  city?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
    avatar?: File;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await backendFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
    } catch {
      // Backend unreachable (not running locally or Render asleep) — treat as logged out
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
    avatar?: File;
  }) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone || "");
      formData.append("city", data.city || "");
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }

      const res = await fetch(`${getClientBackendBase()}/api/auth/register`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await res.json();

      if (result.success && result.user) {
        setUser(result.user);
        window.dispatchEvent(new Event("userChanged"));
        return { success: true };
      }

      return { success: false, error: result.message || "Signup failed" };
    } catch (error: any) {
      return { success: false, error: error.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const res = await fetch(`${getClientBackendBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const result = await res.json();

      if (result.success && result.user) {
        setUser(result.user);
        window.dispatchEvent(new Event("userChanged"));
        return { success: true };
      }

      return { success: false, error: result.message || "Login failed" };
    } catch (error: any) {
      return { success: false, error: error.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await backendFetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.dispatchEvent(new Event("userChanged"));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
