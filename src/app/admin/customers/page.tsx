"use client";

import React, { useState, useEffect } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Selected customer for drawer
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const loadCustomers = () => {
    setLoading(true);
    const q = new URLSearchParams({ page: page.toString(), limit: "15", search });
    fetch(`/api/admin/customers?${q.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCustomers(res.customers || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalCustomers(res.pagination?.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const viewCustomerDetails = (id: string) => {
    setLoadingCustomer(true);
    fetch(`/api/admin/customers?id=${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSelectedCustomer(res.customer);
      })
      .catch(() => {})
      .finally(() => setLoadingCustomer(false));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Customer Directory
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Total {totalCustomers} registered store patrons and wholesale cookware buyers
        </p>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px", border: "1px solid #E5E7EB" }}>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); loadCustomers(); }} style={{ display: "flex", gap: "10px", maxWidth: "500px" }}>
          <input
            type="text"
            placeholder="Search by customer name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "0.85rem", outline: "none" }}
          />
          <button
            type="submit"
            style={{ padding: "8px 16px", backgroundColor: "#B45309", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Customers Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile Number</th>
                <th>Orders Placed</th>
                <th>Lifetime Spent</th>
                <th>Last Order Date</th>
                <th>Joined Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{c.email}</div>
                    </td>
                    <td>{c.mobile}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#B45309" }}>{c.ordersCount}</span> orders
                    </td>
                    <td style={{ fontWeight: 700, color: "#111827" }}>
                      ₹{c.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#4B5563" }}>
                      {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("en-IN") : "No orders yet"}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {new Date(c.joinedDate).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <button
                        onClick={() => viewCustomerDetails(c.id)}
                        style={{
                          padding: "4px 10px",
                          backgroundColor: "#FEF3C7",
                          color: "#92400E",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#111827" }}>
                {selectedCustomer.name}
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer", color: "#9CA3AF" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px", fontSize: "0.85rem", backgroundColor: "#F9FAFB", padding: "12px", borderRadius: "8px" }}>
              <div><strong>Email:</strong> {selectedCustomer.email}</div>
              <div><strong>Mobile:</strong> {selectedCustomer.mobile || "N/A"}</div>
              <div><strong>Total Orders:</strong> {selectedCustomer.ordersCount}</div>
              <div><strong>Total Spent:</strong> ₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}</div>
            </div>

            <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
              Order History ({selectedCustomer.orders?.length || 0})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedCustomer.orders?.length === 0 ? (
                <p style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>No orders placed by this customer yet.</p>
              ) : (
                selectedCustomer.orders?.map((o: any) => (
                  <div key={o.id} style={{ padding: "10px 14px", border: "1px solid #E5E7EB", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>#{o.orderNumber} • ₹{o.amount.toLocaleString("en-IN")}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <span style={{ textTransform: "capitalize", fontWeight: 600, color: "#B45309" }}>{o.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}