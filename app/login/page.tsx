"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("userChanged"));
        router.push("/");
        router.refresh();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0f172a] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="bg-[#0f172a] rounded-2xl px-6 py-3 inline-block">
              <img
                src="/usmanhub.logo-removebg-preview.png"
                alt="Usman Store"
                className="h-28 w-auto object-contain mx-auto rounded-full"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-[#0f172a] hover:underline">Forgot password?</a>
              </div>
              <input type="password" required placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#0f172a] text-white py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors mt-2 disabled:opacity-60">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#0f172a] font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
