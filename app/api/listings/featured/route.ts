import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const CITIES = ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta"];
const CATEGORY_MAP: Record<string, string> = {
  beauty: "fashion", fragrances: "fashion", furniture: "furniture",
  groceries: "other", "home-decoration": "furniture", electronics: "electronics",
  smartphones: "electronics", laptops: "electronics", vehicles: "vehicles",
  sports: "sports", books: "books", fashion: "fashion",
};

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "products.json");
    const raw = JSON.parse(readFileSync(filePath, "utf-8"));
    const products = Array.isArray(raw) ? raw : (raw.products || []);

    const listings = products
      .filter((_: any, i: number) => i % 5 === 0)
      .slice(0, 12)
      .map((p: any, i: number) => ({
        _id:         String(p.id || i + 1),
        title:       p.title || "Product",
        description: p.description || "",
        price:       Math.round((p.price || 0) * 280),
        category:    CATEGORY_MAP[p.category?.toLowerCase()] || "other",
        condition:   "New",
        location:    CITIES[i % CITIES.length],
        images:      Array.isArray(p.images) && p.images.length ? p.images : [p.thumbnail || ""],
        isFeatured:  true,
        rating:      p.rating || 0,
        stock:       p.stock || 1,
        seller:      { name: "BazaarHub Team", city: CITIES[i % CITIES.length] },
        createdAt:   new Date().toISOString(),
      }));

    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
