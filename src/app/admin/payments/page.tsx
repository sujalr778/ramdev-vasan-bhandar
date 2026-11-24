"use client";

import React, { useState, useEffect } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadPayments = () => {
    setLoading(true);
    const q = new URLSearchParams({ method: methodFilter, status: statusFilter });
    fetch(`/api/admin/payments?${q.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setPayments(res.payments || []);
          setSummary(res.summary || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, [methodFilter, statusFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Payment Management & Reconciliation
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Track real payment receipts across Cash on Delivery (COD) and Online Gateway
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#059669" }}>TOTAL PAID REVENUE</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
            ₹{(summary.totalPaid || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" }}>{summary.paidCount || 0} completed transactions</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#D97706" }}>PENDING REVENUE</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#D97706", marginTop: "4px" }}>
            ₹{(summary.totalPending || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" }}>{summary.pendingCount || 0} pending payments / COD</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#DC2626" }}>FAILED PAYMENTS</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#DC2626", marginTop: "4px" }}>
            ₹{(summary.totalFailed || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" }}>{summary.failedCount || 0} failed checkout attempts</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#2563EB" }}>COD VS ONLINE SPLIT</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", marginTop: "6px" }}>
            COD: ₹{(summary.codTotal || 0).toLocaleString("en-IN")} ({summary.codCount || 0})
          </div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#2563EB", marginTop: "2px" }}>
            Online: ₹{(summary.onlineTotal || 0).toLocaleString("en-IN")} ({summary.onlineCount || 0})
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "14px 16px", border: "1px solid #E5E7EB", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>Filters:</span>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
        >
          <option value="all">All Methods (COD & Online)</option>
          <option value="cod">Cash on Delivery (COD)</option>
          <option value="online">Online Payment Gateway</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #D1D5DB", fontSize: "0.85rem", backgroundColor: "#FFFFFF" }}
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cod_pending">COD Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Transaction ID / Ref</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>#{p.orderNumber}</td>
                    <td>{p.customer}</td>
                    <td style={{ fontWeight: 700 }}>₹{p.amount.toLocaleString("en-IN")}</td>
                    <td>
                      <span style={{ textTransform: "uppercase", fontWeight: 600, fontSize: "0.8rem" }}>{p.method}</span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#4B5563" }}>{p.transactionId}</td>
                    <td>
                      <StatusBadge status={p.status} type="payment" />
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {new Date(p.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
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