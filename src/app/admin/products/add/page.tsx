"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Cookware",
    material: "Triply Stainless Steel",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "10",
    image: "/product-kadai.png",
    description: "",
    capacity: "3.5L",
    weight: "",
    dimensions: "",
    badge: "",
    featured: false,
    bestseller: false,
    active: true,
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.categories.length > 0) {
          setCategories(res.categories);
          setForm((f) => ({ ...f, category: res.categories[0].name }));
        }
      })
      .catch(() => {});
  }, []);

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
    if (!form.price || Number(form.price) < 0) return setError("Valid positive price is required.");
    if (Number(form.stock) < 0) return setError("Stock cannot be negative.");
    if (!form.description.trim()) return setError("Description is required.");

    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin/products");
      } else {
        setError(data.error || "Failed to create product.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/admin/products" style={{ color: "#B45309", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
            ← Back to Products
          </Link>
          <h1 style={{ margin: "6px 0 0 0", fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Add New Utensil / Cookware
          </h1>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 600 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Basic Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Premium Triply Stainless Steel Kadai with Lid"
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
              {categories.length === 0 && <option value="Cookware">Cookware</option>}
            </select>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Selling Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              min="0"
              placeholder="2499"
              value={form.price}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              MRP / Original Price (₹)
            </label>
            <input
              type="number"
              name="originalPrice"
              min="0"
              placeholder="3299"
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
              placeholder="24"
              value={form.discount}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Initial Stock Count *
            </label>
            <input
              type="number"
              name="stock"
              min="0"
              placeholder="25"
              value={form.stock}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        {/* Material & Specs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Material
            </label>
            <input
              type="text"
              name="material"
              placeholder="e.g. Pure Brass, 18/8 Stainless Steel"
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
              placeholder="e.g. 3.5 Litres, 24 cm diameter"
              value={form.capacity}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Badge (Optional)
            </label>
            <input
              type="text"
              name="badge"
              placeholder="e.g. Best Seller, Festival Special"
              value={form.badge}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
            Image URL / Path *
          </label>
          <input
            type="text"
            name="image"
            placeholder="/product-kadai.png or https://example.com/image.jpg"
            value={form.image}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem" }}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
            Product Description *
          </label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe the cookware features, durability, stove compatibility (gas, induction), and warranty..."
            value={form.description}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.9rem", resize: "vertical" }}
          />
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            Publish Product Active
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
            Mark as Featured Product
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" name="bestseller" checked={form.bestseller} onChange={handleChange} />
            Mark as Best Seller
          </label>
        </div>

        {/* Submit Buttons */}
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
            disabled={loading}
            style={{
              padding: "10px 24px",
              backgroundColor: "#B45309",
              color: "#FFFFFF",
              borderRadius: "6px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating..." : "Save & Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}