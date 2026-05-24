"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { backendFetch, mapCategoryToBackend } from "@/lib/backend";
import {
  Smartphone, Laptop, Tablet, Plug, Car, Bike,
  Sofa, Home, Trophy, Sparkles, Leaf, Shirt,
  ShoppingBag, Watch, Gem, Utensils, BookOpen,
  Package, SearchX, SlidersHorizontal, X, ChevronDown,
} from "lucide-react";

const ALL_CATS = [
  { name: "All",                  slug: "",                      Icon: Package    },
  { name: "Smartphones",          slug: "smartphones",           Icon: Smartphone },
  { name: "Laptops",              slug: "laptops",               Icon: Laptop     },
  { name: "Tablets",              slug: "tablets",               Icon: Tablet     },
  { name: "Mobile Accessories",   slug: "mobile-accessories",    Icon: Plug       },
  { name: "Cars",                 slug: "vehicle",               Icon: Car        },
  { name: "Motorcycles",          slug: "motorcycle",            Icon: Bike       },
  { name: "Furniture",            slug: "furniture",             Icon: Sofa       },
  { name: "Home Decoration",      slug: "home-decoration",       Icon: Home       },
  { name: "Sports",               slug: "sports-accessories",    Icon: Trophy     },
  { name: "Beauty",               slug: "beauty",                Icon: Sparkles   },
  { name: "Skin Care",            slug: "skin-care",             Icon: Leaf       },
  { name: "Women's Dresses",      slug: "womens-dresses",        Icon: Shirt      },
  { name: "Women's Bags",         slug: "womens-bags",           Icon: ShoppingBag},
  { name: "Women's Shoes",        slug: "womens-shoes",          Icon: Gem        },
  { name: "Women's Jewellery",    slug: "womens-jewellery",      Icon: Gem        },
  { name: "Women's Watches",      slug: "womens-watches",        Icon: Watch      },
  { name: "Men's Shirts",         slug: "mens-shirts",           Icon: Shirt      },
  { name: "Men's Shoes",          slug: "mens-shoes",            Icon: Gem        },
  { name: "Men's Watches",        slug: "mens-watches",          Icon: Watch      },
  { name: "Sunglasses",           slug: "sunglasses",            Icon: Sparkles   },
  { name: "Fragrances",           slug: "fragrances",            Icon: Sparkles   },
  { name: "Groceries",            slug: "groceries",             Icon: Utensils   },
  { name: "Kitchen",              slug: "kitchen-accessories",   Icon: Utensils   },
  { name: "Tops",                 slug: "tops",                  Icon: Shirt      },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy]     = useState("default");
  const [searchQuery, setSearch]= useState(searchParams.get("q") || "");
  const [showSort, setShowSort] = useState(false);

  // Sync when URL changes (navbar clicks)
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const backendCategory = mapCategoryToBackend(category);
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (backendCategory) params.set("category", backendCategory);
      if (sortBy !== "default") params.set("sort", sortBy);

      const res = await backendFetch(`/api/listings?${params.toString()}`);
      if (!res.ok) {
        setProducts([]);
        setTotal(0);
        return;
      }
      const data = await res.json();
      const result = data.listings || [];
      setProducts(result);
      setTotal(result.length);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy, searchQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCatClick = (slug: string) => {
    setCategory(slug);
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/listings${params.toString() ? "?" + params.toString() : ""}`);
  };

  const activeCatName = ALL_CATS.find(c => c.slug === category)?.name || "All";

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">

      {/* ── Breadcrumb ──────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-4 hidden sm:block">
        <Link href="/" className="hover:text-[#0f172a]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{activeCatName}</span>
      </nav>

      {/* ── Search bar (mobile) ─────────────────────────── */}
      <div className="mb-3 sm:hidden">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0f172a]"
        />
      </div>

      {/* ── Category chips — mobile/tablet only ────────── */}
      <div className="relative mb-4 lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {ALL_CATS.map((cat, i) => {
            const active = category === cat.slug;
            return (
              <button
                key={cat.slug || "all"}
                onClick={() => handleCatClick(cat.slug)}
                style={{ animationDelay: `${i * 30}ms`, animationFillMode: "forwards" }}
                className={`animate-fadeInUp opacity-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                  active
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#0f172a] hover:text-[#0f172a] active:scale-95"
                }`}
              >
                <cat.Icon className={`w-3.5 h-3.5 ${active ? "text-[#3b82f6]" : ""}`} />
                {cat.name}
              </button>
            );
          })}
        </div>
        {/* Fade edge to hint scroll */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
      </div>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : (
            <><span className="font-bold text-gray-900">{total}</span> products{category ? ` in ${activeCatName}` : ""}</>
          )}
        </p>

        {/* Sort — desktop dropdown, mobile button */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700 hover:border-[#0f172a] transition-colors bg-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Sort: </span>
            <span className="font-medium">
              {sortBy === "default"      ? "Default"
               : sortBy === "newest"       ? "Newest"
               : sortBy === "oldest"       ? "Oldest"
               : sortBy === "price-asc"    ? "Price ↑"
               : sortBy === "price-desc"   ? "Price ↓"
               : "Default"}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSort ? "rotate-180" : ""}`} />
          </button>

          {showSort && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 min-w-[160px] py-1">
              {[
                { val: "default",      label: "Default"           },
                { val: "newest",       label: "Newest"            },
                { val: "oldest",       label: "Oldest"            },
                { val: "price-asc",    label: "Price: Low → High" },
                { val: "price-desc",   label: "Price: High → Low" },
              ].map((opt) => (
                <button key={opt.val}
                  onClick={() => { setSortBy(opt.val); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortBy === opt.val
                      ? "bg-[#0f172a] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active filter badge */}
      {(category || searchQuery) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category && (
            <span className="flex items-center gap-1.5 bg-[#0f172a]/10 text-[#0f172a] text-xs font-semibold px-3 py-1.5 rounded-full">
              {activeCatName}
              <button onClick={() => handleCatClick("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="flex items-center gap-1.5 bg-[#0f172a]/10 text-[#0f172a] text-xs font-semibold px-3 py-1.5 rounded-full">
              &quot;{searchQuery}&quot;
              <button onClick={() => setSearch("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── Product Grid ────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2.5 bg-gray-200 rounded w-3/4" />
                <div className="h-2.5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <SearchX className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 text-sm mb-4">Try a different category or search.</p>
          <button onClick={() => { handleCatClick(""); setSearch(""); }}
            className="bg-[#0f172a] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-colors">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {products.map((p, i) => (
            <div
              key={p._id}
              className="opacity-0 translate-y-4 animate-fadeInUp"
              style={{ animationDelay: `${Math.min(i * 40, 600)}ms`, animationFillMode: "forwards" }}
            >
              <ProductCard listing={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-gray-500">Loading...</div>
    }>
      <ListingsContent />
    </Suspense>
  );
}
