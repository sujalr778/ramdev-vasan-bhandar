"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setNotifications(res.notifications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Admin Notifications & Operational Alerts
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Real-time system events requiring store manager attention
        </p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#059669" }}>
            ✓ No urgent alerts. All orders processed and stock levels are healthy!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "1.5rem" }}>
                    {n.type === "new_order" ? "🔔" : n.type === "out_of_stock" ? "❌" : n.type === "low_stock" ? "⚠" : "💳"}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>{n.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "#4B5563", marginTop: "2px" }}>{n.message}</div>
                  </div>
                </div>

                <Link
                  href={n.link || "/admin"}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: "#FEF3C7",
                    color: "#92400E",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Take Action →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}