"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cartContext";

const DELIVERY_THRESHOLD = 2000;
const DELIVERY_FEE = 200;

function formatPrice(n: number) {
  return "Rs " + n.toLocaleString("en-PK");
}

export default function CartPage() {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQty } = useCart();

  const delivery = cartTotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const orderTotal = cartTotal + delivery;

  if (cartCount === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 rounded-full bg-[#0f172a]/10 flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-[#0f172a]" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/listings"
            className="inline-block bg-[#0f172a] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1e293b] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart{" "}
        <span className="text-base font-normal text-gray-500">({cartCount} items)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Cart Items ── */}
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start"
            >
              {/* Image */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm md:text-base">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{item.category}</p>
                <p className="text-[#0f172a] font-bold mt-1">{formatPrice(item.price)}</p>

                {/* Qty controls */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      disabled={item.qty <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-gray-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">{formatPrice(item.price * item.qty)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-medium text-gray-800">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                {delivery === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  <span className="font-medium text-gray-800">{formatPrice(delivery)}</span>
                )}
              </div>
              {delivery > 0 && (
                <p className="text-xs text-gray-400">
                  Add {formatPrice(DELIVERY_THRESHOLD - cartTotal)} more for free delivery
                </p>
              )}
              <hr className="border-gray-200" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#0f172a]">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 w-full bg-[#0f172a] text-white py-3 rounded-xl font-bold text-center hover:bg-[#1e293b] transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/listings"
              className="mt-3 w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors flex items-center justify-center text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
