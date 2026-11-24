"use client";

import React, { useState, useEffect } from "react";

export default function DeliveryManagementPage() {
  const [rules, setRules] = useState<any>({ freeShippingThreshold: 999, standardDeliveryFee: 99 });
  const [testPincode, setTestPincode] = useState("380001");
  const [testSubtotal, setTestSubtotal] = useState("1200");
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [chargeResult, setChargeResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/delivery")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.rules) setRules(res.rules);
      })
      .catch(() => {});
  }, []);

  const handleTestPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams({ testPincode, testSubtotal });
    fetch(`/api/admin/delivery?${q.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setPincodeResult(res.pincodeTestResult);
          setChargeResult(res.deliveryChargeTestResult);
        }
      })
      .catch(() => {});
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rules),
      });
      const data = await res.json();
      if (data.success) {
        alert("Delivery rules updated successfully.");
      }
    } catch (err) {
      alert("Error saving rules");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Delivery & Shipping Configuration
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Unified delivery calculation rules and Indian postal pincode serviceability validation
        </p>
      </div>

      {/* Existing Business Rule Alert */}
      <div style={{ padding: "16px", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", color: "#1E40AF" }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", fontWeight: 700 }}>
          ✓ Active Store Business Rule:
        </h3>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          Orders <strong>≥ ₹999</strong> receive <strong>FREE DELIVERY</strong>. Orders <strong>&lt; ₹999</strong> incur a standard delivery fee of <strong>₹99</strong>.
        </p>
      </div>

      {/* Rules Config Form */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "24px", border: "1px solid #E5E7EB" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
          Store Shipping Rules
        </h3>

        <form onSubmit={handleSaveRules} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              value={rules.freeShippingThreshold}
              onChange={(e) => setRules({ ...rules, freeShippingThreshold: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              Standard Delivery Charge (₹)
            </label>
            <input
              type="number"
              value={rules.standardDeliveryFee}
              onChange={(e) => setRules({ ...rules, standardDeliveryFee: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
            />
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 20px",
                backgroundColor: "#B45309",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Delivery Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Pincode Serviceability Tester */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "24px", border: "1px solid #E5E7EB" }}>
        <h3 style={{ margin: "0 0 14px 0", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
          Interactive Pincode Serviceability Tester
        </h3>
        <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#6B7280" }}>
          Simulate real customer checkout serviceability and delivery calculation.
        </p>

        <form onSubmit={handleTestPincode} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Test Pincode (6-digits)</label>
            <input
              type="text"
              placeholder="e.g. 380001"
              value={testPincode}
              onChange={(e) => setTestPincode(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Test Subtotal Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1200"
              value={testSubtotal}
              onChange={(e) => setTestSubtotal(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "10px 18px",
              backgroundColor: "#1F2937",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Check Serviceability
          </button>
        </form>

        {/* Results */}
        {(pincodeResult || chargeResult) && (
          <div style={{ marginTop: "20px", padding: "16px", borderRadius: "8px", backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            {pincodeResult && (
              <div>
                <strong>Pincode Status:</strong>{" "}
                <span style={{ color: pincodeResult.serviceable ? "#059669" : "#DC2626", fontWeight: 700 }}>
                  {pincodeResult.serviceable ? "✓ Serviceable" : "✕ Not Serviceable"}
                </span>{" "}
                - {pincodeResult.message}
              </div>
            )}

            {chargeResult && (
              <div>
                <strong>Calculated Delivery Charge:</strong>{" "}
                <span style={{ fontWeight: 700, color: chargeResult.isFree ? "#059669" : "#111827" }}>
                  {chargeResult.isFree ? "₹0 (FREE DELIVERY)" : `₹${chargeResult.deliveryCharge}`}
                </span>
                {!chargeResult.isFree && chargeResult.thresholdRemaining > 0 && (
                  <span style={{ color: "#D97706", marginLeft: "8px" }}>
                    (Add ₹{chargeResult.thresholdRemaining} more for free shipping)
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}