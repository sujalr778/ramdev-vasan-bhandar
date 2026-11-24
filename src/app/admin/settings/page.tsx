"use client";

import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState<any>({
    storeName: "Ramdev Vasan Bhandar",
    storePhone: "+91 98765 43210",
    storeEmail: "support@ramdevvasanbhandar.com",
    storeAddress: "Main Market, Station Road",
    storeCity: "Ahmedabad",
    storeState: "Gujarat",
    storePincode: "380001",
    storeGstin: "24AAAAA0000A1Z5",
    freeShippingThreshold: 999,
    standardDeliveryFee: 99,
  });

  const [adminProfile, setAdminProfile] = useState<any>({
    name: "Admin",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          if (res.settings) setStoreSettings(res.settings);
          if (res.adminProfile) {
            setAdminProfile((p: any) => ({
              ...p,
              name: res.adminProfile.name,
              email: res.adminProfile.email,
            }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSettings, adminProfile }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Settings and profile saved successfully.");
        setAdminProfile((p: any) => ({ ...p, password: "" }));
      } else {
        alert(data.error || "Failed to save settings.");
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading settings...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
          Store Settings & Admin Security
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: "0.85rem" }}>
          Manage business contact information, shipping rules, and administrator credentials
        </p>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", backgroundColor: "#D1FAE5", color: "#065F46", borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem" }}>
          ✓ {message}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Store Profile */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "24px", border: "1px solid #E5E7EB" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
            Store Details
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Support Phone</label>
              <input
                type="text"
                value={storeSettings.storePhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Support Email</label>
              <input
                type="email"
                value={storeSettings.storeEmail}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>GSTIN</label>
              <input
                type="text"
                value={storeSettings.storeGstin}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeGstin: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Store Address</label>
              <input
                type="text"
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>City</label>
              <input
                type="text"
                value={storeSettings.storeCity}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeCity: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Pincode</label>
              <input
                type="text"
                value={storeSettings.storePincode}
                onChange={(e) => setStoreSettings({ ...storeSettings, storePincode: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>
          </div>
        </div>

        {/* Admin Profile & Password */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "24px", border: "1px solid #E5E7EB" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
            Admin Profile & Password Reset
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Admin Name</label>
              <input
                type="text"
                value={adminProfile.name}
                onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Admin Email</label>
              <input
                type="email"
                value={adminProfile.email}
                disabled
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", color: "#6B7280" }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                New Password (leave empty to keep current password)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminProfile.password}
                onChange={(e) => setAdminProfile({ ...adminProfile, password: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #D1D5DB" }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 28px",
              backgroundColor: "#B45309",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving All Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}