"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function StickyMobileBar({ product }: { product: any }) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 420px
      if (window.scrollY > 420) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category
    });
    router.push("/checkout");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        borderTop: "1px solid var(--border)",
        padding: "10px 16px",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
        zIndex: 90,
        display: visible ? "flex" : "none",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: visible ? "translateY(0)" : "translateY(100%)"
      }}
      className="sticky-mobile-bar"
    >
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 900px) {
          .sticky-mobile-bar {
            display: none !important;
          }
        }
      `}} />

      {/* Product Thumbnail & Price */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
        <div style={{ width: "44px", height: "44px", position: "relative", borderRadius: "4px", overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
          <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {product.name}
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--copper)" }}>
            {formatINR(product.price)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleAddToCart}
          style={{
            backgroundColor: added ? "var(--success)" : "#f3f4f6",
            color: added ? "#ffffff" : "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "10px 14px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          {added ? "Added ✓" : "Add to Bag"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          style={{
            backgroundColor: "var(--charcoal)",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            padding: "10px 16px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          ⚡ Buy Now
        </button>
      </div>
    </div>
  );
}

