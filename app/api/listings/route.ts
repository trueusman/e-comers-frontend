import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Listing from "@/models/Listing";

// GET /api/listings
export async function GET(req: NextRequest) {
  try {
    await connectDB();

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

    const filter: any = { isActive: true };
    if (category)  filter.category  = category;
    if (condition) filter.condition = condition;
    if (location)  filter.location  = new RegExp(location, "i");
    if (featured === "true") filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$or = [
      { title: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
    ];

    const sortMap: any = {
      newest:       { createdAt: -1 },
      oldest:       { createdAt:  1 },
      "price-asc":  { price:  1 },
      "price-desc": { price: -1 },
    };

    const total    = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate("seller", "name phone city avatar")
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      listings,
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/listings — create listing (protected)
export async function POST(req: NextRequest) {
  try {
    const jwt = (await import("jsonwebtoken")).default;

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
