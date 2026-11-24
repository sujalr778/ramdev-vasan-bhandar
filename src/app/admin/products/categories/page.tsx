"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCatName("");
        setNewCatDesc("");
        loadCategories();
      } else {
        alert(data.error || "Failed to add category");
      }
    } catch (err) {
      alert("Error adding category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: any) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, active: !cat.active }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c)));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/admin/products" style={{ color: "#B45309", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
            ← Back to Products
          </Link>
          <h1 style={{ margin: "6px 0 0 0", fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Cookware Categories
          </h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Add Form */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
            Add Category
          </h3>
          <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Category Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Copper Cookware"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Short description of this utensil category..."
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px",
                backgroundColor: "#B45309",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Adding..." : "+ Create Category"}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, color: "#111827" }}>
            Active Store Categories ({categories.length})
          </div>

          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                      Loading categories...
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{c.name}</div>
                        {c.description && <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{c.description}</div>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "#B45309" }}>{c.productCount}</span> items
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleActive(c)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "9999px",
                            border: "none",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            backgroundColor: c.active ? "#D1FAE5" : "#F3F4F6",
                            color: c.active ? "#065F46" : "#6B7280",
                          }}
                        >
                          {c.active ? "● Active" : "○ Inactive"}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
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
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}