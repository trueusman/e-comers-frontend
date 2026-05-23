import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import jwt from "jsonwebtoken";

function getDummyListings() {
  try {
    const filePath = join(process.cwd(), "public", "dummy.json");
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

// GET /api/listings/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Try MongoDB first
    try {
      const connectDB = (await import("@/lib/mongoose")).default;
      const Listing   = (await import("@/models/Listing")).default;
      await connectDB();

      const listing = await Listing.findById(id).populate("seller", "name phone city avatar createdAt");
      if (listing && listing.isActive) {
        listing.views += 1;
        await listing.save();
        return NextResponse.json({ success: true, listing });
      }
    } catch {
      // fallback to dummy.json
    }

    // dummy.json fallback
    const dummies = getDummyListings();
    const listing = dummies.find((l: any) => l.id === id || l._id === id);

    if (!listing) {
      return NextResponse.json({ success: false, message: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      listing: { ...listing, _id: listing._id || listing.id },
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT /api/listings/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const connectDB = (await import("@/lib/mongoose")).default;
    const Listing   = (await import("@/models/Listing")).default;
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
    const connectDB = (await import("@/lib/mongoose")).default;
    const Listing   = (await import("@/models/Listing")).default;
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
