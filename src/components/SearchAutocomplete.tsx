"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./SearchAutocomplete.module.css";

export default function SearchAutocomplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with URL query parameter changes
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Debounced autocomplete fetch
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setCategories([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.products || []);
          setSuggestions(items);

          // Extract matching categories
          const uniqueCats = Array.from(new Set(items.map((p: any) => p.category).filter(Boolean))) as string[];
          setCategories(uniqueCats);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setCategories([]);
    setIsOpen(false);
    router.push("/shop");
  };

  return (
    <div ref={containerRef} className={styles.searchContainer}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.inputWrapper}>
          <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search kadai, tawa, pressure cooker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          />
          {query && (
            <button type="button" onClick={handleClear} className={styles.clearBtn} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className={styles.dropdown}>
          {isLoading && <div className={styles.loadingItem}>Searching products...</div>}

          {!isLoading && suggestions.length === 0 && (
            <div className={styles.noResults}>No matching products found</div>
          )}

          {!isLoading && categories.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Categories</div>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className={styles.categorySuggestion}
                  onClick={() => setIsOpen(false)}
                >
                  📁 <span>{cat}</span>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Products</div>
              {suggestions.map((item) => (
                <Link
                  key={item._id}
                  href={`/shop/${item._id}`}
                  className={styles.productSuggestion}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={styles.thumbWrapper}>
                    <Image src={item.image} alt={item.name} width={40} height={40} className={styles.thumb} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemCategory}>{item.category}</span>
                      <span className={styles.itemPrice}>₹{item.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
              <div className={styles.viewAllWrapper}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className={styles.viewAllBtn}
                >
                  View all results for "{query}" →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
