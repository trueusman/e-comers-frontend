import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <SearchX className="w-20 h-20 text-[#0f172a]/20 mb-4" />
      <h1 className="text-4xl font-black text-[#0f172a] mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-[#0f172a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1e293b] transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/listings"
          className="border border-[#0f172a] text-[#0f172a] px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
