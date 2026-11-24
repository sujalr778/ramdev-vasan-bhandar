"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AllProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch categories
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(() => {});
  }, []);

  // Fetch products
  const loadProducts = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: "12",
      search,
      category: selectedCategory,
      status: stockStatus,
      sort,
    });

    fetch(`/api/admin/products?${query.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProducts(res.products || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalProducts(res.pagination?.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, stockStatus, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, active: !currentActive } : p))
        );
      }
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setTotalProducts((prev) => Math.max(0, prev - 1));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleDuplicate = async (product: any) => {
    try {
      const duplicateData = {
        ...product,
        name: `${product.name} (Copy)`,
        slug: `${product.slug || "product"}-copy-${Date.now()}`,
        sku: `RVB-CPY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };
      delete duplicateData._id;
      delete duplicateData.id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicateData),
      });
      const data = await res.json();
      if (data.success) {
        loadProducts();
        alert("Product duplicated successfully.");
      }
    } catch (err) {
      alert("Failed to duplicate product");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Product Management
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
            Total {totalProducts} cookware and utensils items in inventory
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/admin/products/categories"
            style={{
              padding: "8px 14px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#374151",
              textDecoration: "none",
            }}
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/products/add"
            style={{
              padding: "8px 16px",
              backgroundColor: "#B45309",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>+</span> Add New Product
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px", border: "1px solid #E5E7EB", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "240px" }}>
          <input
            type="text"
            placeholder="Search by product name, SKU, material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#F3F4F6",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockStatus}
            onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
          >
            <option value="all">All Stock Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="low_stock">Low Stock (≤ 5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{ padding: "8px 10px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
          >
            <option value="newest">Newest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="stock_asc">Stock (Low to High)</option>
            <option value="stock_desc">Stock (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Material</th>
                <th>Price / MRP</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading products from database...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No products found. Click "Add New Product" to create your first item.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "6px",
                            backgroundColor: "#F3F4F6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          🍳
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#111827" }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>SKU: {p.sku || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{p.material || "Stainless Steel"}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, color: "#111827" }}>₹{p.price.toLocaleString("en-IN")}</span>
                        {p.originalPrice && (
                          <span style={{ fontSize: "0.75rem", color: "#9CA3AF", textDecoration: "line-through", marginLeft: "6px" }}>
                            ₹{p.originalPrice}
                          </span>
                        )}
                      </div>
                      {p.discount ? (
                        <span style={{ fontSize: "0.7rem", color: "#059669", fontWeight: 600 }}>{p.discount}% OFF</span>
                      ) : null}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: p.stock <= 0 ? "#DC2626" : p.stock <= 5 ? "#D97706" : "#059669",
                        }}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(p.id, p.active !== false)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "9999px",
                          border: "none",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          backgroundColor: p.active !== false ? "#D1FAE5" : "#F3F4F6",
                          color: p.active !== false ? "#065F46" : "#6B7280",
                        }}
                      >
                        {p.active !== false ? "● Active" : "○ Inactive"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#FEF3C7",
                            color: "#92400E",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDuplicate(p)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#E0E7FF",
                            color: "#3730A3",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          title="Duplicate Product"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#FEE2E2",
                            color: "#991B1B",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          title="Delete Product"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            Page {page} of {totalPages} ({totalProducts} items total)
          </span>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 12px",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                backgroundColor: "#FFFFFF",
                fontSize: "0.8rem",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                opacity: page <= 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 12px",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                backgroundColor: "#FFFFFF",
                fontSize: "0.8rem",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                opacity: page >= totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}