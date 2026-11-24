"use client";

import React, { useState, useEffect } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadInventory = () => {
    setLoading(true);
    const q = new URLSearchParams({ filter: filterType, search });
    fetch(`/api/admin/inventory?${q.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setItems(res.items || []);
          setSummary(res.summary || {});
          setRecentLogs(res.recentLogs || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, [filterType]);

  const handleStockDelta = async (productId: string, delta: number) => {
    setUpdatingId(productId);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, delta }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, stock: data.product.stock } : item
          )
        );
        loadInventory();
      }
    } catch (err) {
      alert("Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetStock = async (productId: string, currentStock: number) => {
    const input = prompt("Enter exact new stock quantity:", currentStock.toString());
    if (input === null || isNaN(Number(input))) return;

    const newStock = Math.max(0, parseInt(input, 10));
    setUpdatingId(productId);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, newStock }),
      });
      const data = await res.json();
      if (data.success) {
        loadInventory();
      }
    } catch (err) {
      alert("Failed to set stock");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Title */}
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Inventory & Stock Management
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Real-time physical stock levels with atomic decrement safeguards and audit logging
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6B7280" }}>TOTAL PRODUCTS</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginTop: "4px" }}>{summary.totalProducts || 0}</div>
        </div>
        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#059669" }}>IN STOCK</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#059669", marginTop: "4px" }}>{summary.inStockCount || 0}</div>
        </div>
        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#D97706" }}>LOW STOCK (≤ 5)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#D97706", marginTop: "4px" }}>{summary.lowStockCount || 0}</div>
        </div>
        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#DC2626" }}>OUT OF STOCK</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#DC2626", marginTop: "4px" }}>{summary.outOfStockCount || 0}</div>
        </div>
        <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#B45309" }}>TOTAL INVENTORY VALUE</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#B45309", marginTop: "4px" }}>₹{(summary.totalValuation || 0).toLocaleString("en-IN")}</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "16px", border: "1px solid #E5E7EB", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { key: "all", label: "All Items" },
            { key: "in_stock", label: "In Stock" },
            { key: "low_stock", label: "Low Stock" },
            { key: "out_of_stock", label: "Out of Stock" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: filterType === tab.key ? "#B45309" : "#F3F4F6",
                color: filterType === tab.key ? "#FFFFFF" : "#4B5563",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Search by product name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "0.85rem", outline: "none" }}
          />
          <button
            onClick={loadInventory}
            style={{ padding: "8px 14px", backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
          >
            Filter
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Quick Adjustment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#6B7280" }}>
                    Loading inventory data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>
                    No products found matching inventory filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>₹{item.price?.toLocaleString("en-IN")}</div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{item.sku}</td>
                    <td>{item.category}</td>
                    <td>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: item.stock <= 0 ? "#DC2626" : item.stock <= 5 ? "#D97706" : "#059669",
                        }}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} type="stock" />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          disabled={updatingId === item.id || item.stock <= 0}
                          onClick={() => handleStockDelta(item.id, -1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "4px",
                            backgroundColor: "#FFFFFF",
                            fontWeight: 700,
                            cursor: item.stock <= 0 ? "not-allowed" : "pointer",
                          }}
                          title="Decrease Stock by 1"
                        >
                          -
                        </button>
                        <button
                          disabled={updatingId === item.id}
                          onClick={() => handleStockDelta(item.id, 1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "4px",
                            backgroundColor: "#FFFFFF",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                          title="Increase Stock by 1"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleSetStock(item.id, item.stock)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#FEF3C7",
                            color: "#92400E",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Set Exact
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

      {/* Recent Inventory Audit Logs */}
      {recentLogs.length > 0 && (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: "20px", border: "1px solid #E5E7EB" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
            Recent Stock Movement Logs (Audit Trail)
          </h3>
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Movement</th>
                  <th>Prev → New</th>
                  <th>Reason</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.productName}</td>
                    <td style={{ fontFamily: "monospace" }}>{log.sku}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: log.changeQuantity > 0 ? "#059669" : "#DC2626" }}>
                        {log.changeQuantity > 0 ? `+${log.changeQuantity}` : log.changeQuantity}
                      </span>
                    </td>
                    <td>{log.previousStock} → {log.newStock}</td>
                    <td>
                      <span style={{ textTransform: "capitalize", fontSize: "0.8rem", color: "#4B5563" }}>
                        {log.reason.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}