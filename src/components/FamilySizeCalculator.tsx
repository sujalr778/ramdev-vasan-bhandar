"use client";

import { useState } from "react";

export default function FamilySizeCalculator({
  currentCapacity,
  onSelectCapacity
}: {
  currentCapacity?: string;
  onSelectCapacity?: (cap: string) => void;
}) {
  const [selectedFamily, setSelectedFamily] = useState<number>(3); // 3-4 people default

  const recommendations: Record<number, { title: string; rec: string; bestFor: string; cap: string }> = {
    1: {
      title: "1–2 People (Couples / Singles)",
      rec: "1.5L to 2.2L Capacity",
      bestFor: "Daily tadka, quick omelets, 2-person curries & tea.",
      cap: "2.0L"
    },
    3: {
      title: "3–4 People (Standard Indian Family)",
      rec: "3.0L to 3.5L Capacity (Most Popular)",
      bestFor: "Family dal, sabzi, gravies, deep-frying snacks, and daily biryani.",
      cap: "3.5L"
    },
    5: {
      title: "5+ People (Joint Family & Entertaining)",
      rec: "5.0L+ Jumbo Festive Size",
      bestFor: "Large family meals, festive feasts, bulk boiling, and party curries.",
      cap: "5.0L"
    }
  };

  const current = recommendations[selectedFamily];

  return (
    <div style={{
      backgroundColor: "#faf9f6",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      padding: "1.25rem",
      marginTop: "1.5rem"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)" }}>
          👨‍👩‍👧‍👦 Family Size & Capacity Guide
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--copper)", fontWeight: 600 }}>
          Find your perfect liter size
        </span>
      </div>

      {/* Family Size Selectors */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { label: "1–2 Members", val: 1 },
          { label: "3–4 Members", val: 3 },
          { label: "5+ Members", val: 5 }
        ].map((f) => (
          <button
            key={f.val}
            type="button"
            onClick={() => {
              setSelectedFamily(f.val);
              if (onSelectCapacity) onSelectCapacity(recommendations[f.val].cap);
            }}
            style={{
              padding: "8px 6px",
              borderRadius: "4px",
              border: selectedFamily === f.val ? "2px solid var(--copper)" : "1px solid var(--border)",
              backgroundColor: selectedFamily === f.val ? "#ffffff" : "transparent",
              color: selectedFamily === f.val ? "var(--copper)" : "var(--muted)",
              fontWeight: selectedFamily === f.val ? 700 : 500,
              fontSize: "0.78rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Recommendation Output Box */}
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "4px",
        padding: "10px 12px"
      }}>
        <div style={{ fontSize: "0.825rem", fontWeight: 700, color: "var(--foreground)" }}>
          Recommended for you: <span style={{ color: "var(--copper)" }}>{current.rec}</span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px", lineHeight: 1.4 }}>
          {current.bestFor}
        </div>
      </div>
    </div>
  );
}

