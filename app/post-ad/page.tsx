"use client";

import { useState, useEffect, useRef } from "react";
import { categories } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { backendFetch } from "@/lib/backend";
import { useAuth } from "@/lib/authContext";
import { useAuthGuard } from "@/lib/useAuthGuard";
import LoginModal from "@/components/LoginModal";
import {
  Smartphone, Car, Home, Shirt, Sofa, BookOpen,
  Trophy, Briefcase, Package, PartyPopper, Rocket,
  ImagePlus, X, Upload,
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
  other:       Package,
};

export default function PostAdPage() {
  const router  = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { guard, showLoginModal, closeModal, goToLogin, goToRegister } = useAuthGuard();

  const [step, setStep]           = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [newListingId, setNewListingId] = useState("");

  // Images
  const [imageFiles, setImageFiles]       = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    category: "", title: "", description: "",
    price: "", condition: "", location: "", phone: "",
  });

  // Check login on mount
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      guard();
    }
  }, [authLoading, isAuthenticated]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Image handling ──
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowed  = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const valid    = files.filter((f) => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024);
    const combined = [...imageFiles, ...valid].slice(0, 5); // max 5 images

    setImageFiles(combined);
    const previews = combined.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);

    // reset input so same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const newFiles    = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("Please login first to post an ad.");
      guard();
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Map any old/invalid category slug to a valid backend enum
      const CATEGORY_NORMALIZE: Record<string, string> = {
        electronics: "electronics", smartphones: "electronics", laptops: "electronics",
        tablets: "electronics", "mobile-accessories": "electronics",
        vehicles: "vehicles", vehicle: "vehicles", motorcycle: "vehicles", motorcycles: "vehicles",
        cars: "vehicles", car: "vehicles",
        property: "property",
        fashion: "fashion", beauty: "fashion", "skin-care": "fashion",
        "womens-dresses": "fashion", "womens-bags": "fashion",
        furniture: "furniture", "home-decoration": "furniture", "home-decor": "furniture",
        books: "books",
        sports: "sports", "sports-accessories": "sports",
        jobs: "jobs",
        other: "other",
      };
      const normalizedCategory = CATEGORY_NORMALIZE[form.category] ?? "other";

      // Upload all images at once via /upload/multiple
      let uploadedImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const imgData = new FormData();
        imageFiles.forEach((file) => imgData.append("images", file));

        try {
          const imgRes  = await backendFetch("/upload/multiple", { method: "POST", body: imgData });
          const imgJson = await imgRes.json();
          if (imgJson.images?.length) {
            uploadedImageUrls = imgJson.images.map((img: any) => img.url);
          }
        } catch {
          // If Cloudinary upload fails, post without images
        }
      }

      const res = await backendFetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: normalizedCategory,
          price:    Number(form.price),
          images:   uploadedImageUrls,
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

  // ── Success screen ──
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
          <button onClick={() => {
            setSubmitted(false); setStep(1);
            setImageFiles([]); setImagePreviews([]);
            setForm({ category:"",title:"",description:"",price:"",condition:"",location:"",phone:"" });
          }}
            className="border border-[#0f172a] text-[#0f172a] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Post Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {showLoginModal && <LoginModal onClose={closeModal} onLogin={goToLogin} onRegister={goToRegister} />}

      <div className="mb-6">
        <nav className="text-sm text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#0f172a]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">Post an Ad</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Post Your Ad</h1>
        <p className="text-gray-500 text-sm mt-1">It&apos;s free and takes less than 2 minutes.</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[{ num: 1, label: "Category" }, { num: 2, label: "Details" }, { num: 3, label: "Contact" }].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s.num ? "bg-[#0f172a] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s.num ? "text-[#0f172a] font-medium" : "text-gray-400"}`}>
                {s.label}
              </span>
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

        {/* ── Step 1: Category ── */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Choose a Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] ?? Package;
                return (
                  <button key={cat.slug} type="button" onClick={() => update("category", cat.slug)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      form.category === cat.slug ? "border-[#0f172a] bg-[#0f172a]/5" : "border-gray-200 hover:border-gray-400"
                    }`}>
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

        {/* ── Step 2: Details + Images ── */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-bold text-gray-800">Ad Details</h2>

            {/* ── Product Images ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images <span className="text-gray-400 font-normal">(up to 5, max 5MB each)</span>
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageAdd}
              />

              <div className="flex flex-wrap gap-3">
                {/* Image previews */}
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-[#0f172a]/20 bg-gray-50 flex-shrink-0">
                    <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-[#0f172a]/70 text-white py-0.5">
                        MAIN
                      </span>
                    )}
                  </div>
                ))}

                {/* Add image button */}
                {imagePreviews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0f172a] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#0f172a] transition-colors flex-shrink-0"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Add Photo</span>
                  </button>
                )}
              </div>

              {imagePreviews.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  First image will be the main cover photo shown in listings.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Title <span className="text-red-500">*</span>
              </label>
              <input type="text" required placeholder="e.g. iPhone 14 Pro Max 256GB" value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea required rows={4} placeholder="Describe your item in detail..." value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a] resize-none" />
            </div>

            {/* Price + Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input type="number" required placeholder="0" value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select required value={form.condition} onChange={(e) => update("condition", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]">
                  <option value="">Select...</option>
                  <option>New</option><option>Used</option><option>Refurbished</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select required value={form.location} onChange={(e) => update("location", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]">
                <option value="">Select city...</option>
                {["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta","Multan"].map(c =>
                  <option key={c}>{c}</option>
                )}
              </select>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                ← Back
              </button>
              <button type="button"
                disabled={!form.title || !form.description || !form.price || !form.condition || !form.location}
                onClick={() => setStep(3)}
                className="flex-1 bg-[#0f172a] text-white py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Contact ── */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-bold text-gray-800">Contact Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input type="tel" required placeholder="03XX-XXXXXXX" value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]" />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p className="font-semibold text-gray-700 mb-2">Ad Summary</p>

              {/* Image thumbnails in summary */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                  ))}
                </div>
              )}

              <p className="text-gray-600"><span className="font-medium">Category:</span> <span className="capitalize">{form.category}</span></p>
              <p className="text-gray-600"><span className="font-medium">Title:</span> {form.title}</p>
              <p className="text-gray-600"><span className="font-medium">Price:</span> PKR {Number(form.price).toLocaleString()}</p>
              <p className="text-gray-600"><span className="font-medium">Condition:</span> {form.condition}</p>
              <p className="text-gray-600"><span className="font-medium">Location:</span> {form.location}</p>
              <p className="text-gray-600"><span className="font-medium">Photos:</span> {imagePreviews.length} added</p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                ← Back
              </button>
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
