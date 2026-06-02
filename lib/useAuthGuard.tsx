"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * useAuthGuard — login check karta hai
 * agar user logged in nahi hai to login popup dikhata hai
 * agar logged in hai to action run karta hai
 */
export function useAuthGuard() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    check();
    window.addEventListener("userChanged", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("userChanged", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  // Guard function — action sirf tab run hoga jab logged in ho
  const guard = useCallback(
    (action?: () => void) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowLoginModal(true);
        return false;
      }
      if (action) action();
      return true;
    },
    []
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

  return { guard, isLoggedIn, showLoginModal, closeModal, goToLogin, goToRegister };
}
