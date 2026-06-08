export type Listing = {
  id: number;
  title: string;
  price: number;
  location: string;
  category: string;
  condition: "New" | "Used" | "Refurbished";
  image: string;
  description: string;
  seller: string;
  postedAt: string;
  featured?: boolean;
};

export const categories = [
  { name: "Electronics",    slug: "electronics" },
  { name: "Vehicles",       slug: "vehicles"    },
  { name: "Property",       slug: "property"    },
  { name: "Fashion",        slug: "fashion"     },
  { name: "Furniture",      slug: "furniture"   },
  { name: "Books",          slug: "books"       },
  { name: "Sports",         slug: "sports"      },
  { name: "Jobs",           slug: "jobs"        },
  { name: "Other",          slug: "other"       },
];

export const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 14 Pro Max – 256GB Space Black",
    price: 85000,
    location: "Karachi",
    category: "electronics",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80",
    description:
      "Excellent condition iPhone 14 Pro Max. Battery health 92%. Comes with original box and charger. No scratches, no cracks.",
    seller: "Ahmed Khan",
    postedAt: "2 hours ago",
    featured: true,
  },
  {
    id: 2,
    title: "Toyota Corolla 2020 – 1.6 GLi",
    price: 3800000,
    location: "Lahore",
    category: "vehicles",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80",
    description:
      "Well-maintained Corolla GLi 2020. First owner, all documents clear. 45,000 km driven. Genuine buyer contact only.",
    seller: "Usman Ali",
    postedAt: "5 hours ago",
    featured: true,
  },
  {
    id: 3,
    title: "3 Bedroom Apartment for Rent – DHA Phase 5",
    price: 75000,
    location: "Lahore",
    category: "property",
    condition: "New",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
    description:
      "Spacious 3-bed apartment in DHA Phase 5. Fully furnished, 24/7 security, backup generator. Available from next month.",
    seller: "Fatima Realty",
    postedAt: "1 day ago",
    featured: true,
  },
  {
    id: 4,
    title: "Samsung 55\" 4K Smart TV",
    price: 120000,
    location: "Islamabad",
    category: "electronics",
    condition: "New",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&q=80",
    description:
      "Brand new Samsung Crystal 4K UHD Smart TV. Still in box, bought from Samsung store. Selling due to relocation.",
    seller: "Bilal Traders",
    postedAt: "3 hours ago",
    featured: true,
  },
  {
    id: 5,
    title: "Leather Sofa Set – 5 Seater",
    price: 45000,
    location: "Karachi",
    category: "furniture",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    description:
      "Premium leather sofa set, 5 seater. Minor wear on armrests, otherwise in great shape. Selling because upgrading.",
    seller: "Sara Malik",
    postedAt: "2 days ago",
  },
  {
    id: 6,
    title: "MacBook Pro M2 – 13 inch",
    price: 280000,
    location: "Islamabad",
    category: "electronics",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",
    description:
      "MacBook Pro M2 chip, 8GB RAM, 256GB SSD. Purchased 6 months ago. Battery cycles: 45. Comes with original charger.",
    seller: "Zara Tech",
    postedAt: "4 hours ago",
  },
  {
    id: 7,
    title: "Honda CB150F – 2022 Model",
    price: 320000,
    location: "Faisalabad",
    category: "vehicles",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    description:
      "Honda CB150F 2022, 12,000 km driven. All documents complete. No accidents. Genuine buyer only.",
    seller: "Tariq Motors",
    postedAt: "6 hours ago",
  },
  {
    id: 8,
    title: "Nike Air Max 270 – Size 42",
    price: 8500,
    location: "Karachi",
    category: "fashion",
    condition: "New",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    description:
      "Original Nike Air Max 270, size 42. Bought from Nike store, never worn. Selling because wrong size.",
    seller: "Hamza Shoes",
    postedAt: "1 day ago",
  },
  {
    id: 9,
    title: "Office Desk with Chair",
    price: 18000,
    location: "Rawalpindi",
    category: "furniture",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80",
    description:
      "L-shaped office desk with ergonomic chair. Good condition, minor scratches on desk. Self-pickup only.",
    seller: "Office Deals",
    postedAt: "3 days ago",
  },
  {
    id: 10,
    title: "Canon EOS 200D DSLR Camera",
    price: 65000,
    location: "Lahore",
    category: "electronics",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
    description:
      "Canon EOS 200D with 18-55mm kit lens. Shutter count: 8,000. Excellent condition, comes with bag and extra battery.",
    seller: "Photo World",
    postedAt: "5 hours ago",
  },
  {
    id: 11,
    title: "Plot for Sale – 5 Marla Bahria Town",
    price: 9500000,
    location: "Rawalpindi",
    category: "property",
    condition: "New",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
    description:
      "5 Marla residential plot in Bahria Town Phase 8. All utilities available. Ideal for construction.",
    seller: "Prime Properties",
    postedAt: "2 days ago",
  },
  {
    id: 12,
    title: "Cricket Kit – Complete Set",
    price: 12000,
    location: "Karachi",
    category: "sports",
    condition: "Used",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=80",
    description:
      "Complete cricket kit including bat, pads, gloves, helmet, and bag. Used for one season. Good condition.",
    seller: "Sports Corner",
    postedAt: "1 day ago",
  },
];

export function getListingById(id: number): Listing | undefined {
  return listings.find((l) => l.id === id);
}

export function getListingsByCategory(category: string): Listing[] {
  return listings.filter((l) => l.category === category);
}

export function getFeaturedListings(): Listing[] {
  return listings.filter((l) => l.featured);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
