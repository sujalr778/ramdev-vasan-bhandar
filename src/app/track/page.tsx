"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import SuratLiveTracker from "@/components/SuratLiveTracker";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTrack = async (e?: React.FormEvent, searchQuery?: string) => {
    if (e) e.preventDefault();
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.message || "No order found. Please check your Order ID or Mobile Number.");
        setOrder(null);
      }
    } catch (err: any) {
      setError("Network error. Could not connect to order tracking service.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const copyAWB = () => {
    if (!order?.awbNumber) return;
    navigator.clipboard.writeText(order.awbNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "85vh", padding: "3rem 1rem 5rem 1rem" }}>
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--copper)",
            backgroundColor: "#f7f3ec",
            padding: "4px 12px",
            borderRadius: "9999px",
            display: "inline-block",
            marginBottom: "8px"
          }}>
            LIVE DISPATCH & LOGISTICS
          </span>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            fontWeight: 600,
            color: "var(--foreground)",
            marginBottom: "8px"
          }}>
            Track Your Cookware Order
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: "520px", margin: "0 auto" }}>
            Enter your Order ID (from SMS/Email) or your 10-digit mobile number to view live courier status.
          </p>
        </div>

        {/* Search Box Card */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          padding: "1.75rem",
          boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
          marginBottom: "2rem"
        }}>
          <form onSubmit={handleTrack} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-98234) or Mobile Number"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "4px",
                  border: "1px solid var(--border)",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "var(--charcoal)",
                color: "#ffffff",
                padding: "14px 28px",
                borderRadius: "4px",
                border: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "background-color 0.2s"
              }}
            >
              {loading ? "Searching..." : "Track Package 🔍"}
            </button>
          </form>

          {/* Quick Demo Previews */}
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--muted)" }}>
            <span style={{ fontWeight: 600 }}>Try Demo Tracker:</span>
            <button
              type="button"
              onClick={() => { setQuery("ORD-SRT8842"); handleTrack(undefined, "ORD-SRT8842"); }}
              style={{
                background: "#ecfdf5",
                border: "1.5px solid #10b981",
                padding: "4px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#065f46",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <span>⚡</span>
              <span>ORD-SRT8842 (Live Surat 30-Min Dispatch)</span>
            </button>

            <button
              type="button"
              onClick={() => { setQuery("ORD-98234"); handleTrack(undefined, "ORD-98234"); }}
              style={{ background: "#f3f4f6", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem", color: "var(--foreground)" }}
            >
              ORD-98234 (Pan-India Shipped)
            </button>
          </div>

          {error && (
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", color: "#b91c1c", fontSize: "0.85rem" }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Live Order Results Display */}
        {order && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* If Surat Hyperlocal Delivery, render Live Surat Map & Scooter Tracker */}
            {order.isSuratExpress && (
              <SuratLiveTracker
                orderId={order.orderId || order._id}
                customerName={order.shippingAddress?.fullName || "Valued Customer"}
                customerArea={order.customerArea || order.shippingAddress?.addressLine || "Surat"}
                customerPincode={order.shippingAddress?.pincode || "395009"}
                items={order.products}
                totalAmount={order.totalAmount}
                initialMinutes={order.etaMinutes || 18}
              />
            )}
            
            {/* Top Shipment Status Card */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              padding: "1.75rem",
              boxShadow: "0 4px 18px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border-light)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    ORDER NUMBER
                  </span>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground)" }}>
                    #{order.orderId || order._id}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    ESTIMATED DELIVERY
                  </span>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#15803d" }}>
                    {order.expectedDelivery}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "2px" }}>
                    Status: <strong style={{ color: "var(--copper)", textTransform: "capitalize" }}>{order.status}</strong>
                  </div>
                </div>
              </div>

              {/* Courier & AWB Bar */}
              <div style={{
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "2rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.4rem" }}>🚚</span>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                      {order.courierPartner || "Delhivery Surface Express"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      AWB: <strong>{order.awbNumber}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyAWB}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--border)",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "var(--foreground)"
                  }}
                >
                  {copied ? "Copied ✓" : "Copy AWB Tracking #"}
                </button>
              </div>

              {/* Stepper Progress Timeline */}
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1.25rem", color: "var(--foreground)" }}>
                  Shipment Checkpoints
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative" }}>
                  {(order.checkpoints || []).map((cp: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", position: "relative" }}>
                      
                      {/* Checkpoint Dot */}
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: cp.done ? "#15803d" : cp.current ? "#d97706" : "#e5e7eb",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: cp.current ? "0 0 0 4px rgba(217, 119, 6, 0.2)" : undefined
                      }}>
                        {cp.done ? "✓" : i + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: "0.9rem",
                          fontWeight: cp.current ? 700 : cp.done ? 600 : 500,
                          color: cp.current ? "var(--copper)" : cp.done ? "var(--foreground)" : "var(--muted)"
                        }}>
                          {cp.title}
                          {cp.current && (
                            <span style={{ marginLeft: "8px", fontSize: "0.6875rem", backgroundColor: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
                          {cp.location} • {cp.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items in this shipment */}
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem", color: "var(--foreground)" }}>
                  Cookware in this Package ({order.products?.length || 0})
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(order.products || []).map((item: any, idx: number) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "8px 0" }}>
                      <div style={{ width: "52px", height: "52px", position: "relative", borderRadius: "4px", overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
                        <Image src={item.image || "/kadhai.jpg"} alt={item.name} fill style={{ objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          Qty: {item.quantity} • {formatINR(item.price)} each
                        </div>
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)" }}>
                        {formatINR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & WhatsApp Support */}
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1.5rem", marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 600 }}>
                    SHIPPING DESTINATION
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
                    {order.shippingAddress?.fullName} ({order.shippingAddress?.city}, {order.shippingAddress?.pincode})
                  </div>
                </div>

                <a
                  href={`https://wa.me/919876543210?text=Hello%20Ramdev%20Cookware!%20I%20am%20tracking%20my%20Order%20%23${order.orderId || order._id}.%20Can%20you%20please%20provide%20an%20update?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#25D366",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    padding: "10px 18px",
                    borderRadius: "4px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none"
                  }}
                >
                  <span>💬</span>
                  <span>WhatsApp Courier Support</span>
                </a>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

