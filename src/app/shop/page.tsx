import { Suspense } from "react";
import Link from "next/link";
import styles from "./Shop.module.css";
import productStyles from "../page.module.css";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/ShopFilters";
import Product from "@/models/Product";
import connectToDatabase from "@/lib/mongoose";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const queryParams = await searchParams;
  const category = queryParams.category || "";
  const q = queryParams.q || "";
  const minPrice = queryParams.minPrice || "";
  const maxPrice = queryParams.maxPrice || "";
  const sort = queryParams.sort || "featured";
  const currentPage = Math.max(1, parseInt(queryParams.page || "1", 10));

  // Query MongoDB products and pagination
  const result: any = await db.products.findMany({
    category,
    q,
    minPrice,
    maxPrice,
    sort,
    page: currentPage,
    limit: 12
  });

  const products = Array.isArray(result) ? result : (result.products || []);
  const pagination = Array.isArray(result)
    ? { page: 1, limit: products.length, totalProducts: products.length, totalPages: 1, hasMore: false }
    : (result.pagination || { page: 1, limit: 12, totalProducts: products.length, totalPages: 1, hasMore: false });

  // Fetch distinct categories from database for filters
  let categories: string[] = ["Kadai", "Fry Pan", "Tawa", "Pressure Cooker", "Handi", "Specialty"];
  try {
    await connectToDatabase();
    const dbCategories = await Product.distinct("category");
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories;
    }
  } catch (e) {
    console.warn("Using fallback categories:", (e as Error).message);
  }

  // Construct URL builder for pagination links
  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort && sort !== "featured") params.set("sort", sort);
    params.set("page", targetPage.toString());
    return `/shop?${params.toString()}`;
  };

  const hasActiveFilters = Boolean(category || q || minPrice || maxPrice);

  return (
    <div className={`container ${styles.shopContainer}`}>
      {/* Sidebar Filters */}
      <Suspense fallback={null}>
        <ShopFilters categories={categories} totalProducts={pagination.totalProducts} />
      </Suspense>


      {/* Main Catalog Content */}
      <main className={styles.mainContent}>
        <div className={styles.shopHeader}>
          <div className={styles.headerTitleGroup}>
            <h1 className="heading-primary" style={{ fontSize: "1.75rem", marginBottom: 0 }}>
              {q ? `Search results for "${q}"` : category ? category : "All Utensils & Cookware"}
            </h1>
            <span className={styles.productCount}>
              Showing {products.length} of {pagination.totalProducts} products
            </span>
          </div>
        </div>

        {/* Active Filter Pills Summary */}
        {hasActiveFilters && (
          <div className={styles.activePillsRow}>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)", fontWeight: 500 }}>Active Filters:</span>
            {q && (
              <span className={styles.activePillTag}>
                Search: "{q}"
                <Link href={buildPageUrl(1).replace(`q=${encodeURIComponent(q)}`, "")} aria-label="Remove search filter">✕</Link>
              </span>
            )}
            {category && (
              <span className={styles.activePillTag}>
                Category: {category}
                <Link href={buildPageUrl(1).replace(`category=${encodeURIComponent(category)}`, "")} aria-label="Remove category filter">✕</Link>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className={styles.activePillTag}>
                Price: ₹{minPrice || "0"} – ₹{maxPrice || "10,000+"}
                <Link href="/shop" aria-label="Remove price filter">✕</Link>
              </span>
            )}
            <Link href="/shop" className={styles.clearAllLink} style={{ marginLeft: "4px" }}>
              Clear All
            </Link>
          </div>
        )}

        {/* Product Catalog Grid or Empty State */}
        {products.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🍳</div>
            <h3 className={styles.emptyStateTitle}>No products found</h3>
            <p className={styles.emptyStateText}>
              We couldn't find any utensils matching your selected search or filter criteria. Try clearing your filters or searching for another item.
            </p>
            <div className={styles.emptyStateActions}>
              <Link href="/shop" className={styles.btnPrimary}>
                Clear All Filters
              </Link>
            </div>
            <div className={styles.emptyCategoryTitle}>Or browse popular categories:</div>
            <div className={styles.emptyCategoryChips}>
              {categories.slice(0, 5).map((cat) => (
                <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} className={styles.chip}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={productStyles.productGrid}>
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className={styles.paginationRow}>
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className={`${styles.pageBtn} ${currentPage <= 1 ? styles.pageBtnDisabled : ""}`}
                >
                  ← Prev
                </Link>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={buildPageUrl(pageNum)}
                    className={`${styles.pageBtn} ${pageNum === currentPage ? styles.pageBtnActive : ""}`}
                  >
                    {pageNum}
                  </Link>
                ))}

                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className={`${styles.pageBtn} ${currentPage >= pagination.totalPages ? styles.pageBtnDisabled : ""}`}
                >
                  Next →
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
