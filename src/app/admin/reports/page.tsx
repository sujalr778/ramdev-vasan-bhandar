"use client";

import React, { useState, useEffect } from "react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  const loadReports = (r: string) => {
    setLoading(true);
    fetch(`/api/admin/reports?range=${r}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports(range);
  }, [range]);

  const exportCSV = (type: "sales" | "products" | "categories") => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";

    if (type === "sales") {
      csvContent += "Metric,Value\r\n";
      csvContent += `Total Revenue,₹${data.sales?.totalRevenue || 0}\r\n`;
      csvContent += `Total Orders,${data.sales?.totalOrders || 0}\r\n`;
      csvContent += `Average Order Value,₹${data.sales?.avgOrderValue || 0}\r\n`;
      csvContent += `Total Units Sold,${data.sales?.totalItemsSold || 0}\r\n`;
    } else if (type === "products") {
      csvContent += "Rank,Product Name,Category,SKU,Units Sold,Revenue\r\n";
      (data.bestSellers || []).forEach((p: any, idx: number) => {
        csvContent += `${idx + 1},"${p.name}","${p.category}","${p.sku}",${p.unitsSold},₹${p.revenue}\r\n`;
      });
    } else if (type === "categories") {
      csvContent += "Category,Revenue,Units Sold,Orders Count\r\n";
      (data.categoryReport || []).forEach((c: any) => {
        csvContent += `"${c.category}",₹${c.revenue},${c.unitsSold},${c.ordersCount}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ramdev_vasan_${type}_report_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
            Business Intelligence & Reports
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
            Comprehensive sales, category distribution, and inventory valuation analytics
          </p>
        </div>

        {/* Date Range Selector */}
        <div style={{ display: "flex", gap: "8px", backgroundColor: "#FFFFFF", padding: "4px", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
          {[
            { key: "7d", label: "7 Days" },
            { key: "30d", label: "30 Days" },
            { key: "90d", label: "3 Months" },
            { key: "1y", label: "1 Year" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key)}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: range === item.key ? 700 : 500,
                backgroundColor: range === item.key ? "#B45309" : "transparent",
                color: range === item.key ? "#FFFFFF" : "#4B5563",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Generating report data...</div>
      ) : (
        <>
          {/* Sales Performance Summary */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                Sales & Order Performance ({range})
              </h3>
              <button
                onClick={() => exportCSV("sales")}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>↓</span> Export Sales CSV
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600 }}>REVENUE</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669", marginTop: "4px" }}>
                  ₹{(data?.sales?.totalRevenue || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600 }}>ORDERS</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563EB", marginTop: "4px" }}>
                  {data?.sales?.totalOrders || 0}
                </div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600 }}>AVERAGE ORDER VALUE</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#B45309", marginTop: "4px" }}>
                  ₹{(data?.sales?.avgOrderValue || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600 }}>UNITS DELIVERED</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#7C3AED", marginTop: "4px" }}>
                  {data?.sales?.totalItemsSold || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Best Sellers & Category Revenue */}
          <div className="admin-grid-2">
            {/* Best Sellers */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                  Top Selling Cookware Items
                </h3>
                <button onClick={() => exportCSV("products")} style={{ border: "none", background: "none", fontSize: "0.8rem", color: "#B45309", fontWeight: 600, cursor: "pointer" }}>
                  Export CSV
                </button>
              </div>

              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.bestSellers || []).length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "#9CA3AF" }}>No sales recorded in this period.</td></tr>
                    ) : (
                      data?.bestSellers?.map((p: any) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td>{p.category}</td>
                          <td style={{ fontWeight: 700 }}>{p.unitsSold}</td>
                          <td style={{ fontWeight: 700, color: "#059669" }}>₹{p.revenue?.toLocaleString("en-IN")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Performance */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                  Category Revenue Split
                </h3>
                <button onClick={() => exportCSV("categories")} style={{ border: "none", background: "none", fontSize: "0.8rem", color: "#B45309", fontWeight: 600, cursor: "pointer" }}>
                  Export CSV
                </button>
              </div>

              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Units Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.categoryReport || []).length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: "center", padding: "20px", color: "#9CA3AF" }}>No category breakdown yet.</td></tr>
                    ) : (
                      data?.categoryReport?.map((c: any) => (
                        <tr key={c.category}>
                          <td style={{ fontWeight: 600 }}>{c.category}</td>
                          <td>{c.unitsSold} units</td>
                          <td style={{ fontWeight: 700, color: "#B45309" }}>₹{c.revenue?.toLocaleString("en-IN")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}