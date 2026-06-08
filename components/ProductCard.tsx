"use client";

import Image from "next/image";
import { Star, MapPin, Heart } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import LoginModal from "@/components/LoginModal";

interface ProductCardProps {
  listing: any;
}

const PLACEHOLDER = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80";

export default function ProductCard({ listing }: ProductCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id     = listing._id || listing.id;
  const image  = listing.images?.[0] || listing.image || PLACEHOLDER;

  const [wishlisted, setWishlisted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      const list = JSON.parse(saved);
      setWishlisted(list.some((item: any) => (item._id || item.id) === id));
    }
  }, [id]);

  const goToListing = () => {
    router.push(`/listings/${id}`);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const saved = localStorage.getItem("wishlist");
    let list = saved ? JSON.parse(saved) : [];
    if (wishlisted) {
      list = list.filter((item: any) => (item._id || item.id) !== id);
    } else {
      list.push({ ...listing, _id: id });
    }
    localStorage.setItem("wishlist", JSON.stringify(list));
    setWishlisted(!wishlisted);
  };

  return (
    <>
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => { setShowLoginModal(false); router.push("/login"); }}
          onRegister={() => { setShowLoginModal(false); router.push("/register"); }}
        />
      )}
      <div
        onClick={goToListing}
        className="group block cursor-pointer"
      >
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-200">

        {/* ── Image ─────────────────────────────────── */}
        <div className="relative h-36 bg-gray-100 overflow-hidden">
          <Image
            src={image}
            alt={listing.title}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-1.5"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized={image.startsWith("http")}
          />

          {/* Badges */}
          {listing.isFeatured && (
            <span className="absolute top-1.5 left-1.5 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              TOP
            </span>
          )}
          <span className={`absolute top-1.5 right-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
            listing.condition === "New" ? "bg-emerald-500 text-white" : "bg-white/90 text-gray-600 border border-gray-200"
          }`}>
            {listing.condition}
          </span>

          {/* Heart — always visible on mobile, hover on desktop */}
          <button
            onClick={toggleWishlist}
            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all active:scale-90"
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        {/* ── Info ──────────────────────────────────── */}
        <div className="p-2.5">
          <p className="font-black text-[#0f172a] text-sm leading-tight">
            {formatPrice(listing.price)}
          </p>
          <h3 className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-snug">
            {listing.title}
          </h3>
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100">
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400 truncate">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </span>
            {listing.rating && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-medium flex-shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {listing.rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
