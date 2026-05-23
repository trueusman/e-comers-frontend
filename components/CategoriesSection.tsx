"use client";

import Link from "next/link";
import {
  Smartphone, Laptop, Tablet, Plug, Car, Bike,
  Sofa, Home, Trophy, Sparkles, Leaf, Shirt, Package,
  Watch, ShoppingBag, Gem, Utensils,
} from "lucide-react";

const CATS = [
  { name: "Smartphones",        slug: "smartphones",         Icon: Smartphone  },
  { name: "Laptops",            slug: "laptops",             Icon: Laptop      },
  { name: "Tablets",            slug: "tablets",             Icon: Tablet      },
  { name: "Accessories",        slug: "mobile-accessories",  Icon: Plug        },
  { name: "Cars",               slug: "vehicle",             Icon: Car         },
  { name: "Motorcycles",        slug: "motorcycle",          Icon: Bike        },
  { name: "Furniture",          slug: "furniture",           Icon: Sofa        },
  { name: "Home Decor",         slug: "home-decoration",     Icon: Home        },
  { name: "Sports",             slug: "sports-accessories",  Icon: Trophy      },
  { name: "Beauty",             slug: "beauty",              Icon: Sparkles    },
  { name: "Skin Care",          slug: "skin-care",           Icon: Leaf        },
  { name: "Dresses",            slug: "womens-dresses",      Icon: Shirt       },
  { name: "Bags",               slug: "womens-bags",         Icon: ShoppingBag },
  { name: "Watches",            slug: "mens-watches",        Icon: Watch       },
  { name: "Jewellery",          slug: "womens-jewellery",    Icon: Gem         },
  { name: "Kitchen",            slug: "kitchen-accessories", Icon: Utensils    },
];

// duplicate for seamless loop
const ITEMS = [...CATS, ...CATS];

export default function CategoriesSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>

      {/* Marquee wrapper — clips overflow */}
      <div className="relative overflow-hidden">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#f0f4ff] to-transparent pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[#f0f4ff] to-transparent pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex gap-3 w-max animate-marquee hover:[animation-play-state:paused]">
          {ITEMS.map((cat, i) => {
            const Icon = cat.Icon ?? Package;
            return (
              <Link
                key={`${cat.slug}-${i}`}
                href={`/listings?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#0f172a] hover:shadow-md transition-all group flex-shrink-0 w-[90px]"
              >
                <Icon className="w-7 h-7 text-[#0f172a] group-hover:scale-110 group-hover:text-[#3b82f6] transition-transform duration-200" />
                <span className="text-xs font-medium text-gray-700 group-hover:text-[#0f172a] text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
