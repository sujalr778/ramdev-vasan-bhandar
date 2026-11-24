"use client";

import React, { useState, useEffect } from "react";

export default function WebsiteManagementPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "/product-kadai.png",
    linkUrl: "/shop",
    type: "hero",
    displayOrder: 0,
    active: true,
  });

  const loadBanners = () => {
    setLoading(true);
    fetch("/api/admin/website")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setBanners(res.banners || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.imageUrl.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setForm({ title: "", subtitle: "", imageUrl: "/product-kadai.png", linkUrl: "/shop", type: "hero", displayOrder: 0, active: true });
        loadBanners();
      }
    } catch (err) {
      alert("Failed to add banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (b: any) => {
    try {
      const res = await fetch("/api/admin/website", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, active: !b.active }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.map((item) => (item.id === b.id ? { ...item, active: !b.active } : item)));
      }
    } catch (err) {
      alert("Failed to toggle banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/website?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert("Failed to delete banner");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Store Website & Banner Management
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
            Control customer-facing hero carousel, promotional banners, and display order
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#B45309",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add New Banner
        </button>
      </div>

      {/* Banners Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#6B7280" }}>
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", backgroundColor: "#FFFFFF", padding: "40px", borderRadius: "10px", border: "1px solid #E5E7EB", textAlign: "center", color: "#9CA3AF" }}>
            No banners configured yet. Add your first hero or promotional banner above.
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  height: "140px",
                  backgroundColor: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#B45309",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  position: "relative",
                }}
              >
                {b.imageUrl ? (
                  <span style={{ fontSize: "2.5rem" }}>🍳</span>
                ) : (
                  <span>No Image</span>
                )}
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    backgroundColor: b.type === "hero" ? "#1E40AF" : "#065F46",
                    color: "#FFFFFF",
                  }}
                >
                  {b.type}
                </span>
              </div>

              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>{b.title}</div>
                  {b.subtitle && <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "2px" }}>{b.subtitle}</div>}
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "6px" }}>Link: {b.linkUrl} • Order: #{b.displayOrder}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F3F4F6" }}>
                  <button
                    onClick={() => handleToggleActive(b)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "9999px",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: b.active ? "#D1FAE5" : "#F3F4F6",
                      color: b.active ? "#065F46" : "#6B7280",
                    }}
                  >
                    {b.active ? "● Active" : "○ Inactive"}
                  </button>

                  <button
                    onClick={() => handleDelete(b.id)}
                    style={{ padding: "4px 10px", backgroundColor: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", maxWidth: "480px", width: "100%", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Add Store Banner</h2>
              <button onClick={() => setShowAddModal(false)} style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreateBanner} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Banner Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Master Chef Triply Cookware Collection"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Up to 40% Off on Premium Kadai and Tawa"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Image URL *</label>
                <input
                  type="text"
                  placeholder="/product-kadai.png or external URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Banner Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                  >
                    <option value="hero">Hero Carousel</option>
                    <option value="promotional">Promotional Banner</option>
                    <option value="category">Category Banner</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "8px 14px", border: "1px solid #D1D5DB", borderRadius: "6px", background: "none", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ padding: "8px 18px", backgroundColor: "#B45309", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>
                  {submitting ? "Saving..." : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}