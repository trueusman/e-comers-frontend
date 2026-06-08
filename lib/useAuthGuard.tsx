"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./authContext";

/**
 * useAuthGuard — uses authContext (single source of truth)
 * agar user logged in nahi hai to login popup dikhata hai
 * agar logged in hai to action run karta hai
 */
export function useAuthGuard() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Guard function — action sirf tab run hoga jab logged in ho
  const guard = useCallback(
    (action?: () => void) => {
      // Auth still loading — check localStorage as fallback
      const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");
      const loggedIn = isAuthenticated || hasToken;

      if (!loggedIn) {
        setShowLoginModal(true);
        return false;
      }
      if (action) action();
      return true;
    },
    [isAuthenticated]
  );

  const closeModal = () => setShowLoginModal(false);

  const goToLogin = () => {
    setShowLoginModal(false);
    router.push("/login");
  };

  const goToRegister = () => {
    setShowLoginModal(false);
    router.push("/register");
  };

  return {
    guard,
    isLoggedIn: isAuthenticated,
    showLoginModal,
    closeModal,
    goToLogin,
    goToRegister,
  };
}
