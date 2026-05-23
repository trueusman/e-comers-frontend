"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { Banknote, CreditCard, Smartphone, ChevronRight, ChevronLeft, Check, MapPin, Plus, CheckCircle, Package, ShoppingBag, X } from "lucide-react";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Quetta", "Multan"];
const DELIVERY_THRESHOLD = 2000;
const DELIVERY_FEE = 200;

function formatPrice(n: number) {
  return "Rs " + n.toLocaleString("en-PK");
}

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
}

interface SavedCard {
  id: string;
  number: string;
  expiry: string;
  holder: string;
}

type PaymentMethod = "cod" | "card" | "easypaisa" | "jazzcash";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();

  const delivery = cartTotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const orderTotal = cartTotal + delivery;

  // ── Step ──
  const [step, setStep] = useState<1 | 2>(1);
  const [orderPopup, setOrderPopup] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // ── Step 1: Address ──
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
    name: "", phone: "", street: "", city: "Karachi", zip: "",
  });

  // ── Step 2: Payment ──
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "", holder: "" });
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    try {
      const addrs = localStorage.getItem("savedAddresses");
      if (addrs) setSavedAddresses(JSON.parse(addrs));
      const cards = localStorage.getItem("savedCards");
      if (cards) setSavedCards(JSON.parse(cards));
    } catch { /* ignore */ }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) router.replace("/cart");
  }, [cartItems, router]);

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  const handleNextStep = () => {
    const hasAddress = selectedAddressId || (
      newAddress.name && newAddress.phone && newAddress.street && newAddress.city && newAddress.zip
    );
    if (!hasAddress) {
      alert("Please select or fill in a delivery address.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = () => {
    const address = selectedAddress || { ...newAddress, id: "new" };

    let paymentLabel = "";
    if (paymentMethod === "cod") paymentLabel = "Cash on Delivery";
    else if (paymentMethod === "card") paymentLabel = "Card Payment";
    else if (paymentMethod === "easypaisa") paymentLabel = `Easypaisa (${mobileNumber})`;
    else if (paymentMethod === "jazzcash") paymentLabel = `JazzCash (${mobileNumber})`;

    const orderId = "ORD-" + Date.now();
    const order = {
      id: orderId,
      date: new Date().toISOString(),
      status: "pending",
      items: cartItems.map((i) => ({ title: i.title, price: i.price, qty: i.qty, image: i.image })),
      total: orderTotal,
      address,
      paymentMethod: paymentLabel,
    };

    try {
      const existing = localStorage.getItem("orders");
      const orders = existing ? JSON.parse(existing) : [];
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch { /* ignore */ }

    clearCart();
    setPlacedOrderId(orderId);
    setOrderPopup(true);
  };

  // ── Order Success Popup ──
  if (orderPopup) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-300">
          {/* Animated checkmark */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-400 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={2} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-5">
            Shukriya! Aapka order successfully place ho gaya hai. Hum jald hi process karenge.
          </p>

          {/* Order ID */}
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-5 py-3 mb-6">
            <Package className="w-4 h-4 text-[#0f172a]" />
            <span className="text-sm text-gray-500">Order ID:</span>
            <span className="font-bold text-[#0f172a] text-sm">{placedOrderId}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/orders")}
              className="w-full flex items-center justify-center gap-2 bg-[#0f172a] text-white py-3 rounded-xl font-bold hover:bg-[#1e293b] transition-colors"
            >
              <Package className="w-4 h-4" />
              My Orders mein dekho
            </button>
            <button
              onClick={() => router.push("/listings")}
              className="w-full flex items-center justify-center gap-2 border-2 border-[#0f172a] text-[#0f172a] py-3 rounded-xl font-bold hover:bg-[#0f172a]/5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Shopping jari rakho
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* ── Progress Indicator ── */}
      <div className="flex items-center gap-0 mb-8">
        {/* Step 1 */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step >= 1 ? "bg-[#0f172a] text-white" : "bg-gray-200 text-gray-500"
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : "1"}
          </div>
          <span className={`text-sm font-medium ${step >= 1 ? "text-[#0f172a]" : "text-gray-400"}`}>
            Delivery Address
          </span>
        </div>

        <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 1 ? "bg-[#0f172a]" : "bg-gray-200"}`} />

        {/* Step 2 */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step >= 2 ? "bg-[#0f172a] text-white" : "bg-gray-200 text-gray-500"
          }`}>
            2
          </div>
          <span className={`text-sm font-medium ${step >= 2 ? "text-[#0f172a]" : "text-gray-400"}`}>
            Payment
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Main Content ── */}
        <div className="flex-1">

          {/* ════ STEP 1: ADDRESS ════ */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0f172a]" /> Delivery Address
              </h2>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? "border-[#0f172a] bg-[#0f172a]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => { setSelectedAddressId(addr.id); setShowNewAddress(false); }}
                        className="mt-1 accent-[#0f172a]"
                      />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">{addr.name}</p>
                        <p className="text-gray-500">{addr.phone}</p>
                        <p className="text-gray-600">{addr.street}, {addr.city} {addr.zip}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add new address toggle */}
              <button
                onClick={() => { setShowNewAddress(!showNewAddress); setSelectedAddressId(null); }}
                className="flex items-center gap-2 text-[#0f172a] font-semibold text-sm mb-4 hover:underline"
              >
                <Plus className="w-4 h-4" />
                {showNewAddress ? "Cancel" : "Add New Address"}
              </button>

              {/* New address form */}
              {(showNewAddress || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      placeholder="Muhammad Ali"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0f172a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      placeholder="03XX-XXXXXXX"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0f172a] transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="House #, Street, Area"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0f172a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                    <select
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0f172a] transition-colors bg-white"
                    >
                      {CITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                      placeholder="75500"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0f172a] transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleNextStep}
                className="mt-6 w-full bg-[#0f172a] text-white py-3 rounded-xl font-bold hover:bg-[#1e293b] transition-colors flex items-center justify-center gap-2"
              >
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ════ STEP 2: PAYMENT ════ */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0f172a]" /> Payment Method
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  paymentMethod === "cod" ? "border-[#0f172a] bg-[#0f172a]/5" : "border-gray-200 hover:border-gray-300"
                }`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")} className="accent-[#0f172a]" />
                  <Banknote className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>

                {/* Card Payment */}
                <div>
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === "card" ? "border-[#0f172a] bg-[#0f172a]/5" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")} className="accent-[#0f172a]" />
                    <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Card Payment</p>
                      <p className="text-xs text-gray-500">Debit / Credit card</p>
                    </div>
                  </label>

                  {paymentMethod === "card" && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-[#0f172a]/20 space-y-3">
                      {/* Saved cards */}
                      {savedCards.length > 0 && (
                        <div className="space-y-2">
                          {savedCards.map((card) => (
                            <label key={card.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedCardId === card.id ? "border-[#0f172a] bg-[#0f172a]/5" : "border-gray-200"
                            }`}>
                              <input type="radio" name="card" value={card.id} checked={selectedCardId === card.id}
                                onChange={() => { setSelectedCardId(card.id); setShowNewCard(false); }}
                                className="accent-[#0f172a]" />
                              <span className="text-sm text-gray-700">**** **** **** {card.number.slice(-4)} — {card.holder}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <button onClick={() => { setShowNewCard(!showNewCard); setSelectedCardId(null); }}
                        className="flex items-center gap-1 text-[#0f172a] text-xs font-semibold hover:underline">
                        <Plus className="w-3.5 h-3.5" />
                        {showNewCard ? "Cancel" : "Enter new card"}
                      </button>

                      {(showNewCard || savedCards.length === 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
                            <input type="text" value={newCard.number}
                              onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                              placeholder="1234 5678 9012 3456" maxLength={19}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f172a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
                            <input type="text" value={newCard.expiry}
                              onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                              placeholder="MM/YY" maxLength={5}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f172a]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                            <input type="password" value={newCard.cvv}
                              onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                              placeholder="•••" maxLength={4}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f172a]" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Cardholder Name</label>
                            <input type="text" value={newCard.holder}
                              onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                              placeholder="Name on card"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0f172a]" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Easypaisa */}
                <div>
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === "easypaisa" ? "border-[#0f172a] bg-[#0f172a]/5" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="radio" name="payment" value="easypaisa" checked={paymentMethod === "easypaisa"}
                      onChange={() => setPaymentMethod("easypaisa")} className="accent-[#0f172a]" />
                    <Smartphone className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Easypaisa</p>
                      <p className="text-xs text-gray-500">Pay via Easypaisa mobile wallet</p>
                    </div>
                  </label>
                  {paymentMethod === "easypaisa" && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-green-200">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Easypaisa Number</label>
                      <input type="tel" value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
                    </div>
                  )}
                </div>

                {/* JazzCash */}
                <div>
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    paymentMethod === "jazzcash" ? "border-[#0f172a] bg-[#0f172a]/5" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input type="radio" name="payment" value="jazzcash" checked={paymentMethod === "jazzcash"}
                      onChange={() => setPaymentMethod("jazzcash")} className="accent-[#0f172a]" />
                    <Smartphone className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">JazzCash</p>
                      <p className="text-xs text-gray-500">Pay via JazzCash mobile wallet</p>
                    </div>
                  </label>
                  {paymentMethod === "jazzcash" && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-red-200">
                      <label className="block text-xs font-medium text-gray-600 mb-1">JazzCash Number</label>
                      <input type="tel" value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-[#3b82f6] text-[#0f172a] py-3 rounded-xl font-bold hover:bg-[#2563eb] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Order Summary Sidebar ── */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Order Summary</h3>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto mb-3">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between gap-2 text-gray-600">
                  <span className="line-clamp-1 flex-1">{item.title} ×{item.qty}</span>
                  <span className="flex-shrink-0 font-medium text-gray-800">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="border-gray-200 mb-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                {delivery === 0
                  ? <span className="text-green-600 font-medium">FREE</span>
                  : <span>{formatPrice(delivery)}</span>
                }
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#0f172a]">{formatPrice(orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
