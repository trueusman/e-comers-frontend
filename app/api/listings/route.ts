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
    thumbnail:   p.thumbnail || (Array.isArray(p.images) ? p.images[0] : "") || "",
    isFeatured:  i % 5 === 0,
    isActive:    true,
    views:       Math.floor(Math.random() * 200),
    rating:      p.rating || 0,
    stock:       p.stock || 1,
    brand:       p.brand || "",
    reviews:     p.reviews || [],
    discountPercentage: p.discountPercentage || 0,
    seller:      { name: "BazaarHub Team", phone: "0300-0000000", city: CITIES[i % CITIES.length] },
    createdAt:   new Date().toISOString(),
  }));
}

// GET /api/listings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const q        = searchParams.get("q")        || "";
    const sort     = searchParams.get("sort")     || "newest";
    const featured = searchParams.get("featured");
    const limit    = Number(searchParams.get("limit") || 20);
    const page     = Number(searchParams.get("page")  || 1);

    let listings = loadProducts();

    // Filters
    if (category)        listings = listings.filter((p: any) => p.category === category);
    if (featured === "true") listings = listings.filter((p: any) => p.isFeatured);
    if (q) {
      const query = q.toLowerCase();
      listings = listings.filter((p: any) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sort === "price-asc")  listings.sort((a: any, b: any) => a.price - b.price);
    if (sort === "price-desc") listings.sort((a: any, b: any) => b.price - a.price);

    const total = listings.length;
    const paginated = listings.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      listings: paginated,
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/listings
export async function POST(req: NextRequest) {
  try {
    const jwt = (await import("jsonwebtoken")).default;
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const body = await req.json();

    const newListing = {
      _id: Date.now().toString(),
      ...body,
      seller: { name: decoded.name || "User", _id: decoded.id },
      isActive: true,
      isFeatured: false,
      views: 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, message: "Listing created", listing: newListing }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
