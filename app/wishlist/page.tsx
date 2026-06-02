"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useAuthGuard } from "@/lib/useAuthGuard";
import LoginModal from "@/components/LoginModal";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const { guard, showLoginModal, closeModal, goToLogin, goToRegister } = useAuthGuard();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      guard(); // show login modal
      return;
    }
    setUser(JSON.parse(stored));
    const saved = localStorage.getItem("wishlist");
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const removeItem = (id: string) => {
    const updated = wishlist.filter((item) => item._id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  if (!user) return (
    <>
      {showLoginModal && <LoginModal onClose={closeModal} onLogin={goToLogin} onRegister={goToRegister} />}
    </>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-black text-gray-900">My Wishlist</h1>
        <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">
          {wishlist.length} items
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 text-sm mb-6">Save items you love by clicking the heart icon on any product.</p>
          <Link href="/listings"
            className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors">
            <ShoppingBag className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div key={item._id} className="relative group">
              <ProductCard listing={item} />
              <button
                onClick={() => removeItem(item._id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
