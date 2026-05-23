"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Smartphone, Laptop, Tablet, Plug, Car, Bike,
  Sofa, Home, Trophy, Sparkles, Leaf, Shirt,
  Plus, LogOut, X, ChevronDown, LogIn,
  Watch, ShoppingBag, Utensils, User, MapPin,
  Package, Heart, ShoppingCart, Settings, Search,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";

const NAV_CATS = [
  {
    label: "Electronics", slug: "smartphones", Icon: Smartphone,
    sub: [
      { label: "Smartphones",        slug: "smartphones",        Icon: Smartphone },
      { label: "Laptops",            slug: "laptops",            Icon: Laptop     },
      { label: "Tablets",            slug: "tablets",            Icon: Tablet     },
      { label: "Mobile Accessories", slug: "mobile-accessories", Icon: Plug       },
    ],
  },
  {
    label: "Vehicles", slug: "vehicle", Icon: Car,
    sub: [
      { label: "Cars",        slug: "vehicle",    Icon: Car  },
      { label: "Motorcycles", slug: "motorcycle", Icon: Bike },
    ],
  },
  {
    label: "Home & Living", slug: "furniture", Icon: Sofa,
    sub: [
      { label: "Furniture",       slug: "furniture",           Icon: Sofa     },
      { label: "Home Decoration", slug: "home-decoration",     Icon: Home     },
      { label: "Kitchen",         slug: "kitchen-accessories", Icon: Utensils },
    ],
  },
  {
    label: "Fashion", slug: "womens-dresses", Icon: Shirt,
    sub: [
      { label: "Women's Dresses", slug: "womens-dresses", Icon: Shirt       },
      { label: "Women's Bags",    slug: "womens-bags",    Icon: ShoppingBag },
      { label: "Men's Shirts",    slug: "mens-shirts",    Icon: Shirt       },
      { label: "Men's Watches",   slug: "mens-watches",   Icon: Watch       },
      { label: "Sunglasses",      slug: "sunglasses",     Icon: Sparkles    },
    ],
  },
  {
    label: "Beauty", slug: "beauty", Icon: Sparkles,
    sub: [
      { label: "Beauty",     slug: "beauty",     Icon: Sparkles },
      { label: "Skin Care",  slug: "skin-care",  Icon: Leaf     },
      { label: "Fragrances", slug: "fragrances", Icon: Sparkles },
    ],
  },
  {
    label: "Sports", slug: "sports-accessories", Icon: Trophy,
    sub: [
      { label: "Sports Accessories", slug: "sports-accessories", Icon: Trophy   },
      { label: "Groceries",          slug: "groceries",          Icon: Utensils },
    ],
  },
];

const CITIES = ["All Pakistan","Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta","Multan"];

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    ["#6366f1","#4f46e5"], ["#ec4899","#db2777"], ["#f59e0b","#d97706"],
    ["#10b981","#059669"], ["#3b82f6","#2563eb"], ["#8b5cf6","#7c3aed"],
    ["#ef4444","#dc2626"], ["#14b8a6","#0d9488"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [location,    setLocation]    = useState("All Pakistan");
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [user,        setUser]        = useState<any>(null);
  const [userMenuOpen,setUserMenuOpen]= useState(false);
  const [loginPopup,  setLoginPopup]  = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [locMenuOpen, setLocMenuOpen] = useState(false);
  const [orderCount,  setOrderCount]  = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const popupRef    = useRef<HTMLDivElement>(null);
  const catRef      = useRef<HTMLDivElement>(null);
  const locRef      = useRef<HTMLDivElement>(null);

  const { cartCount } = useCart();
  const isHidden = ["/login", "/register"].includes(pathname);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const syncOrders = () => {
      try {
        const o = localStorage.getItem("orders");
        setOrderCount(o ? JSON.parse(o).length : 0);
      } catch { setOrderCount(0); }
    };
    syncOrders();

    const syncUser = () => {
      const s = localStorage.getItem("user");
      setUser(s ? JSON.parse(s) : null);
      syncOrders();
    };
    window.addEventListener("storage", syncUser);
    window.addEventListener("userChanged", syncUser);
    window.addEventListener("ordersChanged", syncOrders);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("userChanged", syncUser);
      window.removeEventListener("ordersChanged", syncOrders);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (catRef.current      && !catRef.current.contains(e.target as Node))      setCatMenuOpen(false);
      if (locRef.current      && !locRef.current.contains(e.target as Node))      setLocMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setLoginPopup(false);
    };
    if (loginPopup) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [loginPopup]);

  useEffect(() => {
    document.body.style.overflow = loginPopup ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [loginPopup]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    else router.push("/listings");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const handleSellClick = (e: React.MouseEvent) => {
    if (!user) { e.preventDefault(); setLoginPopup(true); }
  };

  // Avatar helper inline — shows uploaded photo if available, else initials
  const Avatar = ({ name, photo, size = "sm" }: { name: string; photo?: string; size?: "sm" | "md" | "lg" }) => {
    const [bg, ring] = getAvatarColor(name);
    const cls = size === "sm" ? "w-7 h-7 text-[11px]" : size === "md" ? "w-10 h-10 text-sm" : "w-14 h-14 text-lg";
    if (photo) {
      return (
        <img src={photo} alt={name}
          className={`${cls} rounded-full object-cover flex-shrink-0 border-2 border-white/20`} />
      );
    }
    return (
      <div className={`${cls} rounded-full flex items-center justify-center text-white font-black flex-shrink-0`}
        style={{ background: `linear-gradient(135deg, ${bg}, ${ring})` }}>
        {getInitials(name)}
      </div>
    );
  };

  return (
    <>
      {!isHidden && (
        <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4">

            {/* ══ ROW 1: Logo + Right icons ══ */}
            <div className="flex items-center gap-3 h-[56px]">

              {/* Logo */}
              <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                <img
                  src="/usmanhub.logo-removebg-preview.png"
                  alt="Usman Store"
                  className="h-12 w-12 rounded-full object-contain"
                />
                <span className="hidden sm:inline-block text-white text-lg font-black tracking-wide">Usman Store</span>
              </Link>

              <div className="flex-1" />

              {/* Desktop right icons */}
              <div className="hidden md:flex items-center gap-1">
                {/* User menu */}
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                      <Avatar name={user.name || "U"} photo={user.avatar} size="sm" />
                      <span className="text-sm font-medium hidden lg:block">{user.name?.split(" ")[0]}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-11 w-52 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-white/10 mb-1 flex items-center gap-3">
                          <Avatar name={user.name || "U"} photo={user.avatar} size="md" />
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                          </div>
                        </div>
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                          <User className="w-4 h-4 text-[#3b82f6]" /> My Profile
                        </Link>
                        <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                          <Package className="w-4 h-4 text-[#3b82f6]" /> Orders
                        </Link>
                        <Link href="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                          <Heart className="w-4 h-4 text-[#3b82f6]" /> Wishlist
                        </Link>
                        <Link href="/cart" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                          <ShoppingCart className="w-4 h-4 text-[#3b82f6]" /> Cart
                        </Link>
                        <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                          <Settings className="w-4 h-4 text-[#3b82f6]" /> Settings
                        </Link>
                        <hr className="my-1 border-white/10" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/8 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                      <User className="w-5 h-5" />
                      <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-11 w-64 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl py-4 z-50">
                        <div className="px-4 mb-4 text-center">
                          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                            <User className="w-7 h-7 text-gray-400" />
                          </div>
                          <p className="text-white font-semibold text-sm">Welcome to Usman Store</p>
                          <p className="text-gray-400 text-xs mt-1">Login to access your account</p>
                        </div>
                        <div className="px-4 flex flex-col gap-2">
                          <Link href="/login" onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#2563eb] transition-colors">
                            <LogIn className="w-4 h-4" /> Login
                          </Link>
                          <Link href="/register" onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center justify-center gap-2 border border-[#3b82f6] text-[#3b82f6] py-2.5 rounded-lg font-semibold text-sm hover:bg-[#3b82f6]/10 transition-colors">
                            <User className="w-4 h-4" /> Sign Up
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cart */}
                <Link href="/cart" className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/8 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#3b82f6] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* SELL */}
                <Link href="/post-ad" onClick={handleSellClick}
                  className="flex items-center gap-1.5 bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#2563eb] transition-all ml-1 whitespace-nowrap">
                  <Plus className="w-4 h-4" strokeWidth={2.5} /> SELL
                </Link>
              </div>

              {/* Mobile icons */}
              <div className="flex md:hidden items-center gap-2">

                {/* Mobile Orders button with count badge */}
                {user ? (
                  <Link href="/orders" className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 active:bg-white/20">
                    <Package className="w-5 h-5 text-gray-300" />
                    {orderCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#3b82f6] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {orderCount > 9 ? "9+" : orderCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link href="/login" className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 active:bg-white/20">
                    <User className="w-5 h-5 text-gray-300" />
                  </Link>
                )}

                {/* Search button */}
                <button
                  onTouchEnd={(e) => { e.preventDefault(); setSearchOpen(!searchOpen); setMenuOpen(false); }}
                  onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 active:bg-white/20 text-gray-300">
                  {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </button>

                {/* Hamburger menu button */}
                <button
                  onTouchEnd={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); setSearchOpen(false); }}
                  onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 active:bg-white/20">
                  {menuOpen
                    ? <X className="w-5 h-5 text-[#3b82f6]" />
                    : <svg viewBox="0 0 80 80" width={18} height={18}>
                        <rect width={80} height={15} fill="#3b82f6" rx={10} />
                        <rect y={30} width={80} height={15} fill="#3b82f6" rx={10} />
                        <rect y={60} width={80} height={15} fill="#3b82f6" rx={10} />
                      </svg>
                  }
                </button>
              </div>
            </div>
            {/* ══ END ROW 1 ══ */}

            {/* ══ ROW 2: OLX-style search bar — desktop only ══ */}
            <div className="hidden md:flex items-center gap-0 pb-3">

              {/* ── Integrated search box ── */}
              <form onSubmit={handleSearch} className="flex-1 flex items-stretch h-10 rounded-lg overflow-visible">

                {/* Categories pill */}
                <div className="relative flex-shrink-0" ref={catRef}>
                  <button
                    type="button"
                    onClick={() => { setCatMenuOpen(!catMenuOpen); setLocMenuOpen(false); }}
                    className={`flex items-center gap-1.5 h-10 px-3 bg-white text-gray-700 text-sm font-medium border border-r-0 border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors whitespace-nowrap ${catMenuOpen ? "bg-gray-50" : ""}`}
                  >
                    <svg viewBox="0 0 80 80" width={13} height={13} className="text-gray-500">
                      <rect width={80} height={15} fill="currentColor" rx={6} />
                      <rect y={30} width={80} height={15} fill="currentColor" rx={6} />
                      <rect y={60} width={80} height={15} fill="currentColor" rx={6} />
                    </svg>
                    <span className="hidden lg:inline">All Categories</span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${catMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {catMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl w-[600px] p-4">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {NAV_CATS.map((cat) => (
                          <div key={cat.slug}>
                            <p className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest mb-1.5 px-1">{cat.label}</p>
                            {cat.sub.map((sub) => (
                              <Link key={sub.slug} href={`/listings?category=${sub.slug}`}
                                onClick={() => setCatMenuOpen(false)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                                <sub.Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-3 grid grid-cols-4 gap-2">
                        <Link href="/cart" onClick={() => setCatMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 hover:text-gray-900 transition-colors border border-gray-200">
                          <ShoppingCart className="w-3.5 h-3.5 text-[#3b82f6]" /> Cart
                          {cartCount > 0 && <span className="ml-0.5 bg-[#3b82f6] text-white text-[9px] font-bold px-1 rounded-full">{cartCount}</span>}
                        </Link>
                        <Link href="/wishlist" onClick={() => setCatMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 hover:text-gray-900 transition-colors border border-gray-200">
                          <Heart className="w-3.5 h-3.5 text-[#3b82f6]" /> Wishlist
                        </Link>
                        <Link href="/orders" onClick={() => setCatMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 hover:text-gray-900 transition-colors border border-gray-200">
                          <Package className="w-3.5 h-3.5 text-[#3b82f6]" /> Orders
                        </Link>
                        <Link href="/post-ad" onClick={(e) => { setCatMenuOpen(false); handleSellClick(e); }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-xs text-white font-bold transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Post Ad
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px bg-gray-300 flex-shrink-0" />

                {/* Location pill */}
                <div className="relative flex-shrink-0" ref={locRef}>
                  <button
                    type="button"
                    onClick={() => { setLocMenuOpen(!locMenuOpen); setCatMenuOpen(false); }}
                    className="flex items-center gap-1.5 h-10 px-3 bg-white text-gray-700 text-sm border border-x-0 border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0" />
                    <span className="max-w-[100px] truncate">{location}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${locMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {locMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl py-1 min-w-[160px]">
                      {CITIES.map((city) => (
                        <button key={city} onClick={() => { setLocation(city); setLocMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            location === city ? "text-[#3b82f6] bg-blue-50 font-medium" : "text-gray-700 hover:bg-gray-50"
                          }`}>
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px bg-gray-300 flex-shrink-0" />

                {/* Search input */}
                <input
                  type="text"
                  placeholder="Find Cars, Mobile Phones and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-10 bg-white outline-none text-gray-800 text-sm placeholder-gray-400 px-4 border border-x-0 border-gray-300"
                />

                {/* Search button */}
                <button
                  type="submit"
                  className="flex items-center gap-2 h-10 px-5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-bold rounded-r-lg transition-colors flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </form>
            </div>
            {/* ══ END ROW 2 ══ */}

          </div>
          {/* ══ END max-w container ══ */}

          {/* Mobile search */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-16 opacity-100" : "max-h-0 opacity-0"}`}>
            <form onSubmit={(e) => { handleSearch(e); setSearchOpen(false); }}
              className="flex items-center gap-3 px-4 py-2 border-t border-white/5 bg-[#0f172a]">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={searchOpen}
                className="flex-1 bg-white/8 border border-white/10 rounded-lg px-3 py-2 outline-none text-white text-sm placeholder-gray-500"
              />
              <button type="submit"
                className="bg-[#3b82f6] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#2563eb] transition-colors">
                Go
              </button>
            </form>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-white/5 bg-[#0f172a] px-4 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                <MapPin className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                <select value={location} onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-300 text-sm cursor-pointer">
                  {CITIES.map(c => <option key={c} className="bg-[#1e293b]">{c}</option>)}
                </select>
              </div>

              {user ? (
                <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 flex-1">
                    <Avatar name={user.name || "U"} photo={user.avatar} size="sm" />
                    <div>
                      <p className="text-white font-medium text-sm">{user.name}</p>
                      <p className="text-gray-400 text-xs">View Profile</p>
                    </div>
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center gap-1.5 text-red-400 text-xs font-medium active:text-red-300 p-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center bg-white/8 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-white/15 transition-colors border border-white/10">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center border border-[#3b82f6] text-[#3b82f6] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3b82f6]/10 transition-colors">
                    Register
                  </Link>
                </div>
              )}

              <Link href="/post-ad" onClick={(e) => { setMenuOpen(false); handleSellClick(e); }}
                className="flex items-center justify-center gap-2 bg-[#3b82f6] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#2563eb] transition-colors">
                <Plus className="w-4 h-4" /> Post Free Ad
              </Link>

              {NAV_CATS.map((cat) => (
                <div key={cat.slug}>
                  <p className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-widest mb-2 px-1">{cat.label}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {cat.sub.map((sub) => (
                      <Link key={sub.slug} href={`/listings?category=${sub.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-center border border-white/8">
                        <sub.Icon className="w-5 h-5 text-[#3b82f6]" />
                        <span className="text-[10px] text-gray-400 leading-tight">{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </header>
      )}

      {/* Login Required Popup */}
      {loginPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div ref={popupRef} className="bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
            <button onClick={() => setLoginPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-black text-white text-center mb-1">Login Required</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              Ad post karne ke liye pehle login karein ya naya account banayein.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setLoginPopup(false)}
                className="w-full bg-[#3b82f6] text-white py-3 rounded-xl font-bold text-center hover:bg-[#2563eb] transition-colors">
                Login
              </Link>
              <Link href="/register" onClick={() => setLoginPopup(false)}
                className="w-full border border-[#3b82f6] text-[#3b82f6] py-3 rounded-xl font-semibold text-center hover:bg-[#3b82f6]/10 transition-colors">
                Register — It&apos;s Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
