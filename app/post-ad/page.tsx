"use client";

import { useState } from "react";
import { categories } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  BookOpen,
  Trophy,
  Briefcase,
  Package,
  PartyPopper,
  Rocket,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  electronics: Smartphone,
  vehicles:    Car,
  property:    Home,
  fashion:     Shirt,
  furniture:   Sofa,
  books:       BookOpen,
  sports:      Trophy,
  jobs:        Briefcase,
};

export default function PostAdPage() {
  const router = useRouter();
  const [step, setStep]           = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [newListingId, setNewListingId] = useState("");

  const [form, setForm] = useState({
    category: "", title: "", description: "",
    price: "", condition: "", location: "", phone: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first to post an ad.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          images: [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        setNewListingId(data.listing._id);
        setSubmitted(true);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ad Posted Successfully!</h2>
        <p className="text-gray-500 mb-6">Your ad is now live and visible to thousands of buyers.</p>
        <div className="flex gap-3 justify-center">
          <Link href={`/listings/${newListingId}`}
            className="bg-[#0f172a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors">
            View My Ad
          </Link>
          <button onClick={() => { setSubmitted(false); setStep(1); setForm({ category:"",title:"",description:"",price:"",condition:"",location:"",phone:"" }); }}
            className="border border-[#0f172a] text-[#0f172a] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Post Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#0f172a]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">Post an Ad</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Post Your Ad</h1>
        <p className="text-gray-500 text-sm mt-1">It&apos;s free and takes less than 2 minutes.</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[{ num: 1, label: "Category" }, { num: 2, label: "Details" }, { num: 3, label: "Contact" }].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s.num ? "bg-[#0f172a] text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s.num ? "text-[#0f172a] font-medium" : "text-gray-400"}`}>{s.label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 ${step > s.num ? "bg-[#0f172a]" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          {error.includes("login") && (
            <Link href="/login" className="ml-2 font-semibold underline">Login here</Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Choose a Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] ?? Package;
                return (
                  <button key={cat.slug} type="button" onClick={() => update("category", cat.slug)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.category === cat.slug ? "border-[#0f172a] bg-[#0f172a]/5" : "border-gray-200 hover:border-gray-400"}`}>
                    <Icon className={`w-7 h-7 ${form.category === cat.slug ? "text-[#0f172a]" : "text-gray-500"}`} />
                    <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" disabled={!form.category} onClick={() => setStep(2)}
              className="mt-6 w-full bg-[#0f172a] text-white py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-bold text-gray-800">Ad Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Title <span className="text-red-500">*</span></label>
              <input type="text" required placeholder="e.g. iPhone 14 Pro Max 256GB" value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea required rows={4} placeholder="Describe your item in detail..." value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) <span className="text-red-500">*</span></label>
                <input type="number" required placeholder="0" value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition <span className="text-red-500">*</span></label>
                <select required value={form.condition} onChange={(e) => update("condition", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]">
                  <option value="">Select...</option>
                  <option>New</option><option>Used</option><option>Refurbished</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
              <select required value={form.location} onChange={(e) => update("location", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]">
                <option value="">Select city...</option>
                {["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta","Multan"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">← Back</button>
              <button type="button" onClick={() => setStep(3)}
                disabled={!form.title || !form.description || !form.price || !form.condition || !form.location}
                className="flex-1 bg-[#0f172a] text-white py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-bold text-gray-800">Contact Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" required placeholder="03XX-XXXXXXX" value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]" />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Ad Summary</p>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Category:</span> <span className="capitalize">{form.category}</span></p>
                <p><span className="font-medium">Title:</span> {form.title}</p>
                <p><span className="font-medium">Price:</span> PKR {Number(form.price).toLocaleString()}</p>
                <p><span className="font-medium">Condition:</span> {form.condition}</p>
                <p><span className="font-medium">Location:</span> {form.location}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">← Back</button>
              <button type="submit" disabled={!form.phone || loading}
                className="flex-1 bg-[#0f172a] text-white py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Rocket className="w-4 h-4" />
                {loading ? "Posting..." : "Post Ad"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
