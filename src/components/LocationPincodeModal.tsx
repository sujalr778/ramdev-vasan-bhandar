"use client";

import { useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { SURAT_CORE_PINCODES, SURAT_OUTER_PINCODES, getDeliveryTier } from "@/lib/delivery";

export default function LocationPincodeModal() {
  const { pincode, deliveryTier, setPincode, isModalOpen, setIsModalOpen } = useLocation();
  const [inputCode, setInputCode] = useState(pincode || "");
  const [error, setError] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handleApply = (codeToApply?: string) => {
    const code = (codeToApply || inputCode).trim();
    if (!/^[1-9][0-9]{5}$/.test(code)) {
      setError("Please enter a valid 6-digit Indian postal pincode.");
      return;
    }
    setError(null);
    setPincode(code);
    setIsModalOpen(false);
  };

  const currentTier = inputCode.length === 6 ? getDeliveryTier(inputCode) : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "460px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.4rem" }}>📍</span>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
                Select Delivery Location
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
                Enter your 6-digit postal pincode to check delivery availability.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              background: "#f3f4f6",
              border: "none",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleApply(); }} style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setInputCode(val);
                if (error) setError(null);
              }}
              placeholder="Enter 6-digit Pincode"
              style={{
                flex: 1,
                padding: "12px 14px",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                fontSize: "0.95rem",
                outline: "none",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                backgroundColor: "var(--copper)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </form>

        {error && (
          <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "12px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ONLY revealed after typing 6 digits */}
        {currentTier && (
          <div
            style={{
              backgroundColor: currentTier.isSurat ? "#ecfdf5" : "#f8fafc",
              border: `1px solid ${currentTier.isSurat ? "#10b981" : "#cbd5e1"}`,
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.875rem", color: currentTier.isSurat ? "#065f46" : "#334155" }}>
              <span>{currentTier.isSurat ? "⚡" : "🚚"}</span>
              <span>{currentTier.isSurat ? `Special Perk Unlocked: ${currentTier.badgeText} (${currentTier.etaText})!` : `${currentTier.badgeText} (${currentTier.etaText})`}</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: currentTier.isSurat ? "#047857" : "#64748b" }}>
              {currentTier.message}
            </p>
          </div>
        )}

        {/* Quick Click City Pincodes - Clean neutral names */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Quick Select Common Hubs:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { code: "395001", name: "Chowk Bazar" },
              { code: "395002", name: "Ring Road" },
              { code: "395003", name: "Varachha" },
              { code: "395004", name: "Katargam" },
              { code: "395009", name: "Adajan / Pal" },
              { code: "395007", name: "Vesu / VIP Rd" },
            ].map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setInputCode(item.code);
                  handleApply(item.code);
                }}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{item.code} - {item.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

