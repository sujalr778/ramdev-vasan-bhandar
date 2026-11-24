"use client";

import React, { useState } from "react";

interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  productsSold: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export default function SalesChart({ data, timeframe, onTimeframeChange }: SalesChartProps) {
  const [metric, setMetric] = useState<"revenue" | "orders" | "productsSold">("revenue");
  const [hoveredPoint, setHoveredPoint] = useState<SalesDataPoint | null>(null);

  const timeframes = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
    { key: "3m", label: "3 Months" },
    { key: "6m", label: "6 Months" },
    { key: "1y", label: "1 Year" },
  ];

  const points = data || [];
  const maxVal = Math.max(...points.map((p) => p[metric]), 1);

  // SVG dimensions
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Generate path
  let pathD = "";
  const coords: { x: number; y: number; point: SalesDataPoint }[] = [];

  if (points.length > 0) {
    points.forEach((p, idx) => {
      const x = paddingX + (points.length === 1 ? chartW / 2 : (idx / (points.length - 1)) * chartW);
      const y = height - paddingY - (p[metric] / maxVal) * chartH;
      coords.push({ x, y, point: p });

      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });
  }

  const areaD = pathD ? `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z` : "";

  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      {/* Chart Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>Sales Analytics</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#6B7280" }}>
            Real-time business performance from MongoDB Atlas
          </p>
        </div>

        {/* Metric Switcher */}
        <div style={{ display: "flex", gap: "6px", backgroundColor: "#F3F4F6", padding: "4px", borderRadius: "8px" }}>
          {(["revenue", "orders", "productsSold"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: metric === m ? "#B45309" : "transparent",
                color: metric === m ? "#FFFFFF" : "#4B5563",
                transition: "all 0.15s ease",
              }}
            >
              {m === "revenue" ? "Revenue (₹)" : m === "orders" ? "Orders" : "Units Sold"}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe Filter Buttons */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
        {timeframes.map((tf) => (
          <button
            key={tf.key}
            onClick={() => onTimeframeChange(tf.key)}
            style={{
              padding: "4px 10px",
              border: timeframe === tf.key ? "1px solid #B45309" : "1px solid #E5E7EB",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              backgroundColor: timeframe === tf.key ? "#FEF3C7" : "#FFFFFF",
              color: timeframe === tf.key ? "#92400E" : "#4B5563",
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      {points.length === 0 ? (
        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "1.5rem" }}>📊</span>
          <span>No sales data found for this period (₹0 Revenue, 0 Orders)</span>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", minWidth: "500px" }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B45309" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#B45309" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = height - paddingY - ratio * chartH;
              const val = Math.round(ratio * maxVal);
              return (
                <g key={i}>
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#E5E7EB" strokeDasharray="3 3" />
                  <text x={paddingX - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">
                    {metric === "revenue" ? `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}` : val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

            {/* Main Curve Line */}
            {pathD && <path d={pathD} fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Interactive Data Points */}
            {coords.map((c, i) => (
              <g key={i} style={{ cursor: "pointer" }} onMouseEnter={() => setHoveredPoint(c.point)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={hoveredPoint === c.point ? 6 : 3.5}
                  fill={hoveredPoint === c.point ? "#92400E" : "#B45309"}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ transition: "all 0.15s ease" }}
                />
                {/* X Axis Label */}
                {(i === 0 || i === Math.floor(coords.length / 2) || i === coords.length - 1) && (
                  <text x={c.x} y={height - 10} textAnchor="middle" fontSize="11" fill="#6B7280">
                    {c.point.date.slice(-5)}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredPoint && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "#1F2937",
                color: "#FFFFFF",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span style={{ fontWeight: 600, color: "#FCD34D" }}>Date: {hoveredPoint.date}</span>
              <span>Revenue: ₹{hoveredPoint.revenue.toLocaleString("en-IN")}</span>
              <span>Orders: {hoveredPoint.orders}</span>
              <span>Units: {hoveredPoint.productsSold}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}