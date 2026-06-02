"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { backendFetch } from "@/lib/backend";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus]   = useState<Status>("loading");
  const [message, setMessage] = useState("Signing in with Google...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const error  = params.get("error");
    const detail = params.get("message");

    if (error === "google_failed" || !token) {
      setStatus("error");
      setMessage(
        detail
          ? decodeURIComponent(detail)
          : "Google sign-in failed. Check backend .env (Google credentials + MongoDB) and try again."
      );
      setTimeout(() => router.replace("/login"), 4000);
      return;
    }

    // Store token immediately
    localStorage.setItem("token", token);

    const fetchUser = async () => {
      try {
        const res  = await backendFetch("/api/auth/me");
        const data = await res.json();

        if (data.success && data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("userChanged"));
          setStatus("success");
          setMessage(`Welcome, ${data.user.name}!`);
          setTimeout(() => router.replace("/"), 1200);
        } else {
          throw new Error(data.message || "Could not load profile");
        }
      } catch (err: any) {
        localStorage.removeItem("token");
        setStatus("error");
        setMessage(err?.message || "Unable to verify Google login.");
        setTimeout(() => router.replace("/login"), 3000);
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-3xl border border-gray-200 p-10 shadow-sm text-center">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          {status === "loading" && (
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}
        </div>

        {/* Google logo */}
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>

        <h1 className="text-lg font-bold text-gray-900 mb-2">
          {status === "loading" ? "Signing in..." : status === "success" ? "Signed in!" : "Sign-in Failed"}
        </h1>
        <p className="text-gray-500 text-sm">{message}</p>

        {status === "error" && (
          <button
            onClick={() => router.replace("/login")}
            className="mt-6 w-full bg-[#0f172a] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#1e293b] transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
