"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    material: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    image: "",
    description: "",
    capacity: "",
    badge: "",
    featured: false,
    bestseller: false,
    active: true,
  });

  useEffect(() => {
    // Load categories
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(() => {});

    // Load product
    if (id) {
      fetch(`/api/admin/products/${id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.product) {
            const p = res.product;
            setForm({
              name: p.name || "",
              category: p.category || "",
              material: p.material || "",
              price: p.price?.toString() || "0",
              originalPrice: p.originalPrice?.toString() || "",
              discount: p.discount?.toString() || "",
              stock: p.stock?.toString() || "0",
              image: p.image || "",
              description: p.description || "",
              capacity: p.capacity || "",
              badge: p.badge || "",
              featured: Boolean(p.featured),
              bestseller: Boolean(p.bestseller),
              active: p.active !== false,
            });
          } else {
            setError(res.error || "Product not found.");
          }
        })
        .catch(() => setError("Failed to fetch product details."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Product name is required.");
    if (Number(form.price) < 0) return setError("Price cannot be negative.");
    if (Number(form.stock) < 0) return setError("Stock cannot be negative.");

    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
          discount: form.discount ? Number(form.discount) : undefined,
          stock: Number(form.stock),
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to update product.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading product details...</div>;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <Link href="/admin/products" style={{ color: "#B45309", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
          ← Back to Products
        </Link>
        <h1 style={{ margin: "6px 0 0 0", fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Edit Product: {form.name}
        </h1>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem", backgroundColor: "#FFFFFF" }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Selling Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              MRP / Original (₹)
            </label>
            <input
              type="number"
              name="originalPrice"
              min="0"
              value={form.originalPrice}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              value={form.discount}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Material
            </label>
            <input
              type="text"
              name="material"
              value={form.material}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Capacity / Dimensions
            </label>
            <input
              type="text"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Badge
            </label>
            <input
              type="text"
              name="badge"
              value={form.badge}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
            Image URL / Path
          </label>
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
            Description *
          </label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem", resize: "vertical" }}
          />
        </div>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            Product Active
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Featured
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" name="bestseller" checked={form.bestseller} onChange={handleChange} />
            Best Seller
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <Link
            href="/admin/products"
            style={{
              padding: "10px 18px",
              backgroundColor: "#F3F4F6",
              color: "#4B5563",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 24px",
              backgroundColor: "#B45309",
              color: "#FFFFFF",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}