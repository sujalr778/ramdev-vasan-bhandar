"use client";

import React, { useState, useEffect } from "react";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("Special Festive Offer");
  const [discountValue, setDiscountValue] = useState("15");
  const [submitting, setSubmitting] = useState(false);

  const loadOffers = () => {
    setLoading(true);
    fetch("/api/admin/offers")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOffers(res.offers || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          badge: badge.trim(),
          discountValue: Number(discountValue) || 10,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        loadOffers();
      }
    } catch (err) {
      alert("Error adding campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotional offer?")) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      alert("Failed to delete offer");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Promotional Offers & Festive Campaigns
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Control store banners, seasonal discounts (Diwali Sale, Kitchen Combos, Special Weekend Deals)
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Create Campaign */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
            Add Festive Sale / Campaign
          </h3>

          <form onSubmit={handleCreateOffer} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                Campaign Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Diwali Utensil Mega Sale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                Badge Label
              </label>
              <input
                type="text"
                placeholder="e.g. Festival Offer"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                Discount Value (%)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
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
                cursor: "pointer",
                marginTop: "6px",
              }}
            >
              {submitting ? "Creating..." : "+ Launch Campaign"}
            </button>
          </form>
        </div>

        {/* Existing Offers */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, color: "#111827" }}>
            Active Promotional Campaigns ({offers.length})
          </div>

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {offers.length === 0 ? (
              <p style={{ color: "#9CA3AF", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>
                No promotional campaigns running. Launch a festive offer above.
              </p>
            ) : (
              offers.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, backgroundColor: "#B45309", color: "#FFFFFF", padding: "2px 6px", borderRadius: "4px" }}>
                      {o.badge}
                    </span>
                    <div style={{ fontWeight: 700, color: "#111827", marginTop: "4px" }}>{o.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>Discount: {o.discountValue}% OFF</div>
                  </div>

                  <button
                    onClick={() => handleDelete(o.id)}
                    style={{ padding: "4px 8px", backgroundColor: "#FEE2E2", color: "#991B1B", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}