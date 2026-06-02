"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, ChevronRight, Clock } from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
    const saved = localStorage.getItem("orders");
    if (saved) setOrders(JSON.parse(saved));
  }, [router]);

  if (!user) return null;

  const statusColor: Record<string, string> = {
    pending:   "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped:   "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-6 h-6 text-[#0f172a]" />
        <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
        <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-2.5 py-0.5 rounded-full">
          {orders.length} orders
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Aap ne abhi tak koi order nahi kiya. Products browse karein aur apna pehla order karein!
          </p>
          <Link href="/listings"
            className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors">
            <ShoppingBag className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Order #{order.id}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(order.date).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty} × Rs {item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-sm font-bold text-[#0f172a]">
                  Total: Rs {order.total?.toLocaleString()}
                </p>
                <Link href={`/orders/${order.id}`}
                  className="flex items-center gap-1 text-xs text-[#0f172a] font-semibold hover:underline">
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
