import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const CITIES = ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta"];
const CATEGORY_MAP: Record<string, string> = {
  beauty: "fashion", fragrances: "fashion", furniture: "furniture",
  groceries: "other", "home-decoration": "furniture", electronics: "electronics",
  smartphones: "electronics", laptops: "electronics", vehicles: "vehicles",
  sports: "sports", books: "books", fashion: "fashion",
};

function loadProducts() {
  const filePath = join(process.cwd(), "public", "products.json");
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  const products = Array.isArray(raw) ? raw : (raw.products || []);
  return products.map((p: any, i: number) => ({
    _id:         String(p.id || p._id || i + 1),
    title:       p.title || p.name || "Product",
    description: p.description || "",
    price:       Math.round((p.price || 0) * 280),
    category:    CATEGORY_MAP[p.category?.toLowerCase()] || "other",
    condition:   "New",
    location:    CITIES[i % CITIES.length],
    images:      Array.isArray(p.images) && p.images.length ? p.images : [p.thumbnail || ""],
    thumbnail:   p.thumbnail || "",
    isFeatured:  i % 5 === 0,
    isActive:    true,
    views:       i * 7,
    rating:      p.rating || 0,
    stock:       p.stock || 1,
    brand:       p.brand || "",
    reviews:     p.reviews || [],
    discountPercentage: p.discountPercentage || 0,
    seller:      { name: "BazaarHub Team", phone: "0300-0000000", city: CITIES[i % CITIES.length] },
    createdAt:   new Date().toISOString(),
  }));
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const products = loadProducts();
    const listing = products.find((p: any) => 
      p._id === id || String(p._id) === String(id)
    );

    if (!listing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ success: false, message: "Not implemented" }, { status: 501 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ success: false, message: "Not implemented" }, { status: 501 });
}
