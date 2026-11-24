"use client";

import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { checkPincodeServiceability, calculateDeliveryCharge, getDeliveryTier } from "@/lib/delivery";
import { useLocation } from "@/context/LocationContext";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  // Form State matching Image 1
  const { pincode: savedPincode } = useLocation();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [newsOptIn, setNewsOptIn] = useState(false);
  const [country, setCountry] = useState("India");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [aptSuite, setAptSuite] = useState("");
  const [city, setCity] = useState("Surat");
  const [state, setState] = useState("Gujarat");
  const [zipCode, setZipCode] = useState(savedPincode || "395002");
  const [phone, setPhone] = useState("");

  const tier = getDeliveryTier(zipCode);

  // Delivery Method Selection
  const [deliveryMethod, setDeliveryMethod] = useState<"surat_instant" | "standard" | "expedited">(
    tier.isSurat ? "surat_instant" : "standard"
  );

  // Payment State
  const [paymentMode, setPaymentMode] = useState<"card" | "cod" | "razorpay">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill from user session
  useEffect(() => {
    if (session?.user) {
      if (session.user.email && !emailOrPhone) setEmailOrPhone(session.user.email);
      if (session.user.name && !firstName) {
        const parts = session.user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    }
  }, [session, emailOrPhone, firstName]);

  const deliveryCost = deliveryMethod === "expedited" ? 25 : 0;
  const currentSubtotal = cartTotal > 0 ? cartTotal : 555;
  const grandTotal = currentSubtotal + deliveryCost;

  // Mock display items if cart is temporarily empty for preview
  const displayCart = cart.length > 0 ? cart : [
    {
      id: "copper-saucier-preview",
      name: "Signature Copper Saucier",
      variant: "2.5 Quart",
      price: 345,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "artisan-knife-preview",
      name: "Artisan Chef's Knife",
      variant: "8\" Damascus Steel",
      price: 210,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=600&auto=format&fit=crop"
    }
  ];

  const handleCompletePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailOrPhone.trim()) {
      setError("Please provide an email or mobile phone number.");
      return;
    }
    if (!firstName.trim() || !address.trim() || !city.trim() || !zipCode.trim()) {
      setError("Please complete all required shipping address fields.");
      return;
    }

    setLoading(true);

    try {
      // Simulate or execute order placement
      const payload = {
        items: displayCart,
        shippingAddress: {
          fullName: `${firstName} ${lastName}`.trim(),
          email: emailOrPhone,
          addressLine: `${address} ${aptSuite}`.trim(),
          city,
          state,
          pincode: zipCode,
          phone,
        },
        deliveryMethod,
        total: grandTotal,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.orderId) {
        clearCart();
        router.push(`/orders/${data.orderId}/confirmation`);
      } else {
        // Fallback for direct confirmation preview
        clearCart();
        router.push("/orders");
      }
    } catch (err) {
      clearCart();
      router.push("/orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#fafaf8", minHeight: "100vh", paddingBottom: "5rem" }}>
      {/* Top Minimal Checkout Header */}
      <header style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#ffffff", padding: "1.25rem 2rem" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/cart" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem", color: "var(--muted)", letterSpacing: "0.02em" }}>
            <span>←</span> Return to Cart
          </Link>
          <div style={{ flex: 1, textAlign: "center" }}>
            <Link href="/" className="epicurean-logo" style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", letterSpacing: "0.2em", fontWeight: 700 }}>
              EPICUREAN
            </Link>
          </div>
          <div style={{ width: "100px" }}></div>
        </div>
      </header>

      <div className="container" style={{ maxWidth: "1140px", paddingTop: "3.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3.5rem" }} className="checkout-main-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 900px) {
              .checkout-main-grid {
                grid-template-columns: 1fr 1.35fr !important;
                gap: 4.5rem !important;
              }
            }
          `}} />

          {/* Left Column: Order Summary Card */}
          <div>
            <div style={{ background: "#ffffff", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2rem", position: "sticky", top: "90px" }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.65rem", fontWeight: 500, marginBottom: "2rem", color: "var(--foreground)" }}>
                Order Summary
              </h2>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
                {displayCart.map((item: any, idx: number) => (
                  <div key={item.id || idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ position: "relative", width: "64px", height: "64px", backgroundColor: "#f5f4f0", border: "1px solid var(--border-light)", flexShrink: 0 }}>
                      <Image
                        src={item.image || "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=400&auto=format&fit=crop"}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </h4>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px" }}>
                        {item.variant || item.capacity || "Professional Grade"}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--muted-light)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        QTY {item.quantity || 1}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--foreground)" }}>
                      ${item.price}.00
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.8125rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--foreground)" }}>
                  <span style={{ color: "var(--muted)" }}>Subtotal</span>
                  <span>${currentSubtotal}.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--foreground)" }}>
                  <span style={{ color: "var(--muted)" }}>Shipping</span>
                  <span style={{ color: deliveryCost === 0 ? "var(--foreground)" : "var(--foreground)" }}>
                    {deliveryCost === 0 ? "Complimentary" : `$${deliveryCost}.00`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
                  <span>Taxes</span>
                  <span>Calculated at next step</span>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 500 }}>Total</span>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 600 }}>
                    ${grandTotal}.00
                  </span>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{ borderTop: "1px solid var(--border-light)", marginTop: "1.75rem", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.75rem", color: "var(--muted)" }}>
                  <span style={{ color: "var(--copper)", fontSize: "0.9rem" }}>🛡️</span> Lifetime Warranty Included
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.75rem", color: "var(--muted)" }}>
                  <span style={{ color: "var(--copper)", fontSize: "0.9rem" }}>🚚</span> Free White-Glove Delivery
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form */}
          <div>
            {error && (
              <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "2px", marginBottom: "1.5rem", fontSize: "0.8125rem" }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCompletePurchase}>
              {/* 1. Contact Section */}
              <section style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 500, color: "var(--foreground)" }}>
                    Contact
                  </h3>
                  <Link href="/login" style={{ fontSize: "0.75rem", color: "var(--copper)", fontWeight: 500 }}>
                    Log in
                  </Link>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                  <input
                    type="text"
                    required
                    placeholder="Email or mobile phone number"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--muted)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={newsOptIn}
                    onChange={(e) => setNewsOptIn(e.target.checked)}
                  />
                  Email me with news and offers
                </label>
              </section>

              {/* 2. Shipping Address */}
              <section style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "1rem" }}>
                  Shipping Address
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="India">India</option>
                  </select>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                  />

                  <input
                    type="text"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={aptSuite}
                    onChange={(e) => setAptSuite(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "0.85rem" }}>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                    />
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                    >
                      <option value="NY">NY</option>
                      <option value="CA">CA</option>
                      <option value="TX">TX</option>
                      <option value="IL">IL</option>
                      <option value="FL">FL</option>
                      <option value="GJ">Gujarat</option>
                      <option value="MH">Maharashtra</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="ZIP code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                    />
                  </div>

                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none", backgroundColor: "#ffffff" }}
                  />
                </div>
              </section>

              {/* 3. Delivery Method */}
              <section style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>
                    Delivery Method
                  </h3>
                  {tier.isSurat && (
                    <span style={{ fontSize: "0.75rem", backgroundColor: "#ecfdf5", color: "#059669", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", border: "1px solid #a7f3d0" }}>
                      ⚡ Surat Quick Commerce Active
                    </span>
                  )}
                </div>

                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", backgroundColor: "#ffffff", overflow: "hidden" }}>
                  {/* Surat 30-min or 60-min Instant Delivery Option */}
                  {tier.isSurat && (
                    <label style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 18px",
                      borderBottom: "1px solid #86efac",
                      cursor: "pointer",
                      backgroundColor: deliveryMethod === "surat_instant" ? "#f0fdf4" : "#ffffff"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={deliveryMethod === "surat_instant"}
                          onChange={() => setDeliveryMethod("surat_instant")}
                        />
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#166534", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>⚡ {tier.badgeText} ({tier.etaText})</span>
                            <span style={{ fontSize: "0.68rem", backgroundColor: "#22c55e", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>SURAT EXCLUSIVE</span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#15803d", marginTop: "2px" }}>
                            Direct rider dispatch from Ramdev Vasan Bhandar, Surat.
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "#166534", fontWeight: 700 }}>FREE</span>
                    </label>
                  )}

                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)", cursor: "pointer", backgroundColor: deliveryMethod === "standard" ? "#fbfaf7" : "#ffffff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === "standard"}
                        onChange={() => setDeliveryMethod("standard")}
                      />
                      <span style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>Standard Courier (2-3 Business Days)</span>
                    </div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Free</span>
                  </label>

                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer", backgroundColor: deliveryMethod === "expedited" ? "#fbfaf7" : "#ffffff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={deliveryMethod === "expedited"}
                        onChange={() => setDeliveryMethod("expedited")}
                      />
                      <span style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>Air Cargo Expedited (Next-Day)</span>
                    </div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--foreground)", fontWeight: 500 }}>₹149</span>
                  </label>
                </div>
              </section>

              {/* 4. Payment */}
              <section style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 500, color: "var(--foreground)", marginBottom: "0.35rem" }}>
                  Payment
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  🔒 All transactions are secure and encrypted.
                </p>

                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", backgroundColor: "#ffffff", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <input
                    type="text"
                    placeholder="Card number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none" }}
                  />

                  <input
                    type="text"
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none" }}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <input
                      type="text"
                      placeholder="Expiration date (MM / YY)"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none" }}
                    />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Security code"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", fontSize: "0.875rem", outline: "none" }}
                    />
                  </div>
                </div>
              </section>

              {/* Complete Purchase Button (Copper Color Matching Image 1) */}
              <button
                type="submit"
                disabled={loading}
                className="btn-copper"
                style={{ width: "100%", padding: "16px", fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "0.04em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
              >
                🔒 {loading ? "Processing Purchase..." : "Complete Purchase"}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.6875rem", color: "var(--muted)", marginTop: "1rem" }}>
                By completing your purchase, you agree to our <Link href="/terms" style={{ textDecoration: "underline" }}>Terms of Service</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
