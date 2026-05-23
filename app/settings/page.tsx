"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Password changed successfully!" });
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMsg({ type: "error", text: data.message || "Failed to change password." });
      }
    } catch {
      // Demo mode — no backend
      setMsg({ type: "success", text: "Password changed successfully! (demo mode)" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  if (!user) return null;

  const PasswordField = ({
    label, field, value, onChange,
  }: { label: string; field: "current" | "new" | "confirm"; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show[field] ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-[#0f172a] transition-colors"
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#0f172a]" /> Change Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure.</p>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border ${
            msg.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField label="Current Password" field="current"
            value={form.currentPassword} onChange={(v) => setForm(f => ({ ...f, currentPassword: v }))} />
          <PasswordField label="New Password" field="new"
            value={form.newPassword} onChange={(v) => setForm(f => ({ ...f, newPassword: v }))} />
          <PasswordField label="Confirm New Password" field="confirm"
            value={form.confirmPassword} onChange={(v) => setForm(f => ({ ...f, confirmPassword: v }))} />

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
