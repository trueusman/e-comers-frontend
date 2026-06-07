"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { useAuth } from "@/lib/authContext";

export default function RegisterPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    avatar: null as File | null,
  });
  
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
      router.refresh();
    }
  }, [isAuthenticated, router]);

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("Minimum 8 characters");
    if (!/\d/.test(pwd)) errors.push("At least 1 number");
    if (!/[A-Z]/.test(pwd)) errors.push("At least 1 uppercase letter");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) errors.push("At least 1 special character");
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = (value: string) => {
    setForm({ ...form, password: value });
    if (value) validatePassword(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, avatar: file });
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.avatar) {
      setError("Profile image is required");
      setLoading(false);
      return;
    }

    const result = await signup({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      city: form.city,
      avatar: form.avatar,
    });

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Registration failed");
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

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
            <div className="inline-flex items-center justify-center rounded-full overflow-hidden bg-white p-2 shadow-sm">
              <img
                src="/usmanhub.logo-removebg-preview.png"
                alt="Usman Store"
                className="h-24 w-24 rounded-full object-contain"
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Join Usman Store</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account and start selling</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image *</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0f172a] transition-colors"
              >
                {preview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={preview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                    <p className="text-xs text-gray-600">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Upload profile image</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Ahmed Khan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]"
              />
              {passwordErrors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-1">
                  {passwordErrors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City (Optional)</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#0f172a]"
              >
                <option value="">Select city...</option>
                {["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Quetta", "Multan"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !form.avatar || passwordErrors.length > 0}
              className="w-full bg-[#0f172a] text-white py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors mt-4 disabled:opacity-60"
            >
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
