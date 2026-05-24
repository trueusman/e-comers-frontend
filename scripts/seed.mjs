/**
 * Seed Script — dummy.json ka data MongoDB mein import karta hai
 * Run: node scripts/seed.mjs
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local manually parse karo (dotenv ke bina)
function loadEnv() {
  try {
    const envPath = join(__dirname, "../.env.local");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (key && val) process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI .env.local mein set nahi hai!");
  process.exit(1);
}

// ── Schemas (inline, models folder se copy) ──────────────────

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    phone:    { type: String, required: true },
    password: { type: String, required: true },
    city:     { type: String, default: "" },
    avatar:   { type: String, default: "" },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const ListingSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true },
    category:    { type: String, required: true },
    condition:   { type: String, required: true },
    location:    { type: String, required: true },
    images:      [{ type: String }],
    seller:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isFeatured:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    views:       { type: Number, default: 0 },
    phone:       { type: String, default: "" },
  },
  { timestamps: true }
);

const User    = mongoose.models.User    || mongoose.model("User",    UserSchema);
const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

// ── Main ─────────────────────────────────────────────────────

async function seed() {
  console.log("🔌 MongoDB se connect ho raha hun...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  // 1. System seller user banao (agar pehle se nahi hai)
  const sellerEmail = "seed@bazaarhub.com";
  let seller = await User.findOne({ email: sellerEmail });

  if (!seller) {
    const hashed = await bcrypt.hash("seed1234", 10);
    seller = await User.create({
      name:     "BazaarHub Team",
      email:    sellerEmail,
      phone:    "0300-0000000",
      password: hashed,
      city:     "Karachi",
      role:     "admin",
    });
    console.log("👤 Seed seller user banaya:", seller.email);
  } else {
    console.log("👤 Seed seller pehle se maujood hai:", seller.email);
  }

  // 2. dummy.json load karo
  const dummyPath = join(__dirname, "../public/dummy.json");
  const dummies   = JSON.parse(readFileSync(dummyPath, "utf-8"));
  console.log(`\n📦 ${dummies.length} listings dummy.json mein mili\n`);

  // 3. Har listing MongoDB mein save karo
  let created = 0;
  let skipped = 0;

  for (const item of dummies) {
    // Duplicate check — same title aur seller
    const exists = await Listing.findOne({ title: item.title, seller: seller._id });
    if (exists) {
      console.log(`⏭  Skip (pehle se hai): ${item.title}`);
      skipped++;
      continue;
    }

    await Listing.create({
      title:       item.title,
      description: item.description,
      price:       item.price,
      category:    item.category,
      condition:   item.condition,
      location:    item.location,
      images:      item.images || [],
      seller:      seller._id,
      isFeatured:  item.isFeatured || false,
      isActive:    true,
      views:       item.views || 0,
      phone:       item.seller?.phone || "",
    });

    console.log(`✅ Saved: ${item.title}`);
    created++;
  }

  console.log(`\n🎉 Done! ${created} listings save hue, ${skipped} skip hue.`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
}

seed().catch((err) => {
  console.error("❌ Seed error:", err.message);
  process.exit(1);
});
