"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AllOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [orders, setOrders] = useState<any[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const tabs = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const loadOrders = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: "15",
      status: selectedStatus,
      paymentStatus,
      search,
    });

    fetch(`/api/admin/orders?${query.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setOrders(res.orders || []);
          setTabCounts(res.tabCounts || {});
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalOrders(res.pagination?.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [page, selectedStatus, paymentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Order Management
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
            Total {totalOrders} orders across store pipeline
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", borderBottom: "1px solid #E5E7EB", paddingBottom: "8px" }}>
        {tabs.map((t) => {
          const active = selectedStatus === t.key;
          const count = tabCounts[t.key] !== undefined ? tabCounts[t.key] : "";
          return (
            <button
              key={t.key}
              onClick={() => { setSelectedStatus(t.key); setPage(1); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: active ? "#B45309" : "#FFFFFF",
                color: active ? "#FFFFFF" : "#4B5563",
                fontWeight: active ? 700 : 500,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                whiteSpace: "nowrap",
              }}
            >
              <span>{t.label}</span>
              {count !== "" && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: "9999px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    backgroundColor: active ? "#78350F" : "#F3F4F6",
                    color: active ? "#FFFFFF" : "#6B7280",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Payment Filter */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px", border: "1px solid #E5E7EB", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: 1, minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search by customer name, mobile, pincode, city..."
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

        <div>
          <select
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cod_pending">COD Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer Info</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment Mode</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No orders found matching this filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#111827" }}>#{o.orderNumber}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{o.customer.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                        {o.customer.mobile} {o.customer.city ? `• ${o.customer.city}` : ""}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{o.itemsCount}</span> items
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#111827" }}>
                        ₹{o.totalAmount.toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                        {o.deliveryCharge === 0 ? "Free Delivery" : `+₹${o.deliveryCharge} Delivery`}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>{o.paymentMethod}</span>
                        <StatusBadge status={o.paymentStatus} type="payment" />
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={o.status} type="order" />
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          backgroundColor: "#B45309",
                          color: "#FFFFFF",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            Page {page} of {totalPages}
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