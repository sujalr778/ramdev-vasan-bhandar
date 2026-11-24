"use client";

import React, { useState, useEffect } from "react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "10",
    minOrderValue: "999",
    maxDiscount: "300",
    expiryDate: "",
    usageLimit: "100",
    active: true,
  });

  const loadCoupons = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCoupons(res.coupons || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        loadCoupons();
      } else {
        alert(data.error || "Failed to create coupon.");
      }
    } catch (err) {
      alert("Error creating coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (c: any) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, active: !c.active }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.map((item) => (item.id === c.id ? { ...item, active: !c.active } : item)));
      }
    } catch (err) {
      alert("Failed to toggle coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Coupon Codes & Discounts
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
            Configure promotional discount codes with strict server-side checkout validation
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
          + Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Max Cap</th>
                <th>Usage</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No active coupons found. Click "+ Create Coupon" to add promotional codes like RAMDEV10.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: "#B45309", backgroundColor: "#FEF3C7", padding: "4px 8px", borderRadius: "4px" }}>
                        {c.code}
                      </span>
                      {c.description && <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>{c.description}</div>}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#111827" }}>
                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </span>
                    </td>
                    <td>₹{c.minOrderValue || 0}</td>
                    <td>{c.maxDiscount ? `₹${c.maxDiscount}` : "No Limit"}</td>
                    <td>{c.usedCount} / {c.usageLimit || "∞"}</td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "Never"}
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
                        onClick={() => handleDelete(c.id)}
                        style={{ padding: "4px 8px", backgroundColor: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
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

      {/* Create Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", maxWidth: "500px", width: "100%", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Create New Coupon</h2>
              <button onClick={() => setShowAddModal(false)} style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. RAMDEV10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", textTransform: "uppercase" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="999"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="300"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "8px 14px", border: "1px solid #D1D5DB", borderRadius: "6px", background: "none", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ padding: "8px 18px", backgroundColor: "#B45309", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>
                  {submitting ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}