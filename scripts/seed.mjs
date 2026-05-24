/**
 * Seed Script — ecommerce-batch-17 backend se products fetch karke Atlas mein save karta hai
 * Run: node scripts/seed.mjs
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local manually parse karo
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
const SOURCE_API  = "https://ecommerce-batch-17-jyvv.vercel.app";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI .env.local mein set nahi hai!");
  process.exit(1);
}

// ── Category mapping (batch-17 → BazaarHub) ──────────────────
const CATEGORY_MAP = {
  smartphones:          "electronics",
  laptops:              "electronics",
  tablets:              "electronics",
  "mobile-accessories": "electronics",
  electronics:          "electronics",
  vehicle:              "vehicles",
  vehicles:             "vehicles",
  motorcycle:           "vehicles",
  property:             "property",
  "home-decoration":    "furniture",
  furniture:            "furniture",
  fashion:              "fashion",
  "womens-dresses":     "fashion",
  "womens-bags":        "fashion",
  "womens-shoes":       "fashion",
  "mens-shirts":        "fashion",
  "mens-shoes":         "fashion",
  sunglasses:           "fashion",
  fragrances:           "fashion",
  beauty:               "fashion",
  "skin-care":          "fashion",
  sports:               "sports",
  "sports-accessories": "sports",
  books:                "books",
  groceries:            "other",
  "kitchen-accessories":"other",
  tops:                 "fashion",
  jobs:                 "jobs",
};

function mapCategory(cat) {
  if (!cat) return "other";
  const lower = cat.toLowerCase();
  return CATEGORY_MAP[lower] || "other";
}

// ── Schemas ───────────────────────────────────────────────────
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

// ── Fetch products from batch-17 backend ─────────────────────
async function fetchProducts() {
  console.log(`🌐 ${SOURCE_API}/products se products fetch ho rahe hain...`);
  const res = await fetch(`${SOURCE_API}/products`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  // Handle both array and { products: [] } response shapes
  const products = Array.isArray(data) ? data : (data.products || data.data || []);
  console.log(`📦 ${products.length} products mile\n`);
  return products;
}

// ── Main ─────────────────────────────────────────────────────
async function seed() {
  console.log("🔌 MongoDB Atlas se connect ho raha hun...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  // 1. Seed seller user
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
    console.log("👤 Seed seller banaya:", seller.email);
  } else {
    console.log("👤 Seed seller pehle se hai:", seller.email);
  }

  // 2. Products fetch karo
  const products = await fetchProducts();

  // 3. Atlas mein save karo
  let created = 0;
  let skipped = 0;

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

  for (const p of products) {
    const title = p.title || p.name || "Untitled";

    // Duplicate check
    const exists = await Listing.findOne({ title, seller: seller._id });
    if (exists) {
      skipped++;
      continue;
    }

    // Images — handle different shapes
    let images = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      images = p.images.filter(Boolean);
    } else if (p.image) {
      images = [p.image];
    } else if (p.thumbnail) {
      images = [p.thumbnail];
    }

    // Price — convert to PKR (approx 1 USD = 280 PKR)
    const priceUSD = p.price || 0;
    const pricePKR = Math.round(priceUSD * 280);

    const category = mapCategory(p.category);
    const city     = cities[Math.floor(Math.random() * cities.length)];

    await Listing.create({
      title,
      description: p.description || title,
      price:       pricePKR,
      category,
      condition:   "New",
      location:    city,
      images,
      seller:      seller._id,
      isFeatured:  Math.random() < 0.2, // 20% featured
      isActive:    true,
      views:       Math.floor(Math.random() * 100),
      phone:       "0300-0000000",
    });

    console.log(`✅ [${category}] ${title} — Rs ${pricePKR.toLocaleString()}`);
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
