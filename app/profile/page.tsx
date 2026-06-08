"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { backendFetch } from "@/lib/backend";
import { getDefaultAvatarUrl } from "@/lib/avatar";
import {
  User, Mail, Phone, MapPin, Save, CreditCard,
  Plus, Trash2, Package, ChevronRight, Edit2,
  Check, X, Camera, Loader2, AlertCircle, Trash,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

// ── Reusable Avatar component ──────────────────────────────────
function AvatarImage({
  src, name, size = 80, className = "",
}: { src?: string; name: string; size?: number; className?: string }) {
  const [errored, setErrored] = useState(false);
  const fallback = getDefaultAvatarUrl(name);
  return (
    <img
      src={(!src || errored) ? fallback : src}
      alt={name}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={`object-cover rounded-2xl ${className}`}
    />
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [user, setUser]       = useState<any>(null);
  const [form, setForm]       = useState({ name: "", email: "", phone: "", city: "" });
  const [saved, setSaved]     = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "cards" | "address" | "orders">("profile");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError,   setAvatarError]   = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cards state
  const [cards, setCards]         = useState<any[]>([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm]   = useState({ number: "", name: "", expiry: "", type: "Visa" });

  // Address state
  const [addresses, setAddresses]       = useState<any[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm]         = useState({ label: "Home", street: "", city: "", zip: "" });

  // Orders
  const [orders, setOrders] = useState<any[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Sync from authContext user
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setForm({
        name:  authUser.name  || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        city:  authUser.city  || "",
      });
      setAvatarUrl(authUser.avatar || "");
    }
  }, [authUser]);

  useEffect(() => {
    const c = localStorage.getItem("savedCards");
    if (c) setCards(JSON.parse(c));
    const a = localStorage.getItem("savedAddresses");
    if (a) setAddresses(JSON.parse(a));
    const o = localStorage.getItem("orders");
    if (o) setOrders(JSON.parse(o));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = { name: form.name, phone: form.phone, city: form.city };

    try {
      const res = await backendFetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        setForm({ name: updatedUser.name || "", email: updatedUser.email || "", phone: updatedUser.phone || "", city: updatedUser.city || "" });
        await refreshUser();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  // Handle avatar image upload — saves to backend, not just localStorage
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setAvatarError("Only JPG, PNG, WEBP images allowed.");
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setAvatarLoading(true);
    setAvatarError("");
    setAvatarSuccess("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res  = await backendFetch("/api/auth/avatar", { method: "PUT", body: formData });
      const data = await res.json();

      if (data.success) {
        setAvatarUrl(data.avatar);
        setAvatarPreview("");
        const updated = { ...user, avatar: data.avatar };
        setUser(updated);
        await refreshUser();
        setAvatarSuccess("Profile photo updated!");
        setTimeout(() => setAvatarSuccess(""), 3000);
      } else {
        setAvatarError(data.message || "Upload failed.");
        setAvatarPreview("");
      }
    } catch {
      setAvatarError("Network error. Please try again.");
      setAvatarPreview("");
    } finally {
      setAvatarLoading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove avatar — reset to default
  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    setAvatarError("");
    setAvatarSuccess("");
    try {
      const res  = await backendFetch("/api/auth/avatar", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAvatarUrl("");
        setAvatarPreview("");
        const updated = { ...user, avatar: "" };
        setUser(updated);
        await refreshUser();
        setAvatarSuccess("Photo removed.");
        setTimeout(() => setAvatarSuccess(""), 3000);
      }
    } catch {
      setAvatarError("Could not remove photo.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard = { ...cardForm, id: Date.now(), last4: cardForm.number.slice(-4) };
    const updated = [...cards, newCard];
    setCards(updated);
    localStorage.setItem("savedCards", JSON.stringify(updated));
    setCardForm({ number: "", name: "", expiry: "", type: "Visa" });
    setShowCardForm(false);
  };

  const removeCard = (id: number) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    localStorage.setItem("savedCards", JSON.stringify(updated));
  };

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr = { ...addrForm, id: Date.now() };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
    setAddrForm({ label: "Home", street: "", city: "", zip: "" });
    setShowAddrForm(false);
  };

  const removeAddress = (id: number) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("savedAddresses", JSON.stringify(updated));
  };

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#0f172a]" />
    </div>
  );

  const statusColor: Record<string, string> = {
    pending:   "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped:   "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const tabs = [
    { key: "profile", label: "My Profile",  Icon: User       },
    { key: "cards",   label: "Saved Cards", Icon: CreditCard },
    { key: "address", label: "My Address",  Icon: MapPin     },
    { key: "orders",  label: "My Orders",   Icon: Package    },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* ── Header card ── */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-lg">
        <div className="relative flex-shrink-0">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {/* Avatar image */}
          <AvatarImage
            src={avatarPreview || avatarUrl}
            name={user.name || "User"}
            size={80}
            className="w-20 h-20 rounded-2xl border-4 border-[#3b82f6]/50 bg-[#001f24]"
          />
          {/* Camera button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Change photo"
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#3b82f6] hover:bg-[#2563eb] rounded-full border-2 border-white flex items-center justify-center transition-colors shadow-md"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div>
          <h1 className="text-white font-black text-xl">{user.name}</h1>
          <p className="text-[#3b82f6] text-sm">{user.email}</p>
          {user.city && <p className="text-gray-400 text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{user.city}</p>}
          <p className="text-gray-500 text-xs mt-1 cursor-pointer hover:text-[#3b82f6] transition-colors" onClick={() => fileInputRef.current?.click()}>
            Tap camera to change photo
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === key
                ? "bg-[#0f172a] text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-[#0f172a]/30"
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-[#0f172a]" /> Edit Profile
          </h2>
          {saved && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {[
              { label: "Full Name",     field: "name",  type: "text",  Icon: User,   placeholder: "Ahmed Khan"       },
              { label: "Email Address", field: "email", type: "email", Icon: Mail,   placeholder: "you@example.com"  },
              { label: "Phone Number",  field: "phone", type: "tel",   Icon: Phone,  placeholder: "03XX-XXXXXXX"     },
            ].map(({ label, field, type, Icon: Ic, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Ic className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={type} value={(form as any)[field]} placeholder={placeholder}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#0f172a] transition-colors" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#0f172a] transition-colors appearance-none bg-white">
                  <option value="">Select city...</option>
                  {["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta","Multan"].map(c =>
                    <option key={c}>{c}</option>
                  )}
                </select>
              </div>
            </div>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </form>
        </div>
      )}

      {/* ── Saved Cards Tab ── */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{card.type} •••• {card.last4}</p>
                  <p className="text-xs text-gray-400">{card.name} · Expires {card.expiry}</p>
                </div>
              </div>
              <button onClick={() => removeCard(card.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {!showCardForm ? (
            <button onClick={() => setShowCardForm(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#0f172a] text-gray-500 hover:text-[#0f172a] py-4 rounded-2xl font-semibold text-sm transition-all">
              <Plus className="w-4 h-4" /> Add New Card
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Add New Card</h3>
                <button onClick={() => setShowCardForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={addCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Type</label>
                  <select value={cardForm.type} onChange={(e) => setCardForm({ ...cardForm, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f172a]">
                    {["Visa","Mastercard","JazzCash","EasyPaisa"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                  <input type="text" required maxLength={16} placeholder="1234 5678 9012 3456"
                    value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, "") })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                  <input type="text" required placeholder="Ahmed Khan"
                    value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                  <input type="text" required placeholder="MM/YY" maxLength={5}
                    value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
                </div>
                <button type="submit"
                  className="w-full bg-[#0f172a] text-white py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors">
                  Save Card
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Address Tab ── */}
      {activeTab === "address" && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0f172a]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#0f172a]" />
                </div>
                <div>
                  <span className="inline-block bg-[#3b82f6]/20 text-[#0f172a] text-xs font-bold px-2 py-0.5 rounded-full mb-1">{addr.label}</span>
                  <p className="text-sm font-medium text-gray-800">{addr.street}</p>
                  <p className="text-xs text-gray-500">{addr.city}{addr.zip ? ` - ${addr.zip}` : ""}</p>
                </div>
              </div>
              <button onClick={() => removeAddress(addr.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {!showAddrForm ? (
            <button onClick={() => setShowAddrForm(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#0f172a] text-gray-500 hover:text-[#0f172a] py-4 rounded-2xl font-semibold text-sm transition-all">
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Add New Address</h3>
                <button onClick={() => setShowAddrForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={addAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Label</label>
                  <div className="flex gap-2">
                    {["Home","Office","Other"].map(l => (
                      <button key={l} type="button" onClick={() => setAddrForm({ ...addrForm, label: l })}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                          addrForm.label === l ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-300 text-gray-600 hover:border-[#0f172a]"
                        }`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input type="text" required placeholder="House #, Street, Area"
                    value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                    <select value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f172a]">
                      <option value="">Select...</option>
                      {["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta","Multan"].map(c =>
                        <option key={c}>{c}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code</label>
                    <input type="text" placeholder="75500"
                      value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f172a]" />
                  </div>
                </div>
                <button type="submit"
                  className="w-full bg-[#0f172a] text-white py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors">
                  Save Address
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── Orders Tab ── */}
      {activeTab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-700 mb-2">No orders yet</h2>
              <p className="text-gray-400 text-sm mb-5">Aap ne abhi tak koi cheez nahi kharidi.</p>
              <Link href="/listings"
                className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors text-sm">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Order #{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 mb-2">
                      {item.image && <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty} × Rs {item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                    <p className="text-sm font-bold text-[#0f172a]">Total: Rs {order.total?.toLocaleString()}</p>
                    <Link href={`/orders/${order.id}`}
                      className="flex items-center gap-1 text-xs text-[#0f172a] font-semibold hover:underline">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
