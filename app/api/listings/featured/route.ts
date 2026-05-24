import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Listing from "@/models/Listing";

// GET /api/listings/featured
export async function GET() {
  try {
    await connectDB();

    const listings = await Listing.find({ isActive: true, isFeatured: true })
      .populate("seller", "name phone city avatar")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    return NextResponse.json({ success: true, listings });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
