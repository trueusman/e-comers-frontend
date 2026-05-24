export const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ecommerce-batch-17-jyvv.vercel.app";

export async function backendFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return fetch(`${BACKEND_BASE}${path}`, { ...options, headers });
}

const BACKEND_CATEGORIES = [
  "electronics",
  "vehicles",
  "property",
  "fashion",
  "furniture",
  "books",
  "sports",
  "jobs",
  "other",
];

const BACKEND_CATEGORY_MAP: Record<string, string> = {
  smartphones: "electronics",
  laptops: "electronics",
  tablets: "electronics",
  "mobile-accessories": "electronics",
  vehicle: "vehicles",
  motorcycle: "vehicles",
  "home-decoration": "property",
  "sports-accessories": "sports",
  beauty: "fashion",
  "skin-care": "fashion",
  "womens-dresses": "fashion",
  "womens-bags": "fashion",
  "womens-shoes": "fashion",
  "womens-jewellery": "fashion",
  "womens-watches": "fashion",
  "mens-shirts": "fashion",
  "mens-shoes": "fashion",
  "mens-watches": "fashion",
  sunglasses: "fashion",
  fragrances: "fashion",
  groceries: "other",
  "kitchen-accessories": "other",
  tops: "fashion",
};

export function mapCategoryToBackend(category: string) {
  if (!category) return "";
  return BACKEND_CATEGORY_MAP[category] || (BACKEND_CATEGORIES.includes(category) ? category : "");
}
