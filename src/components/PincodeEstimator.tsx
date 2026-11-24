"use client";

import { useState, useEffect } from "react";
import { useLocation } from "@/context/LocationContext";
import { getDeliveryTier, SuratDeliveryTier } from "@/lib/delivery";

const CITY_LOOKUP: Record<string, { city: string; days: number }> = {
  "395": { city: "Surat", days: 0 },
  "400": { city: "Mumbai / MMR", days: 2 },
  "411": { city: "Pune", days: 2 },
  "110": { city: "Delhi NCR", days: 2 },
  "560": { city: "Bengaluru", days: 2 },
  "500": { city: "Hyderabad", days: 2 },
  "600": { city: "Chennai", days: 3 },
  "700": { city: "Kolkata", days: 3 },
  "380": { city: "Ahmedabad", days: 2 },
  "302": { city: "Jaipur", days: 3 },
  "226": { city: "Lucknow", days: 3 },
  "452": { city: "Indore", days: 3 },
};

export default function PincodeEstimator() {
  const { pincode: contextPincode, setPincode: setContextPincode } = useLocation();
  const [pincode, setPincode] = useState(contextPincode || "");
  const [tier, setTier] = useState<SuratDeliveryTier | null>(contextPincode ? getDeliveryTier(contextPincode) : null);
  const [estimate, setEstimate] = useState<{ city: string; deliveryDate: string; isExpress: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 2, minutes: 45, seconds: 12 });

  useEffect(() => {
    if (contextPincode) {
      setPincode(contextPincode);
      setTier(getDeliveryTier(contextPincode));
    }
  }, [contextPincode]);

  // Live countdown timer for same-day dispatch
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 0, 0, 0);

      let diff = cutoff.getTime() - now.getTime();
      if (diff <= 0) {
        cutoff.setDate(cutoff.getDate() + 1);
        diff = cutoff.getTime() - now.getTime();
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheck = (e?: React.FormEvent, codeToCheck?: string) => {
    if (e) e.preventDefault();
    const code = (codeToCheck || pincode).trim();

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit Indian pincode.");
      setEstimate(null);
      setTier(null);
      return;
    }

    setError(null);
    setContextPincode(code);
    const checkedTier = getDeliveryTier(code);
    setTier(checkedTier);

    if (!checkedTier.isSurat) {
      const prefix = code.substring(0, 3);
      const match = CITY_LOOKUP[prefix] || { city: "Your Location", days: 3 };

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + match.days);

      const deliveryDate = targetDate.toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

      setEstimate({
        city: match.city,
        deliveryDate,
        isExpress: match.days <= 2,
      });
    } else {
      setEstimate(null);
    }
  };

  return (
    <div style={{
      backgroundColor: "#faf9f6",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      padding: "1.25rem",
      marginTop: "1.5rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "1.2rem" }}>📍</span>
        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.02em" }}>
          Check Delivery & COD Availability
        </span>
      </div>

      <form onSubmit={(e) => handleCheck(e)} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 6-digit Pincode"
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            fontSize: "0.875rem",
            outline: "none"
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "var(--copper)",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          Check
        </button>
      </form>

      {/* Quick City Presets - Neutral, no minutes revealed beforehand */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px", fontSize: "0.75rem", color: "var(--muted)" }}>
        <span style={{ fontWeight: 500 }}>Quick select:</span>
        {[
          { name: "Surat", pin: "395002" },
          { name: "Ahmedabad", pin: "380001" },
          { name: "Mumbai", pin: "400001" },
          { name: "Delhi", pin: "110001" }
        ].map((item) => (
          <button
            key={item.pin}
            type="button"
            onClick={() => { setPincode(item.pin); handleCheck(undefined, item.pin); }}
            style={{
              background: "none",
              border: "1px dashed #d1d5db",
              borderRadius: "4px",
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "var(--foreground)"
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: "#b91c1c", fontSize: "0.8rem", marginTop: "4px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Surat Unlocked Hyperlocal Delivery Display */}
      {tier && tier.isSurat && (
        <div style={{
          backgroundColor: "#f0fdf4",
          border: "1.5px solid #22c55e",
          borderRadius: "6px",
          padding: "12px",
          marginTop: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⚡</span>
              <span>{tier.badgeText} ({tier.etaText})</span>
            </div>
            <span style={{ fontSize: "0.7rem", backgroundColor: "#22c55e", color: "#ffffff", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
              FREE DISPATCH
            </span>
          </div>

          <p style={{ margin: "6px 0 4px 0", fontSize: "0.8rem", color: "#166534", lineHeight: 1.4 }}>
            {tier.message} Handled directly by local delivery partner from <strong>Ramdev Vasan Bhandar, Surat</strong>.
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.75rem", color: "#15803d", fontWeight: 600 }}>
            <span>⚡ Real-Time Tracking</span>
            <span>💵 Cash on Delivery</span>
            <span>🛡️ 100% Sealed Transit</span>
          </div>
        </div>
      )}

      {/* Non-Surat Standard Delivery Display */}
      {estimate && (
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #bbf7d0",
          borderRadius: "4px",
          padding: "10px 12px",
          marginTop: "10px"
        }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#15803d", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>✓</span>
            <span>Delivery to {estimate.city} by {estimate.deliveryDate}</span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "#b45309", fontWeight: 600, marginTop: "4px" }}>
            ⏱️ Order within <strong>{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</strong> for today&apos;s express courier dispatch!
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.75rem", color: "var(--muted)" }}>
            <span>🚚 Free Pan-India Shipping</span>
            <span>💵 COD Available</span>
            <span>🔁 7-Day Exchange</span>
          </div>
        </div>
      )}
    </div>
  );
}
