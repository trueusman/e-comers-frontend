"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/lib/useAuthGuard";
import LoginModal from "@/components/LoginModal";

interface Props {
  product: {
    _id: string;
    title: string;
    price: number;
    image: string;
    category: string;
  };
}

export default function AddToCartButton({ product }: Props) {
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);
  const { guard, showLoginModal, closeModal, goToLogin, goToRegister } = useAuthGuard();

  const itemInCart = cartItems.find((i) => i._id === product._id);
  const cartQty = itemInCart?.qty ?? 0;

  const handleAddToCart = () => {
    guard(() => {
      addToCart({
        _id: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
      });
      setAdded(true);
      setTimeout(() => {
        router.push("/cart");
      }, 1000);
    });
  };

  return (
    <>
      {showLoginModal && (
        <LoginModal onClose={closeModal} onLogin={goToLogin} onRegister={goToRegister} />
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={handleAddToCart}
          disabled={added}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all w-full justify-center ${
            added
              ? "bg-green-500 text-white cursor-wait"
              : "bg-[#3b82f6] text-[#0f172a] hover:bg-[#2563eb]"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Added! Going to cart...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {cartQty > 0 ? `Add Again (${cartQty} in cart)` : "Add to Cart"}
            </>
          )}
        </button>
      </div>
    </>
  );
}
