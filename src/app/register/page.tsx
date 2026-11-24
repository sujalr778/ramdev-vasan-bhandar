"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";
import { getDeliveryTier } from "@/lib/delivery";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { pincode, setPincode } = useLocation();
  const [pincodeInput, setPincodeInput] = useState(pincode || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const previewTier = pincodeInput.trim().length === 6 ? getDeliveryTier(pincodeInput) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pincodeInput && !/^[1-9][0-9]{5}$/.test(pincodeInput.trim())) {
      setError("Please enter a valid 6-digit postal pincode.");
      return;
    }

    setLoading(true);

    if (pincodeInput) {
      setPincode(pincodeInput.trim());
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      setLoading(false);

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-2xl) 0' }}>
      <div style={{ maxWidth: '440px', width: '100%', padding: 'var(--spacing-xl)', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
        <h1 className="heading-secondary" style={{ textAlign: 'center', marginBottom: '4px' }}>Create Account</h1>
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.85rem", marginBottom: "var(--spacing-lg)" }}>
          Join Ramdev Cookware Club for exclusive offers
        </p>
        
        {error && <div style={{ color: 'var(--error)', marginBottom: 'var(--spacing-md)', textAlign: 'center', fontSize: "0.85rem" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, fontSize: "0.875rem" }}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amit Patel"
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, fontSize: "0.875rem" }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. amit@example.com"
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: "0.9rem" }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 500, fontSize: "0.875rem" }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: "0.9rem" }}
            />
          </div>

          {/* Delivery Pincode Input - Clean & Standard until user enters code */}
          <div style={{
            backgroundColor: previewTier?.isSurat ? "#f0fdf4" : "var(--background-alt, #fafaf9)",
            border: previewTier?.isSurat ? "1.5px solid #86efac" : "1px solid var(--border)",
            borderRadius: "8px",
            padding: "14px",
            marginTop: "4px",
            transition: "all 0.3s ease"
          }}>
            <label style={{ display: "block", fontWeight: 500, fontSize: "0.875rem", marginBottom: "6px" }}>
              Delivery Pincode
            </label>
            
            <input 
              type="text" 
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter your 6-digit Pincode"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: "0.95rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                backgroundColor: "#ffffff"
              }}
            />

            {/* ONLY reveals when user actually enters 6 digits */}
            {previewTier?.isSurat && (
              <div style={{
                marginTop: "10px",
                padding: "10px 12px",
                backgroundColor: "#ecfdf5",
                border: "1.5px solid #10b981",
                borderRadius: "6px",
                animation: "fadeIn 0.3s ease"
              }}>
                <div style={{ color: "#065f46", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡</span>
                  <span>Special Local Perk Unlocked: {previewTier.badgeText} ({previewTier.etaText})!</span>
                </div>
                <div style={{ color: "#047857", fontSize: "0.75rem", marginTop: "2px" }}>
                  {previewTier.message} Dispatched directly from our local store.
                </div>
              </div>
            )}

            {previewTier && !previewTier.isSurat && (
              <div style={{ marginTop: "6px", fontSize: "0.75rem", color: "var(--muted)" }}>
                ✓ Serviceable: Standard Pan-India Express (2-3 Business Days)
              </div>
            )}

            {!previewTier && (
              <p style={{ margin: "6px 0 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
                Enter your postal pincode to verify delivery speed & checkout options.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              marginTop: 'var(--spacing-xs)',
              padding: "12px",
              fontWeight: 700,
              backgroundColor: "var(--copper)"
            }}
          >
            {loading ? "Creating Account..." : "Create Account & Continue"}
          </button>
        </form>

        <p style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--muted)', fontSize: "0.85rem" }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
