/**
 * Seed Script — instructor ka products.json Atlas mein save karta hai
 * Run: node scripts/seed.mjs
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local parse karo
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
  } catch { }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI .env.local mein set nahi hai!");
  process.exit(1);
}

// ── Category mapping ──────────────────────────────────────────
const CATEGORY_MAP = {
  smartphones: "electronics", laptops: "electronics", tablets: "electronics",
  "mobile-accessories": "electronics", electronics: "electronics",
  vehicle: "vehicles", vehicles: "vehicles", motorcycle: "vehicles",
  property: "property", "home-decoration": "furniture", furniture: "furniture",
  fashion: "fashion", "womens-dresses": "fashion", "womens-bags": "fashion",
  "womens-shoes": "fashion", "mens-shirts": "fashion", "mens-shoes": "fashion",
  sunglasses: "fashion", fragrances: "fashion", beauty: "fashion",
  "skin-care": "fashion", sports: "sports", "sports-accessories": "sports",
  books: "books", groceries: "other", "kitchen-accessories": "other",
  tops: "fashion", jobs: "jobs",
};

function mapCategory(cat) {
  if (!cat) return "other";
  return CATEGORY_MAP[cat.toLowerCase()] || "other";
}

// ── Schemas ───────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  city:     { type: String, default: "" },
  avatar:   { type: String, default: "" },
  role:     { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

const ListingSchema = new mongoose.Schema({
  title:                { type: String, required: true },
  description:          { type: String, required: true },
  price:                { type: Number, required: true },
  category:             { type: String, required: true },
  condition:            { type: String, required: true },
  location:             { type: String, required: true },
  images:               [{ type: String }],
  seller:               { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isFeatured:           { type: Boolean, default: false },
  isActive:             { type: Boolean, default: true },
  views:                { type: Number, default: 0 },
  phone:                { type: String, default: "" },
  // Extra fields from instructor's data
  brand:                { type: String, default: "" },
  rating:               { type: Number, default: 0 },
  stock:                { type: Number, default: 1 },
  discountPercentage:   { type: Number, default: 0 },
  thumbnail:            { type: String, default: "" },
  tags:                 [{ type: String }],
  reviews: [{
    rating:        Number,
    comment:       String,
    reviewerName:  String,
    reviewerEmail: String,
    date:          Date,
  }],
  warrantyInformation:  { type: String, default: "" },
  shippingInformation:  { type: String, default: "" },
  returnPolicy:         { type: String, default: "" },
  availabilityStatus:   { type: String, default: "In Stock" },
  minimumOrderQuantity: { type: Number, default: 1 },
}, { timestamps: true });

const User    = mongoose.models.User    || mongoose.model("User",    UserSchema);
const Listing = mongoose.models.Listing || mongoose.model("Listing", ListingSchema);

// ── Main ─────────────────────────────────────────────────────
async function seed() {
  console.log("🔌 MongoDB Atlas se connect ho raha hun...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  // 1. Purane seed listings delete karo (fresh start)
  const seller = await User.findOne({ email: "seed@bazaarhub.com" });
  if (seller) {
    const deleted = await Listing.deleteMany({ seller: seller._id });
    console.log(`🗑  ${deleted.deletedCount} purani listings delete hui\n`);
  }

  // 2. Seed seller banao
  let seedSeller = seller;
  if (!seedSeller) {
    const hashed = await bcrypt.hash("seed1234", 10);
    seedSeller = await User.create({
      name: "BazaarHub Team", email: "seed@bazaarhub.com",
      phone: "0300-0000000", password: hashed,
      city: "Karachi", role: "admin",
    });
    console.log("👤 Seed seller banaya:", seedSeller.email);
  } else {
    console.log("👤 Seed seller:", seedSeller.email);
  }

  // 3. products.json load karo (backend folder se)
  const jsonPath = join(__dirname, "../../e-commerce-backend/products.json");
  const raw = JSON.parse(readFileSync(jsonPath, "utf-8"));
  const products = Array.isArray(raw) ? raw : (raw.products || []);
  console.log(`\n📦 ${products.length} products mile\n`);

  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

  let created = 0;
  for (const p of products) {
    const title    = p.title || p.name || "Untitled";
    const category = mapCategory(p.category);
    const city     = cities[Math.floor(Math.random() * cities.length)];
    const pricePKR = Math.round((p.price || 0) * 280);

    let images = [];
    if (Array.isArray(p.images) && p.images.length) images = p.images.filter(Boolean);
    else if (p.thumbnail) images = [p.thumbnail];

    await Listing.create({
      title,
      description:          p.description || title,
      price:                pricePKR,
      category,
      condition:            "New",
      location:             city,
      images,
      seller:               seedSeller._id,
      isFeatured:           Math.random() < 0.3,
      isActive:             true,
      views:                Math.floor(Math.random() * 200),
      phone:                "0300-0000000",
      brand:                p.brand || "",
      rating:               p.rating || 0,
      stock:                p.stock || 1,
      discountPercentage:   p.discountPercentage || 0,
      thumbnail:            p.thumbnail || (images[0] || ""),
      tags:                 p.tags || [],
      reviews:              (p.reviews || []).map(r => ({
        rating:        r.rating,
        comment:       r.comment,
        reviewerName:  r.reviewerName,
        reviewerEmail: r.reviewerEmail,
        date:          new Date(r.date || Date.now()),
      })),
      warrantyInformation:  p.warrantyInformation || "",
      shippingInformation:  p.shippingInformation || "",
      returnPolicy:         p.returnPolicy || "",
      availabilityStatus:   p.availabilityStatus || "In Stock",
      minimumOrderQuantity: p.minimumOrderQuantity || 1,
    });

    console.log(`✅ [${category}] ${title} — Rs ${pricePKR.toLocaleString()}`);
    created++;
  }

  console.log(`\n🎉 Done! ${created} listings Atlas mein save hue.`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
}

seed().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
