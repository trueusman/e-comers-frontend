import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Load dummy.json from public folder (server-side only)
function getDummyListings() {
  try {
    const filePath = join(process.cwd(), "public", "dummy.json");
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper: try MongoDB
async function getFromDB(filter: any, sortOption: any, skip: number, limit: number) {
  try {
    const connectDB = (await import("@/lib/mongoose")).default;
    const Listing   = (await import("@/models/Listing")).default;
    await connectDB();

    const total    = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate("seller", "name phone city avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return { listings, total, source: "db" };
  } catch {
    return null; // fallback to dummy.json
  }
}

// GET /api/listings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category  = searchParams.get("category") || "";
    const condition = searchParams.get("condition") || "";
    const location  = searchParams.get("location")  || "";
    const minPrice  = searchParams.get("minPrice")  || "";
    const maxPrice  = searchParams.get("maxPrice")  || "";
    const q         = searchParams.get("q")         || "";
    const featured  = searchParams.get("featured");
    const sort      = searchParams.get("sort") || "newest";
    const page      = Number(searchParams.get("page")  || 1);
    const limit     = Number(searchParams.get("limit") || 20);

    // ── Try MongoDB first ──────────────────────────────────
    const dbFilter: any = { isActive: true };
    if (category)  dbFilter.category  = category;
    if (condition) dbFilter.condition = condition;
    if (location)  dbFilter.location  = new RegExp(location, "i");
    if (featured === "true") dbFilter.isFeatured = true;
    if (minPrice || maxPrice) {
      dbFilter.price = {};
      if (minPrice) dbFilter.price.$gte = Number(minPrice);
      if (maxPrice) dbFilter.price.$lte = Number(maxPrice);
    }
    if (q) dbFilter.title = new RegExp(q, "i");

    const sortMap: any = {
      newest:       { createdAt: -1 },
      oldest:       { createdAt:  1 },
      "price-asc":  { price:  1 },
      "price-desc": { price: -1 },
    };

    const dbResult = await getFromDB(dbFilter, sortMap[sort] || { createdAt: -1 }, (page - 1) * limit, limit);

    if (dbResult) {
      return NextResponse.json({
        success: true,
        total:   dbResult.total,
        page,
        pages:   Math.ceil(dbResult.total / limit),
        listings: dbResult.listings,
        source: "mongodb",
      });
    }

    // ── Fallback: dummy.json with in-memory filtering ─────
    let result = getDummyListings() as any[];

    if (category)  result = result.filter((l: any) => l.category  === category);
    if (condition) result = result.filter((l: any) => l.condition === condition);
    if (location)  result = result.filter((l: any) => l.location.toLowerCase().includes(location.toLowerCase()));
    if (featured === "true") result = result.filter((l: any) => l.isFeatured === true);
    if (minPrice)  result = result.filter((l: any) => l.price >= Number(minPrice));
    if (maxPrice)  result = result.filter((l: any) => l.price <= Number(maxPrice));
    if (q)         result = result.filter((l: any) =>
      l.title.toLowerCase().includes(q.toLowerCase()) ||
      l.description.toLowerCase().includes(q.toLowerCase())
    );

    // Sort
    if (sort === "price-asc")  result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "newest")     result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total     = result.length;
    const paginated = result.slice((page - 1) * limit, page * limit);

    // Ensure _id field exists for frontend compatibility
    const listings = paginated.map((l: any) => ({ ...l, _id: l._id || l.id }));

    return NextResponse.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      listings,
      source: "dummy",
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/listings — create listing (protected)
export async function POST(req: NextRequest) {
  try {
    const connectDB = (await import("@/lib/mongoose")).default;
    const Listing   = (await import("@/models/Listing")).default;
    const jwt       = (await import("jsonwebtoken")).default;

    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    const token   = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const body = await req.json();
    const { title, description, price, category, condition, location, phone, images } = body;

    const listing = await Listing.create({
      title, description, price, category, condition, location,
      phone:  phone  || "",
      images: images || [],
      seller: decoded.id,
    });

    await listing.populate("seller", "name phone city avatar");

    return NextResponse.json({ success: true, message: "Listing created", listing }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
