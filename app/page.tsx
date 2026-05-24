import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoriesSection from "@/components/CategoriesSection";
import HeroSlider from "@/components/HeroSlider";
import connectDB from "@/lib/mongoose";
import Listing from "@/models/Listing";
import { Package, Search, Camera, MessageCircle, Handshake } from "lucide-react";

async function getFeatured() {
  try {
    await connectDB();
    const listings = await Listing.find({ isActive: true, isFeatured: true })
      .populate("seller", "name phone city avatar")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    return JSON.parse(JSON.stringify(listings));
  } catch {
    return [];
  }
}

async function getRecent() {
  try {
    await connectDB();
    const listings = await Listing.find({ isActive: true })
      .populate("seller", "name phone city avatar")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return JSON.parse(JSON.stringify(listings));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, recent] = await Promise.all([getFeatured(), getRecent()]);

  return (
    <div>
      {/* Hero Banner */}
      <HeroSlider />

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-8 text-center">
          {[
            { label: "Total Products", value: "194+" },
            { label: "Categories",     value: "24+"  },
            { label: "Brands",         value: "50+"  },
            { label: "Daily Visitors", value: "500K+" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-black text-[#0f172a]">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <CategoriesSection />

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Top Rated Picks</h2>
          <Link href="/listings" className="text-sm text-[#0f172a] font-medium hover:underline">View all →</Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {featured.map((p: any) => <ProductCard key={p._id} listing={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No featured products.</p>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80')" }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-[#0f172a]/70 to-[#3b82f6]/60" />

          {/* Content */}
          <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-2xl font-black mb-2 drop-shadow">Boost your listing on Usman Store</h3>
              <p className="text-gray-200 text-sm drop-shadow">Featured ads get more clicks, messages, and faster sales.</p>
            </div>
            <Link href="/post-ad" className="bg-white text-[#0f172a] font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap shadow-lg">
              Post Your Ad Now
            </Link>
          </div>
        </div>
      </section>

      {/* Recent */}
      <section className="max-w-6xl mx-auto px-4 py-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">New Listings</h2>
          <Link href="/listings" className="text-sm text-[#0f172a] font-medium hover:underline">View all →</Link>
        </div>
        {recent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {recent.map((p: any) => <ProductCard key={p._id} listing={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No products found.</p>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How Usman Store Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { Icon: Camera,        title: "Post Your Ad",       desc: "Upload photos, set your price, and publish your listing in seconds." },
              { Icon: MessageCircle, title: "Connect with Buyers", desc: "Chat with local buyers quickly and answer questions on the spot."    },
              { Icon: Handshake,     title: "Close the Deal",      desc: "Choose a safe pickup or delivery option, then complete the sale."           },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#0f172a]/5 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-[#0f172a]" />
                </div>
                <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
