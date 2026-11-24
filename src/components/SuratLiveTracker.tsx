"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/format";

interface SuratLiveTrackerProps {
  orderId?: string;
  customerName?: string;
  customerArea?: string;
  customerPincode?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  totalAmount?: number;
  initialMinutes?: number;
}

export default function SuratLiveTracker({
  orderId = "ORD-SRT8842",
  customerName = "Valued Customer",
  customerArea = "Adajan / Pal Road",
  customerPincode = "395009",
  items = [
    { name: "Triply Stainless Steel Kadai (3.5L) with Lid", quantity: 1, price: 2499 },
    { name: "Cast Iron Flat Dosa Tawa (10\")", quantity: 1, price: 1499 }
  ],
  totalAmount = 3998,
  initialMinutes = 18
}: SuratLiveTrackerProps) {
  // Live seconds countdown
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [riderProgress, setRiderProgress] = useState(0.45); // 0 to 1 along route
  const [deliveryInstruction, setDeliveryInstruction] = useState("call_arrival");
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
      setRiderProgress((prev) => Math.min(0.95, prev + 0.003));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;

  // Calculated arrival time
  const arrivalTime = new Date(Date.now() + secondsRemaining * 1000).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const otpCode = "4821";

  const copyOtp = () => {
    navigator.clipboard.writeText(otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Interpolate rider coordinates on Surat Map SVG
  // Store (Ring Road): (90, 220) -> Athwagate: (220, 180) -> Bridge: (340, 160) -> Adajan Destination: (450, 100)
  const routePoints = [
    { x: 90, y: 220 },
    { x: 170, y: 200 },
    { x: 260, y: 170 },
    { x: 360, y: 140 },
    { x: 450, y: 100 }
  ];

  // Rider position based on progress
  const riderIndex = Math.min(routePoints.length - 2, Math.floor(riderProgress * (routePoints.length - 1)));
  const nextIndex = riderIndex + 1;
  const segmentFraction = (riderProgress * (routePoints.length - 1)) - riderIndex;

  const currentRiderX = routePoints[riderIndex].x + (routePoints[nextIndex].x - routePoints[riderIndex].x) * segmentFraction;
  const currentRiderY = routePoints[riderIndex].y + (routePoints[nextIndex].y - routePoints[riderIndex].y) * segmentFraction;

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      border: "1px solid var(--border)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      overflow: "hidden",
      marginBottom: "2.5rem"
    }}>
      
      {/* 1. Top Quick-Commerce Urgent Banner */}
      <div style={{
        background: "linear-gradient(90deg, #065f46 0%, #047857 100%)",
        color: "#ffffff",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem"
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#a7f3d0" }}>
              SURAT LOCAL EXPRESS • 30-MIN DISPATCH
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
              Arriving in {timeFormatted}
            </h2>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.8)" }}>Estimated Doorstep Arrival</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fef08a" }}>
            {arrivalTime} Today
          </div>
        </div>
      </div>

      {/* 2. Interactive Animated Surat Map Simulation */}
      <div style={{
        position: "relative",
        height: "260px",
        backgroundColor: "#e2e8f0",
        overflow: "hidden",
        borderBottom: "1px solid var(--border)"
      }}>
        <svg
          viewBox="0 0 540 280"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="tapiRiver" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Map Base - Surat City Land Blocks */}
          <rect width="540" height="280" fill="#f1f5f9" />

          {/* River Tapi Curve through Surat */}
          <path
            d="M 0,160 Q 150,110 270,180 T 540,150"
            fill="none"
            stroke="url(#tapiRiver)"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <text x="210" y="155" fill="#1e40af" fontSize="10" fontWeight="600" opacity="0.65" transform="rotate(-6, 210, 155)">
            ~ Tapi River (Surat) ~
          </text>

          {/* Major Surat Roads (Ring Road, Athwa, Adajan) */}
          <path d="M 40,240 L 160,200 L 260,170 L 370,140 L 480,90" fill="none" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 120,40 L 160,200 L 220,270" fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <path d="M 370,140 L 400,240" fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <path d="M 260,170 L 300,50" fill="none" stroke="#e2e8f0" strokeWidth="7" />

          {/* Bridges across Tapi */}
          <line x1="240" y1="140" x2="280" y2="195" stroke="#94a3b8" strokeWidth="6" strokeDasharray="3,2" />
          <text x="282" y="168" fill="#475569" fontSize="8" fontWeight="600">Sardar Bridge</text>

          {/* Live Delivery Route (Green Glowing Line) */}
          <path
            d="M 90,220 Q 200,180 340,150 T 450,100"
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="6,4"
          />

          {/* Origin: Ramdev Vasan Bhandar Hub */}
          <g transform="translate(90, 220)">
            <circle r="18" fill="rgba(185, 107, 52, 0.25)" />
            <circle r="12" fill="#b96b34" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">🏪</text>
            <text x="0" y="24" textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="700">Ramdev Store</text>
            <text x="0" y="33" textAnchor="middle" fill="#64748b" fontSize="7">Ring Road Hub</text>
          </g>

          {/* Destination: Customer Home */}
          <g transform="translate(450, 100)">
            <circle r="18" fill="rgba(220, 38, 38, 0.2)" />
            <circle r="12" fill="#dc2626" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800">📍</text>
            <text x="0" y="24" textAnchor="middle" fill="#1e293b" fontSize="9" fontWeight="700">Your Home</text>
            <text x="0" y="33" textAnchor="middle" fill="#64748b" fontSize="7">{customerArea}</text>
          </g>

          {/* Animated Rider Icon along Route */}
          <g transform={`translate(${currentRiderX}, ${currentRiderY})`} filter="url(#glow)">
            <circle r="16" fill="rgba(16, 185, 129, 0.3)" />
            <circle r="12" fill="#047857" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="12">🛵</text>
            
            {/* Speed Badge */}
            <rect x="-18" y="-22" width="36" height="12" rx="3" fill="#111827" />
            <text x="0" y="-13" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="700">26 km/h</text>
          </g>
        </svg>

        {/* Live GPS Radar Badge in Corner */}
        <div style={{
          position: "absolute",
          top: "12px",
          left: "14px",
          backgroundColor: "rgba(17, 24, 39, 0.85)",
          color: "#ffffff",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backdropFilter: "blur(4px)"
        }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            boxShadow: "0 0 8px #22c55e",
            display: "inline-block"
          }} />
          <span>Surat Road Traffic: <strong>Smooth Transit</strong></span>
        </div>

        {/* Live Area Indicator in Top Right */}
        <div style={{
          position: "absolute",
          top: "12px",
          right: "14px",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          padding: "6px 12px",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          border: "1px solid var(--border)"
        }}>
          Crossing Athwagate Flyover 🛣️
        </div>
      </div>

      {/* 3. Rider & Security PIN Card */}
      <div style={{
        padding: "1.5rem",
        borderBottom: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: "1.5rem"
      }} className="rider-otp-grid">
        <style dangerouslySetInnerHTML={{__html: `
          @media (max-width: 640px) {
            .rider-otp-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}} />

        {/* Rider Profile Card */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#fef3c7",
            border: "2px solid #f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            flexShrink: 0
          }}>
            👨🏻‍💼
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
                Ramesh Bhai
              </h3>
              <span style={{ fontSize: "0.72rem", backgroundColor: "#fef3c7", color: "#b45309", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                ★ 4.9 (420+ Trips)
              </span>
            </div>
            
            <p style={{ margin: "2px 0 6px 0", fontSize: "0.78rem", color: "var(--muted)" }}>
              Ramdev Express Rider • EV Scooter (GJ-05-EB-4192)
            </p>

            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href="tel:+919825177412"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  backgroundColor: "#065f46",
                  color: "#ffffff",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "none"
                }}
              >
                📞 Call Rider
              </a>

              <a
                href={`https://wa.me/919825177412?text=Hello%20Ramesh%20Bhai,%20I%20am%20tracking%20my%20Ramdev%20Cookware%20order%20(${orderId})`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  backgroundColor: "#25D366",
                  color: "#ffffff",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "none"
                }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Handover OTP Card */}
        <div style={{
          backgroundColor: "#fdf8f6",
          border: "1.5px dashed #f97316",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9a3412", textTransform: "uppercase" }}>
              🔐 Safe Delivery OTP
            </span>
            <span style={{ fontSize: "0.7rem", color: "#c2410c" }}>Required for Handover</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0" }}>
            <div style={{
              fontFamily: "monospace",
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "0.25em",
              color: "#9a3412"
            }}>
              {otpCode}
            </div>

            <button
              type="button"
              onClick={copyOtp}
              style={{
                background: "#ffedd5",
                border: "1px solid #fed7aa",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#9a3412",
                cursor: "pointer"
              }}
            >
              {copiedOtp ? "✓ Copied" : "Copy PIN"}
            </button>
          </div>

          <div style={{ fontSize: "0.72rem", color: "#7c2d12" }}>
            Share this 4-digit code with Ramesh Bhai only when receiving the sealed box.
          </div>
        </div>
      </div>

      {/* 4. Live 4-Stage Step Tracker */}
      <div style={{ padding: "1.75rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>
          Live Dispatch Progress (Surat Quick Commerce)
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", position: "relative" }} className="stages-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 600px) {
              .stages-grid {
                grid-template-columns: 1fr !important;
                gap: 16px !important;
              }
            }
          `}} />

          {/* Stage 1 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                ✓
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#065f46" }}>Order Packed</div>
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
              Box bubble-wrapped & sealed at Ramdev Store
            </p>
          </div>

          {/* Stage 2 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                ✓
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#065f46" }}>Rider Dispatched</div>
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
              Ramesh Bhai collected parcel from counter
            </p>
          </div>

          {/* Stage 3 (Active) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "#f59e0b",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                boxShadow: "0 0 10px #f59e0b"
              }}>
                🛵
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b45309" }}>Out in Surat (Live)</div>
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#92400e", fontWeight: 600 }}>
              Navigating towards {customerArea}
            </p>
          </div>

          {/* Stage 4 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", opacity: 0.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#e2e8f0", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                4
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)" }}>Doorstep Handover</div>
            </div>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
              Verify OTP {otpCode} & receive cookware
            </p>
          </div>
        </div>
      </div>

      {/* 5. Delivery Instructions Dropdown */}
      <div style={{
        padding: "1.25rem 1.5rem",
        backgroundColor: "#fafaf9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.1rem" }}>📋</span>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--foreground)" }}>Delivery Instructions for Rider</div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Ramesh Bhai will see this note on his navigation device</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "call_arrival", label: "📞 Call on Arrival" },
            { id: "leave_guard", label: "🛡️ Leave with Guard" },
            { id: "no_bell", label: "🤫 Don't Ring Bell" }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDeliveryInstruction(opt.id)}
              style={{
                backgroundColor: deliveryInstruction === opt.id ? "#ffffff" : "#f3f4f6",
                border: deliveryInstruction === opt.id ? "1.5px solid var(--copper)" : "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "0.75rem",
                fontWeight: deliveryInstruction === opt.id ? 700 : 500,
                color: deliveryInstruction === opt.id ? "var(--copper)" : "var(--foreground)",
                cursor: "pointer",
                boxShadow: deliveryInstruction === opt.id ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

