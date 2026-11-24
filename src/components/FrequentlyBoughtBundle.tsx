"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

interface BundleItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
}

export default function FrequentlyBoughtBundle({
  mainProduct,
  bundleProducts = []
}: {
  mainProduct: BundleItem;
  bundleProducts: BundleItem[];
}) {
  const { addToCart } = useCart();
  const allItems = [mainProduct, ...bundleProducts.slice(0, 2)];
  
  // Track selected IDs
  const [selectedIds, setSelectedIds] = useState<string[]>(allItems.map(i => i._id));
  const [added, setAdded] = useState(false);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return; // Must keep at least one
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = allItems.filter(i => selectedIds.includes(i._id));
  const subtotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0);

  // 12% bundle discount if 2 or more items selected
  const hasBundleDiscount = selectedItems.length >= 2;
  const bundleDiscount = hasBundleDiscount ? Math.round(subtotal * 0.12) : 0;
  const finalPrice = subtotal - bundleDiscount;

  const handleAddBundle = () => {
    selectedItems.forEach(item => {
      addToCart({
        id: item._id,
        name: item.name,
        price: hasBundleDiscount ? Math.round(item.price * 0.88) : item.price,
        quantity: 1,
        image: item.image,
        category: item.category
      });
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  if (bundleProducts.length === 0) return null;

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      padding: "1.75rem",
      margin: "3rem 0"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--copper)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            SPECIAL COMBINATION OFFER
          </span>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 600, color: "var(--foreground)" }}>
            Frequently Bought Together
          </h3>
        </div>

        {hasBundleDiscount && (
          <span style={{
            backgroundColor: "#dcfce7",
            color: "#15803d",
            fontWeight: 700,
            fontSize: "0.8rem",
            padding: "4px 10px",
            borderRadius: "9999px"
          }}>
            Extra 12% Bundle Savings
          </span>
        )}
      </div>

      {/* Visual Product Thumbnails Chain */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {allItems.map((item, idx) => {
          const isSelected = selectedIds.includes(item._id);
          return (
            <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                onClick={() => toggleSelect(item._id)}
                style={{
                  position: "relative",
                  width: "80px",
                  height: "80px",
                  borderRadius: "6px",
                  border: isSelected ? "2px solid var(--copper)" : "1px solid #e5e7eb",
                  overflow: "hidden",
                  cursor: "pointer",
                  opacity: isSelected ? 1 : 0.45,
                  backgroundColor: "#f9fafb",
                  transition: "all 0.2s"
                }}
              >
                <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                {isSelected && (
                  <span style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "var(--copper)",
                    color: "#ffffff",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    fontSize: "0.65rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700
                  }}>
                    ✓
                  </span>
                )}
              </div>

              {idx < allItems.length - 1 && (
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--muted)" }}>+</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Checkbox item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
        {allItems.map((item) => {
          const isSelected = selectedIds.includes(item._id);
          return (
            <label
              key={item._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "0.85rem",
                color: isSelected ? "var(--foreground)" : "var(--muted)",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(item._id)}
                style={{ accentColor: "var(--copper)", width: "16px", height: "16px" }}
              />
              <span style={{ flex: 1 }}>{item.name}</span>
              <strong style={{ color: "var(--foreground)" }}>{formatINR(item.price)}</strong>
            </label>
          );
        })}
      </div>

      {/* Pricing & 1-Click Action Button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        borderTop: "1px solid var(--border-light)",
        paddingTop: "1.25rem"
      }}>
        <div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Total for {selectedItems.length} items:
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--foreground)" }}>
              {formatINR(finalPrice)}
            </span>
            {bundleDiscount > 0 && (
              <>
                <span style={{ fontSize: "0.95rem", color: "var(--muted)", textDecoration: "line-through" }}>
                  {formatINR(subtotal)}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 700 }}>
                  Save {formatINR(bundleDiscount)}!
                </span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddBundle}
          disabled={selectedItems.length === 0}
          style={{
            backgroundColor: added ? "var(--success)" : "var(--charcoal)",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            padding: "12px 24px",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          {added ? "All Items Added to Bag ✓" : `Add Selected ${selectedItems.length} Items to Bag →`}
        </button>
      </div>
    </div>
  );
}

