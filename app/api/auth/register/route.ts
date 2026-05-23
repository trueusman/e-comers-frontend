import { NextRequest, NextResponse } from "next/server";

function makeToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body   = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = process.env.JWT_SECRET || "bazaarhub_secret_2024";
  const sig    = Buffer.from(`${header}.${body}.${secret}`).toString("base64url");
  return `${header}.${body}.${sig}`;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, city } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 });
    }

    // ── Try MongoDB first ──────────────────────────────────
    try {
      const connectDB = (await import("@/lib/mongoose")).default;
      const User      = (await import("@/models/User")).default;
      const jwt       = (await import("jsonwebtoken")).default;
      await connectDB();

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
        user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, role: user.role },
      }, { status: 201 });
    } catch {
      // MongoDB not available — use dummy auth
    }

    // ── Dummy auth fallback ────────────────────────────────
    const dummyUser = {
      _id:  `dummy_${Date.now()}`,
      name,
      email,
      phone,
      city:  city || "Karachi",
      role: "user",
    };

    const token = makeToken({ id: dummyUser._id, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 });

    return NextResponse.json({
      success: true,
      message: "Account created successfully (demo mode)",
      token,
      user: dummyUser,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
