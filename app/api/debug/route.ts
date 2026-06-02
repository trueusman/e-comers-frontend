import { NextResponse } from "next/server";

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json({ error: "MONGODB_URI not set in env" });
  }

  try {
    const connectDB = (await import("@/lib/mongoose")).default;
    await connectDB();
    return NextResponse.json({ success: true, message: "MongoDB connected!", uriStart: uri.slice(0, 30) + "..." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, uriStart: uri.slice(0, 30) + "..." });
  }
}
