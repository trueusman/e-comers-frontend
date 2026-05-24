"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { backendFetch } from "@/lib/backend";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing in with Google...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Google login failed: no token received.");
      return;
    }

    localStorage.setItem("token", token);

    const fetchUser = async () => {
      try {
        const res = await backendFetch("/api/auth/me");
        const data = await res.json();

        if (data.success && data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("userChanged"));
          router.replace("/");
        } else {
          setMessage(data.message || "Unable to load Google user profile.");
        }
      } catch (error) {
        setMessage("Unable to verify Google login with the backend.");
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Google sign-in</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
