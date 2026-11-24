"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = () => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setReviews(res.reviews || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <Link href="/admin/products" style={{ color: "#B45309", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
          ← Back to Products
        </Link>
        <h1 style={{ margin: "6px 0 0 0", fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Customer Reviews & Moderation
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Moderate customer product feedback and ratings before or after display
        </p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No customer reviews submitted yet.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.productName}</td>
                    <td>
                      <div>{r.customerName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{r.customerEmail}</div>
                    </td>
                    <td>
                      <span style={{ color: "#F59E0B", fontWeight: 700 }}>★ {r.rating} / 5</span>
                    </td>
                    <td style={{ maxWidth: "300px" }}>
                      {r.title && <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{r.title}</div>}
                      <div style={{ fontSize: "0.8rem", color: "#4B5563" }}>{r.comment}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: r.status === "approved" ? "#D1FAE5" : r.status === "pending" ? "#FEF3C7" : "#F3F4F6",
                          color: r.status === "approved" ? "#065F46" : r.status === "pending" ? "#92400E" : "#374151",
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {r.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "approved")}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#D1FAE5",
                              color: "#065F46",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== "hidden" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "hidden")}
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#F3F4F6",
                              color: "#4B5563",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Hide
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}