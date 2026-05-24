import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/data";
import { MapPin, Eye, Phone, MessageCircle, Bookmark, AlertTriangle, Star } from "lucide-react";
import { readFileSync } from "fs";
import { join } from "path";

const CITIES = ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta"];
const CATEGORY_MAP: Record<string, string> = {
  beauty: "fashion", fragrances: "fashion", furniture: "furniture",
  groceries: "other", "home-decoration": "furniture", electronics: "electronics",
  smartphones: "electronics", laptops: "electronics", vehicles: "vehicles",
  sports: "sports", books: "books", fashion: "fashion",
};

function loadAllProducts() {
  const filePath = join(process.cwd(), "public", "products.json");
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  const products = Array.isArray(raw) ? raw : (raw.products || []);
  return products.map((p: any, i: number) => ({
    _id:         String(p.id || i + 1),
    title:       p.title || "Product",
    description: p.description || "",
    price:       Math.round((p.price || 0) * 280),
    category:    CATEGORY_MAP[p.category?.toLowerCase()] || "other",
    condition:   "New",
    location:    CITIES[i % CITIES.length],
    images:      Array.isArray(p.images) && p.images.length ? p.images : [p.thumbnail || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80"],
    isFeatured:  i % 5 === 0,
    rating:      p.rating || 0,
    stock:       p.stock || 1,
    brand:       p.brand || "",
    reviews:     p.reviews || [],
    discountPercentage: p.discountPercentage || 0,
    seller:      { name: "BazaarHub Team", phone: "0300-0000000", city: CITIES[i % CITIES.length] },
    createdAt:   new Date().toISOString(),
    views:       i * 7,
    phone:       "0300-0000000",
  }));
}

function normalize(p: any) { return p; }

function getProduct(id: string) {
  try {
    const products = loadAllProducts();
    return products.find((p: any) => p._id === id) || null;
  } catch { return null; }
}

function getRelated(category: string, currentId: string) {
  try {
    const products = loadAllProducts();
    return products
      .filter((p: any) => p.category === category && p._id !== currentId)
      .slice(0, 4);
  } catch { return []; }
}

interface Props { params: Promise<{ id: string }> }

export default async function ProductDetailPage({ params }: Props) {
  const { id }  = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const related = getRelated(product.category, id);
  const postedAt = new Date(product.createdAt).toLocaleDateString("en-US", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-[#002f34]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/listings" className="hover:text-[#002f34]">Products</Link>
        <span className="mx-2">/</span>
        <Link href={`/listings?category=${product.category}`} className="hover:text-[#002f34] capitalize">
          {product.category.replace(/-/g, " ")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 line-clamp-1">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left ──────────────────────────────────────── */}
        <div className="flex-1">
          {/* Main image */}
          <div className="relative h-72 md:h-96 bg-gray-100 rounded-xl overflow-hidden mb-4">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
              unoptimized
            />
            {product.isFeatured && (
              <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-900" /> TOP RATED
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {product.images.map((img: string, i: number) => (
                <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <Image src={img} alt={`img-${i}`} fill className="object-contain" unoptimized />
                </div>
              ))}
            </div>
          )}

          {/* Title & meta */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {product.location}
                  </span>
                  <span>•</span>
                  <span>{postedAt}</span>
                  <span>•</span>
                  <span className={`font-medium px-2 py-0.5 rounded text-xs ${
                    product.condition === "New" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {product.condition}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {product.rating}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Eye className="w-3.5 h-3.5" /> {product.views} views
                  </span>
                </div>
              </div>
              <p className="text-2xl font-black text-[#002f34] whitespace-nowrap">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-bold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-bold text-gray-800 mb-3">Product Details</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Category</span><p className="font-medium capitalize">{product.category.replace(/-/g, " ")}</p></div>
              <div><span className="text-gray-500">Condition</span><p className="font-medium">{product.condition}</p></div>
              <div><span className="text-gray-500">Brand</span><p className="font-medium">{product.location}</p></div>
              <div><span className="text-gray-500">In Stock</span><p className="font-medium">{product.stock} units</p></div>
            </div>
          </div>

          {/* Reviews */}
          {product.reviews?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Customer Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map((r: any, i: number) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-800">{r.reviewerName}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className={`w-3 h-3 ${s < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Actions ────────────────────────────── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 sticky top-24">
            <p className="text-3xl font-black text-[#002f34] mb-1">{formatPrice(product.price)}</p>
            <p className="text-sm text-gray-500 mb-4">
              {product.stock > 0
                ? <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>
                : <span className="text-red-500 font-medium">Out of Stock</span>
              }
            </p>

            <div className="mb-3">
              <AddToCartButton product={{
                _id: product._id,
                title: product.title,
                price: product.price,
                image: product.images[0],
                category: product.category,
              }} />
            </div>

            <a
              href="https://wa.me/923141162973"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#002f34] text-white py-3 rounded-xl font-semibold hover:bg-[#004d54] transition-colors mb-3 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> Contact Seller
            </a>
            <a
              href="https://wa.me/923141162973"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border-2 border-[#002f34] text-[#002f34] py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors mb-3 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Chat with Seller
            </a>
            <button className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Bookmark className="w-4 h-4" /> Save Product
            </button>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
              <p className="font-semibold mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Safety Tips
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Meet in a safe, public place</li>
                <li>Don&apos;t pay in advance</li>
                <li>Inspect item before buying</li>
              </ul>
            </div>
          </div>

          {/* Seller info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-3">Seller Information</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#002f34] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {product.seller.name?.charAt(0) || "S"}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{product.seller.name}</p>
                <p className="text-xs text-gray-500 capitalize">{product.category.replace(/-/g, " ")} Seller</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p: any) => <ProductCard key={p._id} listing={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
