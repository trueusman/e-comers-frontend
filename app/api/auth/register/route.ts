import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, city } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ success: false, message: "Database not configured on server" }, { status: 503 });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 });
    }

    const user  = await User.create({ name, email, phone, password, city });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        city:  user.city,
        role:  user.role,
      },
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
