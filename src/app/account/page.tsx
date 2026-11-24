"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useLocation } from "@/context/LocationContext";
import { getDeliveryTier } from "@/lib/delivery";

export default function AccountPage() {
  const { data: session } = useSession();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [profile, setProfile] = useState({
    stoveType: "",
    familySize: "",
    cookingStyle: ""
  });

  const [isEditing, setIsEditing] = useState(false);

  // Customer Delivery & Pincode Details
  const { pincode: contextPincode, setPincode } = useLocation();
  const [addressDetails, setAddressDetails] = useState({
    phone: "",
    addressLine: "",
    city: "Surat",
    pincode: contextPincode || ""
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressSavedMessage, setAddressSavedMessage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kitchen_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }

    const savedAddr = localStorage.getItem("customer_address");
    if (savedAddr) {
      try {
        const parsed = JSON.parse(savedAddr);
        setAddressDetails(parsed);
        if (parsed.pincode) setPincode(parsed.pincode);
      } catch (e) {}
    }
  }, []);

  const saveAddressDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem("customer_address", JSON.stringify(addressDetails));
    if (addressDetails.pincode) {
      setPincode(addressDetails.pincode.trim());
    }
    setIsEditingAddress(false);
    setAddressSavedMessage(true);
    setTimeout(() => setAddressSavedMessage(false), 4000);
  };

  const accountTier = addressDetails.pincode?.trim().length === 6 ? getDeliveryTier(addressDetails.pincode) : null;

  useEffect(() => {
    if (session?.user) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(Array.isArray(data) ? data : []);
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));
    }
  }, [session]);

  const saveProfile = () => {
    localStorage.setItem("kitchen_profile", JSON.stringify(profile));
    setIsEditing(false);
  };

  const hasProfile = profile.stoveType && profile.familySize;
  const userName = session?.user?.name || "Customer Account";
  const userEmail = session?.user?.email || "Logged in User";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "CU";

  // Compute Real Customer Metrics from MongoDB Orders
  const totalOrdersCount = orders.length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "delivered").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing").length;
  const totalSpent = orders.reduce((acc, o) => {
    if (o.status !== "cancelled" && (o.paymentStatus === "paid" || o.paymentMethod === "cod" || o.status === "delivered")) {
      return acc + (o.totalAmount || 0);
    }
    return acc;
  }, 0);

  // Missing Essentials Recommendations based on Virtual Kitchen Profile
  const missingEssentials = [];
  if (hasProfile) {
    if (profile.stoveType === "Induction") {
      missingEssentials.push({
        id: "k1",
        name: "Induction-Safe Triply Kadai",
        reason: "Must-have for induction users to ensure even heat distribution without burning.",
        image: "/product-kadai.png",
        price: 2499
      });
    }
    if (profile.familySize === "5-6" || profile.familySize === "7+") {
      missingEssentials.push({
        id: "p1",
        name: "Large 5L Pressure Cooker",
        reason: `Essential for cooking rice and dal for ${profile.familySize} people efficiently.`,
        image: "/product-pressure-cooker.png",
        price: 3499
      });
    }
    if (profile.cookingStyle === "Dosa/Roti") {
      missingEssentials.push({
        id: "t1",
        name: "Cast Iron Flat Tawa",
        reason: "The secret to perfectly crispy dosas and evenly cooked rotis.",
        image: "/product-fry-pan.png",
        price: 1499
      });
    }

    if (missingEssentials.length === 0) {
      missingEssentials.push({
        id: "k2",
        name: "Premium Deep Fry Pan",
        reason: "A versatile essential missing from most modern kitchens.",
        image: "/product-fry-pan.png",
        price: 1599
      });
    }
  }

  return (
    <main className="container" style={{ padding: "var(--spacing-2xl) 0", minHeight: "80vh" }}>
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "var(--spacing-2xl)" }}>

        {/* Sidebar */}
        <div style={{ background: "var(--card-bg)", padding: "var(--spacing-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", height: "fit-content" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", margin: "0 auto var(--spacing-sm)", fontWeight: 700 }}>
              {userInitials}
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{userName}</h2>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>{userEmail}</p>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <Link href="/account" style={{ padding: "8px 12px", background: "rgba(var(--primary-rgb), 0.1)", color: "var(--primary)", borderRadius: "var(--radius-sm)", fontWeight: 500 }}>
              My Virtual Kitchen
            </Link>
            <Link href="/account/orders" style={{ padding: "8px 12px", color: "var(--foreground)", borderRadius: "var(--radius-sm)", fontWeight: 500 }}>
              Order History & Invoices
            </Link>
            <Link href="/shop" style={{ padding: "8px 12px", color: "var(--muted)", borderRadius: "var(--radius-sm)" }}>
              Browse Utensils
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div>
          {/* Customer Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Total Orders</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginTop: "4px" }}>
                {loadingOrders ? "..." : totalOrdersCount}
              </div>
            </div>

            <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Pending Orders</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#c2410c", marginTop: "4px" }}>
                {loadingOrders ? "..." : pendingOrdersCount}
              </div>
            </div>

            <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Delivered</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>
                {loadingOrders ? "..." : deliveredOrdersCount}
              </div>
            </div>

            <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <span className="text-muted" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Total Spent</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginTop: "4px" }}>
                ₹{loadingOrders ? "..." : totalSpent.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Customer Delivery & Account Details Card */}
          <div style={{ background: "var(--card-bg)", padding: "var(--spacing-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", marginBottom: "var(--spacing-2xl)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 600, margin: "0 0 4px 0", color: "var(--foreground)" }}>
                  Delivery Address & Pincode
                </h2>
                <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                  Complete your shipping details to enable fast 1-tap checkout.
                </p>
              </div>
              {!isEditingAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="btn-secondary"
                  style={{ padding: "6px 14px", fontSize: "0.8125rem" }}
                >
                  {addressDetails.pincode ? "Edit Address" : "Add Address"}
                </button>
              )}
            </div>

            {addressSavedMessage && (
              <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem" }}>
                ✓ Address & delivery details updated successfully!
              </div>
            )}

            {!isEditingAddress && addressDetails.pincode ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Delivery Street</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "2px" }}>
                      {addressDetails.addressLine || "No street address entered yet"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>City & Pincode</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "2px" }}>
                      {addressDetails.city || "Surat"} - {addressDetails.pincode}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Contact Phone</div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: "2px" }}>
                      {addressDetails.phone || "Not set"}
                    </div>
                  </div>
                </div>

                {/* Surat Exclusive Perk Unlocked Display */}
                {accountTier?.isSurat && (
                  <div style={{ backgroundColor: "#ecfdf5", border: "1.5px solid #10b981", borderRadius: "8px", padding: "12px 16px", marginTop: "12px" }}>
                    <div style={{ color: "#065f46", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>⚡</span>
                      <span>Account Perk Active: {accountTier.badgeText} ({accountTier.etaText})!</span>
                    </div>
                    <p style={{ margin: "4px 0 0 0", color: "#047857", fontSize: "0.8rem", lineHeight: 1.4 }}>
                      {accountTier.message} Dispatched by local rider directly from Ramdev Vasan Bhandar, Surat whenever you place an order.
                    </p>
                  </div>
                )}
                {accountTier && !accountTier.isSurat && (
                  <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 14px", marginTop: "12px", fontSize: "0.8rem", color: "#475569" }}>
                    🚚 Delivery Speed: Standard Pan-India Express (2-3 Business Days).
                  </div>
                )}
              </div>
            ) : !isEditingAddress && !addressDetails.pincode ? (
              <div style={{ padding: "1.5rem", textAlign: "center", border: "1.5px dashed var(--border)", borderRadius: "8px" }}>
                <p style={{ margin: "0 0 12px 0", color: "var(--muted)", fontSize: "0.875rem" }}>
                  You haven&apos;t added your delivery address yet. Complete it now for faster checkout.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="btn-primary"
                  style={{ padding: "8px 20px", fontSize: "0.875rem" }}
                >
                  Complete Address Details
                </button>
              </div>
            ) : (
              <form onSubmit={saveAddressDetails} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>Contact Phone</label>
                    <input
                      type="tel"
                      value={addressDetails.phone}
                      onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>Delivery Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={addressDetails.pincode}
                      onChange={(e) => setAddressDetails({ ...addressDetails, pincode: e.target.value.replace(/\D/g, "") })}
                      placeholder="Enter 6-digit Pincode (e.g. 395002)"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.875rem", fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>Street Address & Landmark</label>
                    <input
                      type="text"
                      value={addressDetails.addressLine}
                      onChange={(e) => setAddressDetails({ ...addressDetails, addressLine: e.target.value })}
                      placeholder="Flat / House No., Society, Landmark"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.875rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "4px" }}>City</label>
                    <input
                      type="text"
                      value={addressDetails.city}
                      onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })}
                      placeholder="e.g. Surat"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.875rem" }}
                    />
                  </div>
                </div>

                {/* Instant preview of entered pincode inside edit form */}
                {accountTier?.isSurat && (
                  <div style={{ backgroundColor: "#ecfdf5", border: "1.5px solid #10b981", borderRadius: "6px", padding: "10px 14px", fontSize: "0.8rem", color: "#065f46" }}>
                    ⚡ <strong>Special Local Perk Unlocked:</strong> {accountTier.badgeText} ({accountTier.etaText})!
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button type="submit" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
                    Save Address Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: "0.875rem", background: "transparent" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--spacing-xl)" }}>
            <div>
              <h1 className="heading-primary" style={{ marginBottom: "4px" }}>My Virtual Kitchen</h1>
              <p className="text-muted">Personalize your profile so we can recommend the perfect cookware.</p>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: "8px 16px" }}>
                Edit Profile
              </button>
            )}
          </div>

          <div style={{ background: "var(--card-bg)", padding: "var(--spacing-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", marginBottom: "var(--spacing-2xl)" }}>
            {!isEditing && hasProfile ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-lg)" }}>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Stove Type</div>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{profile.stoveType}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Family Size</div>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{profile.familySize}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "4px" }}>Primary Cooking</div>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>{profile.cookingStyle}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-lg)" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>What is your Stove Type?</label>
                    <select
                      value={profile.stoveType}
                      onChange={(e) => setProfile({ ...profile, stoveType: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
                    >
                      <option value="">Select...</option>
                      <option value="Gas">Gas Stove</option>
                      <option value="Induction">Induction Cooktop</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>How many people do you cook for?</label>
                    <select
                      value={profile.familySize}
                      onChange={(e) => setProfile({ ...profile, familySize: e.target.value })}
                      style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
                    >
                      <option value="">Select...</option>
                      <option value="1-2">1-2 People</option>
                      <option value="3-4">3-4 People</option>
                      <option value="5-6">5-6 People</option>
                      <option value="7+">7+ People</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>What do you cook most often?</label>
                  <select
                    value={profile.cookingStyle}
                    onChange={(e) => setProfile({ ...profile, cookingStyle: e.target.value })}
                    style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
                  >
                    <option value="">Select...</option>
                    <option value="Curries/Gravies">Curries / Gravies</option>
                    <option value="Dosa/Roti">Dosa / Roti</option>
                    <option value="Deep Frying">Deep Frying</option>
                    <option value="General Mix">A mix of everything</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-md)", marginTop: "var(--spacing-sm)" }}>
                  <button onClick={saveProfile} className="btn-primary" style={{ padding: "10px 24px" }}>
                    Save Kitchen Profile
                  </button>
                  {hasProfile && (
                    <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: "10px 24px", background: "transparent" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {hasProfile && !isEditing && (
            <div>
              <h2 className="heading-secondary" style={{ marginBottom: "var(--spacing-lg)" }}>Missing Kitchen Essentials</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--spacing-md)" }}>
                {missingEssentials.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "var(--spacing-xl)", background: "#f9fafb", padding: "var(--spacing-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", alignItems: "center" }}>
                    <div style={{ width: "100px", height: "100px", position: "relative", background: "white", borderRadius: "var(--radius-md)", padding: "8px" }}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "8px" }}>{item.name}</h3>
                      <p className="text-muted" style={{ marginBottom: "12px" }}>{item.reason}</p>
                      <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>₹{item.price}</div>
                    </div>
                    <div>
                      <Link href="/shop" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
                        Shop Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
