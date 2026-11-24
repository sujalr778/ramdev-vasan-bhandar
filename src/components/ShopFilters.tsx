"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "@/app/shop/Shop.module.css";

interface ShopFiltersProps {
  categories: string[];
  totalProducts: number;
}

export default function ShopFilters({ categories, totalProducts }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentQ = searchParams.get("q") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSort = searchParams.get("sort") || "featured";

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 whenever filters change
    params.delete("page");

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput ? minPriceInput : null,
      maxPrice: maxPriceInput ? maxPriceInput : null,
    });
  };

  const handleClearAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/shop");
  };

  const hasActiveFilters = Boolean(currentCategory || currentQ || currentMinPrice || currentMaxPrice || (currentSort && currentSort !== "featured"));

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className={styles.mobileFilterBar}>
        <button
          className={styles.mobileFilterToggleBtn}
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          Filters & Sort {hasActiveFilters && <span className={styles.activeDot} />}
        </button>
        <div className={styles.mobileCountText}>{totalProducts} Products</div>
      </div>

      <aside className={`${styles.sidebar} ${mobileDrawerOpen ? styles.mobileDrawerActive : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2 className="heading-secondary" style={{ fontSize: "1.25rem", margin: 0 }}>
            Filter Products
          </h2>
          {hasActiveFilters && (
            <button onClick={handleClearAll} className={styles.clearAllLink}>
              Clear All
            </button>
          )}
          <button className={styles.closeDrawerBtn} onClick={() => setMobileDrawerOpen(false)}>
            ✕
          </button>
        </div>

        {/* Search Query Filter Pill */}
        {currentQ && (
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Search Query</h3>
            <div className={styles.activePill}>
              <span>"{currentQ}"</span>
              <button onClick={() => updateFilters({ q: null })} aria-label="Remove search filter">✕</button>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Categories</h3>
          <ul className={styles.filterList}>
            <li>
              <button
                className={`${styles.filterListBtn} ${!currentCategory ? styles.filterListBtnActive : ""}`}
                onClick={() => updateFilters({ category: null })}
              >
                All Products
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  className={`${styles.filterListBtn} ${currentCategory.toLowerCase() === cat.toLowerCase() ? styles.filterListBtnActive : ""}`}
                  onClick={() => updateFilters({ category: cat })}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range Filter */}
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Price Range (₹)</h3>
          <form onSubmit={handlePriceApply} className={styles.priceForm}>
            <div className={styles.priceInputsRow}>
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className={styles.priceInput}
              />
              <span className={styles.priceSeparator}>–</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className={styles.priceInput}
              />
            </div>
            <button type="submit" className={styles.applyPriceBtn}>
              Apply Price
            </button>
          </form>
        </div>

        {/* Sorting in Sidebar for Mobile */}
        <div className={`${styles.filterGroup} ${styles.mobileSortGroup}`}>
          <h3 className={styles.filterTitle}>Sort By</h3>
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className={styles.sortSelect}
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Customer Rating</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </aside>
    </>
  );
}
