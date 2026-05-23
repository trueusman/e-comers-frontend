"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("orders");
      if (raw) {
        const orders = JSON.parse(raw);
        if (orders.length > 0) {
          setOrderId(orders[orders.length - 1].id);
        }
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Checkmark */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-4">
          Thank you for your purchase. We&apos;ll process your order shortly.
        </p>

        {/* Order ID */}
        {orderId && (
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-5 py-3 mb-8">
            <Package className="w-4 h-4 text-[#0f172a]" />
            <span className="text-sm text-gray-600">Order ID:</span>
            <span className="font-bold text-[#0f172a] text-sm">{orderId}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1e293b] transition-colors"
          >
            <Package className="w-4 h-4" />
            Track your order in My Orders
          </Link>
          <Link
            href="/listings"
            className="flex items-center justify-center gap-2 border-2 border-[#0f172a] text-[#0f172a] px-6 py-3 rounded-xl font-bold hover:bg-[#0f172a]/5 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
