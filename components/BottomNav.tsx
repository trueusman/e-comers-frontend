"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Plus, Heart, User, LogOut, LogIn, X, Package, Bell, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Initials avatar helpers
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

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profilePopup, setProfilePopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Login / Register pages pe BottomNav mat dikhao
  const hideOnPaths = ["/login", "/register"];
  const isHidden = hideOnPaths.includes(pathname);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const syncUser = () => {
      const s = localStorage.getItem("user");
      setUser(s ? JSON.parse(s) : null);
    };
    window.addEventListener("storage", syncUser);
    window.addEventListener("userChanged", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("userChanged", syncUser);
    };
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node))
        setProfilePopup(false);
    };
    if (profilePopup) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profilePopup]);

  // Lock scroll when popup open
  useEffect(() => {
    document.body.style.overflow = profilePopup ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [profilePopup]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfilePopup(false);
    router.push("/");
    router.refresh();
  };

  const tabs = [
    { label: "Home",   href: "/",         Icon: Home   },
    { label: "Browse", href: "/listings", Icon: Search },
    { label: "Sell",   href: "/post-ad",  Icon: Plus, special: true },
    { label: "Saved",  href: "#",         Icon: Heart  },
    { label: user ? user.name?.split(" ")[0] : "Profile", href: "#", Icon: User, isProfile: true },
  ];

  return (
    <>
      {!isHidden && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
          <div className="flex items-center justify-around px-2 py-1">
            {tabs.map(({ label, href, Icon, special, isProfile }) => {
              const isActive = pathname === href;

              if (special) {
                return (
                  <Link key={label} href={href}
                    className="group relative flex flex-col items-center -mt-5">
                    <div className="w-14 h-14 rounded-full bg-[#0f172a] flex items-center justify-center shadow-lg border-4 border-white group-hover:bg-[#1e293b] transition-colors">
                      <Icon className="w-6 h-6 text-[#3b82f6]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-semibold text-[#0f172a] mt-0.5">{label}</span>
                  </Link>
                );
              }

              if (isProfile) {
                return (
                  <button key={label}
                    onClick={() => setProfilePopup(true)}
                    className="group relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      profilePopup ? "ring-2 ring-[#3b82f6]" : ""
                    }`}>
                      {user ? (
                        (() => {
                          const [bg, ring] = getAvatarColor(user.name || "U");
                          return (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
                              style={{ background: `linear-gradient(135deg, ${bg}, ${ring})` }}>
                              {getInitials(user.name || "U")}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${
                      profilePopup ? "text-[#0f172a] font-bold" : "text-gray-400"
                    }`}>
                      {label}
                    </span>
                  </button>
                );
              }

              return (
                <Link key={label} href={href}
                  className="group relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors">

                  {/* Tooltip */}
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold shadow-md whitespace-nowrap transition-all duration-200 ease-out group-hover:scale-100">
                    {label}
                  </span>

                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    isActive
                      ? "bg-[#0f172a]/10 text-[#0f172a]"
                      : "text-gray-400 group-hover:text-[#0f172a]"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-[#0f172a] font-bold" : "text-gray-400"
                  }`}>
                    {label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* ── Profile Popup ─────────────────────────────────── */}
      {!isHidden && profilePopup && (
        <div className="lg:hidden fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div ref={popupRef} className="bg-white rounded-t-2xl shadow-2xl w-full max-w-md p-6 pb-10 relative animate-slide-up">
            <button onClick={() => setProfilePopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-4 mb-5">
                  {(() => {
                    const [bg, ring] = getAvatarColor(user.name || "U");
                    return (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${bg}, ${ring})` }}>
                        {getInitials(user.name || "U")}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <Link href="/profile" onClick={() => setProfilePopup(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 text-[#0f172a]" /> My Profile
                  </Link>
                  <Link href="/orders" onClick={() => setProfilePopup(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Package className="w-4 h-4 text-[#0f172a]" /> Orders
                  </Link>
                  <Link href="/settings" onClick={() => setProfilePopup(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-[#0f172a]" /> Settings
                  </Link>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#0f172a]/10 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-[#0f172a]" />
                </div>
                <h2 className="text-xl font-black text-gray-900 text-center mb-1">Welcome</h2>
                <p className="text-gray-500 text-sm text-center mb-6">
                  Login karein ya naya account banayein
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setProfilePopup(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1e293b] transition-colors">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setProfilePopup(false)}
                    className="w-full flex items-center justify-center gap-2 border-2 border-[#0f172a] text-[#0f172a] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                    Register — It&apos;s Free
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
