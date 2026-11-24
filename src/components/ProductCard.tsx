"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatINR, calculateDiscount } from "@/lib/format";
import styles from "@/app/page.module.css";

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const discount = calculateDiscount(product.originalPrice, product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/shop/${product._id}`} className={styles.productCard}>
      <div className={styles.productImageWrapper}>
        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4, zIndex: 5 }}>
          {product.badge && (
            <span className={product.badge.includes('ECO') ? styles.badgeEco : styles.badgeGold}>
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span style={{
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              fontSize: "0.625rem",
              fontWeight: 700,
              padding: "3px 6px",
              borderRadius: "2px",
              letterSpacing: "0.04em",
              alignSelf: "flex-start"
            }}>
              {discount}% OFF
            </span>
          )}
        </div>

        <Image
          src={product.image}
          alt={product.name}
          fill
          className={styles.productImage}
          style={{ opacity: isOutOfStock ? 0.6 : 1 }}
        />
      </div>

      <div className={styles.productInfo}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div className={styles.productCategory}>{product.category}</div>
          {product.capacity && (
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 500 }}>
              {product.capacity}
            </span>
          )}
        </div>

        <h3 className={styles.productName} title={product.name}>
          {product.name}
        </h3>

        <div className={styles.productRating}>
          <span style={{ color: "#d97706" }}>{"★".repeat(Math.floor(product.rating || 5))}</span>
          <span style={{ color: "#d1d5db" }}>{"☆".repeat(5 - Math.floor(product.rating || 5))}</span>
          <span className={styles.ratingCount}>({product.reviews || 0})</span>
        </div>

        <div className={styles.productPriceRow}>
          <div>
            <span className={styles.price}>{formatINR(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className={styles.originalPrice}>{formatINR(product.originalPrice)}</span>
            )}
          </div>

          <button
            className={styles.addToCartBtn}
            aria-label={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
            style={{
              backgroundColor: added ? "var(--success)" : undefined,
              color: added ? "#ffffff" : undefined,
              transition: "all 0.2s ease"
            }}
          >
            {isOutOfStock ? (
              <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>N/A</span>
            ) : added ? (
              <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>✓</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
