"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "@/app/shop/[id]/ProductDetail.module.css";

export default function AddToCartButton({ product }: { product: any }) {
  const [selectedCapacity, setSelectedCapacity] = useState(
    product.capacities ? product.capacities[0] : (product.capacity || "3.5 Quart")
  );
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const capacities = product.capacities || ["3.5 QT", "5.0 QT"];
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: `${product._id}-${selectedCapacity}`,
      name: `${product.name} (${selectedCapacity})`,
      price: product.price,
      quantity: 1,
      image: product.image
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.pdpActionGroup}>
      {/* Capacity Selector */}
      <div className={styles.capacitySection}>
        <div className={styles.capacityHeader}>
          <span className={styles.capacityLabel}>CAPACITY</span>
          <span className={styles.selectedCapacityText}>Selected: {selectedCapacity}</span>
        </div>
        <div className={styles.capacityPillList}>
          {capacities.map((cap: string) => (
            <button
              key={cap}
              type="button"
              onClick={() => setSelectedCapacity(cap)}
              className={`${styles.capacityPill} ${selectedCapacity === cap ? styles.capacityPillActive : ""}`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      {/* Add To Cart CTA Button */}
      <button
        type="button"
        className={styles.pdpAddBtn}
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? "OUT OF STOCK" : added ? "ADDED TO BAG ✓" : "ADD TO CART →"}
      </button>

      {/* In-Stock Indicator */}
      <div className={styles.stockNotice}>
        <span className={styles.greenDot}>◎</span> In Stock — Ships within 24 hours
      </div>
    </div>
  );
}

