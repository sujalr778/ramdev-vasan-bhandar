"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";

export default function LaserEngravingOption() {
  const [enabled, setEnabled] = useState(false);
  const [engraveText, setEngraveText] = useState("");
  const engravingPrice = 199;

  return (
    <div style={{
      backgroundColor: enabled ? "#fffbeb" : "#faf9f6",
      border: enabled ? "1.5px solid #f59e0b" : "1px solid var(--border)",
      borderRadius: "6px",
      padding: "1rem",
      marginTop: "1.25rem",
      transition: "all 0.2s"
    }}>
      <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          style={{ accentColor: "#d97706", width: "18px", height: "18px", marginTop: "2px" }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)" }}>
              🎁 Add Custom Laser Engraving (Lid / Handle)
            </span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b45309" }}>
              +{formatINR(engravingPrice)}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
            Permanent laser-etched name or family crest. Ideal for wedding, housewarming & festive gifts.
          </div>
        </div>
      </label>

      {enabled && (
        <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #fcd34d" }}>
          <input
            type="text"
            maxLength={28}
            value={engraveText}
            onChange={(e) => setEngraveText(e.target.value)}
            placeholder="e.g. 'Pooja & Vikram' or 'Sharma Kitchen'"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #f59e0b",
              borderRadius: "4px",
              fontSize: "0.85rem",
              backgroundColor: "#ffffff",
              outline: "none"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#92400e", marginTop: "4px" }}>
            <span>Preview on lid: <strong>{engraveText ? `"${engraveText}"` : "Enter text above"}</strong></span>
            <span>{28 - engraveText.length} chars left</span>
          </div>
        </div>
      )}
    </div>
  );
}

