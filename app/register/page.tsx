"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email,
          phone: form.phone, password: form.password, city: form.city,
        }),
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
            <div className="bg-[#0f172a] rounded-full p-4 inline-flex items-center justify-center border border-white/10">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-white p-2">
                <img
                  src="/usmanhub.logo-removebg-preview.png"
                  alt="Usman Store"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Create your Usman Store account and start selling today</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required placeholder="Ahmed Khan" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" required placeholder="03XX-XXXXXXX" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]">
                <option value="">Select city...</option>
                {["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta","Multan"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" required placeholder="Repeat password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#0f172a] text-white py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0f172a] font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
