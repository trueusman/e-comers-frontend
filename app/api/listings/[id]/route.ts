import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import Listing from "@/models/Listing";

// GET /api/listings/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const listing = await Listing.findById(id).populate("seller", "name phone city avatar createdAt");

    if (!listing || !listing.isActive) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }

    listing.views += 1;
    await listing.save();

    return NextResponse.json({ success: true, listing });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/listings/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }
    const decoded: any = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);

    const listing = await Listing.findById(id);
    if (!listing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (listing.seller.toString() !== decoded.id) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const updates = await req.json();
    const updated = await Listing.findByIdAndUpdate(id, updates, { new: true }).populate("seller", "name phone city");
    return NextResponse.json({ success: true, listing: updated });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/listings/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }
    const decoded: any = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);

    const listing = await Listing.findById(id);
    if (!listing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (listing.seller.toString() !== decoded.id) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    listing.isActive = false;
    await listing.save();
    return NextResponse.json({ success: true, message: "Listing deleted" });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
