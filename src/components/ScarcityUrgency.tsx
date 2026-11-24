"use client";

import { useState, useEffect } from "react";

export default function ScarcityUrgency({ stock = 5 }: { stock?: number }) {
  const [viewers, setViewers] = useState(18);

  useEffect(() => {
    // Subtle organic jitter between 14 and 28 viewers
    const interval = setInterval(() => {
      setViewers(Math.floor(14 + Math.random() * 14));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const remaining = stock > 0 ? (stock <= 10 ? stock : 4) : 0;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginTop: "1rem",
      marginBottom: "1rem"
    }}>
      {/* Live Viewers Pulse */}
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "0.8rem",
        color: "var(--foreground)",
        fontWeight: 500
      }}>
        <span style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: "#16a34a",
          display: "inline-block",
          boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.25)",
          animation: "pulse 2s infinite"
        }}></span>
        <span>
          <strong style={{ color: "var(--copper)" }}>{viewers} people</strong> are viewing this cookware piece right now
        </span>
      </div>

      {/* Low Stock Urgency Bar */}
      {remaining > 0 && (
        <div style={{
          backgroundColor: "#fff7ed",
          border: "1px solid #fed7aa",
          borderRadius: "4px",
          padding: "8px 12px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "#c2410c", marginBottom: "4px" }}>
            <span>🔥 High Demand: Only {remaining} units left in stock!</span>
            <span>85% Claimed</span>
          </div>
          <div style={{ width: "100%", height: "5px", backgroundColor: "#ffedd5", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ width: "85%", height: "100%", backgroundColor: "#ea580c", borderRadius: "9999px" }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

