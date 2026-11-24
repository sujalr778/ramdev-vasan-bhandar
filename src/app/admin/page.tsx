"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminCard from "@/components/admin/AdminCard";
import SalesChart from "@/components/admin/SalesChart";
import StatusBadge from "@/components/admin/StatusBadge";

export default function MainDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30d");

  const fetchAnalytics = (tf: string) => {
    setLoading(true);
    fetch(`/api/admin/analytics?timeframe=${tf}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setAnalytics(res);
        }
      })
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  if (loading && !analytics) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#6B7280" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #E5E7EB", borderTop: "3px solid #B45309", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px auto" }} />
        <span>Loading real-time MongoDB store analytics...</span>
      </div>
    );
  }

  const revenue = analytics?.revenue || { total: 0, today: 0, thisWeek: 0, thisMonth: 0 };
  const orders = analytics?.orders || { total: 0, today: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const products = analytics?.products || { total: 0, active: 0, lowStock: 0, outOfStock: 0 };
  const customers = analytics?.customers || { total: 0, new: 0, returning: 0 };
  const recentOrders = analytics?.recentOrders || [];
  const lowStockItems = analytics?.lowStockItems || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner & Quick Status */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#111827" }}>
            Business Overview
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.9rem" }}>
            Welcome to Ramdev Vasan Bhandar live administration dashboard.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => fetchAnalytics(timeframe)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            <span>↻</span> Refresh Live Data
          </button>

          <Link
            href="/admin/products/add"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#B45309",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span>+</span> Add Product
          </Link>
        </div>
      </div>

      {/* 1. REVENUE KPIS (4 Cards) */}
      <div>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          Revenue Metrics
        </div>
        <div className="admin-grid-4">
          <AdminCard
            title="Today's Revenue"
            value={`₹${revenue.today.toLocaleString("en-IN")}`}
            subtitle="Calculated from today's orders"
            accentColor="#059669"
            icon={<span>₹</span>}
          />
          <AdminCard
            title="This Week"
            value={`₹${revenue.thisWeek.toLocaleString("en-IN")}`}
            subtitle="Current calendar week"
            accentColor="#2563EB"
            icon={<span>📅</span>}
          />
          <AdminCard
            title="This Month"
            value={`₹${revenue.thisMonth.toLocaleString("en-IN")}`}
            subtitle="Current calendar month"
            accentColor="#7C3AED"
            icon={<span>📊</span>}
          />
          <AdminCard
            title="Total Revenue"
            value={`₹${revenue.total.toLocaleString("en-IN")}`}
            subtitle="All-time lifetime sales"
            accentColor="#B45309"
            icon={<span>💰</span>}
          />
        </div>
      </div>

      {/* 2. ORDER STATUS KPIS (6 items in responsive grid) */}
      <div>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          Order Pipeline & Fulfillment
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px" }}>
          <AdminCard title="Today's Orders" value={orders.today} accentColor="#2563EB" subtitle="Placed today" />
          <AdminCard title="Pending" value={orders.pending} accentColor="#D97706" subtitle="Awaiting review" />
          <AdminCard title="Processing" value={orders.processing} accentColor="#3B82F6" subtitle="In packing" />
          <AdminCard title="Shipped" value={orders.shipped} accentColor="#6366F1" subtitle="In transit" />
          <AdminCard title="Delivered" value={orders.delivered} accentColor="#10B981" subtitle="Completed orders" />
          <AdminCard title="Cancelled" value={orders.cancelled} accentColor="#EF4444" subtitle="Voided orders" />
        </div>
      </div>

      {/* 3. PRODUCT & CUSTOMER METRICS */}
      <div className="admin-grid-4">
        <AdminCard
          title="Total Products"
          value={products.total}
          subtitle={`${products.active} Active on store`}
          accentColor="#B45309"
          icon={<span>🍳</span>}
        />
        <AdminCard
          title="Low Stock Alert"
          value={products.lowStock}
          subtitle="≤ 5 units remaining"
          accentColor="#D97706"
          icon={<span>⚠</span>}
        />
        <AdminCard
          title="Out of Stock"
          value={products.outOfStock}
          subtitle="Requires immediate restock"
          accentColor="#DC2626"
          icon={<span>❌</span>}
        />
        <AdminCard
          title="Total Customers"
          value={customers.total}
          subtitle={`${customers.new} New • ${customers.returning} Returning`}
          accentColor="#059669"
          icon={<span>👥</span>}
        />
      </div>

      {/* 4. SALES GRAPH */}
      <SalesChart
        data={analytics?.salesChart || []}
        timeframe={timeframe}
        onTimeframeChange={(tf) => setTimeframe(tf)}
      />

      {/* 5. SPLIT SECTION: RECENT ORDERS & LOW STOCK ALERT */}
      <div className="admin-grid-2">
        {/* Recent Orders */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: "0.8rem", color: "#B45309", textDecoration: "none", fontWeight: 600 }}>
              View All Orders →
            </Link>
          </div>

          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "30px", color: "#9CA3AF" }}>
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o: any) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>#{o.orderNumber}</td>
                      <td>{o.customer}</td>
                      <td style={{ fontWeight: 600 }}>₹{o.amount.toLocaleString("en-IN")}</td>
                      <td>
                        <StatusBadge status={o.status} type="order" />
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders/${o.id}`}
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            backgroundColor: "#FEF3C7",
                            color: "#92400E",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.2rem" }}>⚠</span>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Low Stock Alert</h3>
            </div>
            <Link href="/admin/inventory" style={{ fontSize: "0.8rem", color: "#B45309", textDecoration: "none", fontWeight: 600 }}>
              Manage Inventory →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {lowStockItems.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "#059669", backgroundColor: "#ECFDF5", borderRadius: "8px" }}>
                ✓ All cookware inventory levels are healthy!
              </div>
            ) : (
              lowStockItems.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: "#FFFBEB",
                    borderRadius: "8px",
                    border: "1px solid #FDE68A",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>{item.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#B45309" }}>{item.category} • ₹{item.price}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        backgroundColor: item.stock <= 0 ? "#FEE2E2" : "#FEF3C7",
                        color: item.stock <= 0 ? "#DC2626" : "#B45309",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: "4px",
                      }}
                    >
                      {item.stock <= 0 ? "Out of Stock" : `${item.stock} left`}
                    </span>

                    <Link
                      href="/admin/inventory"
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#1E40AF",
                        textDecoration: "none",
                      }}
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}