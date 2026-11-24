import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import connectToDatabase from "@/lib/mongoose";
import { db } from "@/lib/db";



export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;

  try {
    await connectToDatabase();
  } catch (e) {}

  const orderDoc: any = await db.orders.findById(p.id);

  if (!orderDoc) {
    notFound();
  }


  const order: any = {
    ...orderDoc,
    _id: orderDoc._id.toString()
  };

  const isCod = order.paymentMethod === "cod";
  const addr = typeof order.shippingAddress === "object" ? order.shippingAddress : {};

  return (
    <main className="container" style={{ padding: "var(--spacing-2xl) var(--spacing-xl)", maxWidth: "760px" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: "64px", height: "64px", background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "1rem" }}>
          ✓
        </div>
        <h1 className="heading-primary" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          {isCod ? "Order Placed Successfully!" : "Order Created (Payment Pending)"}
        </h1>
        <p className="text-muted">
          Thank you for shopping with Ramdev Vasan Bhandar. Your order ID is <strong>#{order._id}</strong>.
        </p>
      </div>

      {/* Order Status Banner */}
      <div style={{ background: isCod ? "#f0fdf4" : "#fff7ed", border: `1px solid ${isCod ? "#bbf7d0" : "#ffedd5"}`, borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Order Status</div>
          <div style={{ fontSize: "1.125rem", fontWeight: 700, color: isCod ? "#15803d" : "#c2410c", textTransform: "capitalize" }}>
            {order.status}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)", textAlign: "right" }}>Payment Status</div>
          <div style={{ fontSize: "1.125rem", fontWeight: 700, color: isCod ? "#15803d" : "#c2410c", textAlign: "right" }}>
            {isCod ? "Cash on Delivery" : "Pending Payment"}
          </div>
        </div>
      </div>

      {/* Order Items List */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 className="heading-secondary" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Item Details
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {order.products.map((item: any, i: number) => {
            const prod = item.product || {};
            return (
              <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: i < order.products.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < order.products.length - 1 ? "1rem" : "0" }}>
                <div style={{ position: "relative", width: "56px", height: "56px", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", flexShrink: 0 }}>
                  <Image src={prod.image || "/product-kadai.png"} alt={prod.name || "Utensil"} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{prod.name || "Utensil Item"}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                    Qty: {item.quantity} × ₹{item.priceAtTime}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                  ₹{item.priceAtTime * item.quantity}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery & Pricing Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <h2 className="heading-secondary" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
            Delivery Address
          </h2>
          <div style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--foreground)" }}>
            <strong>{addr.fullName || "Customer"}</strong><br />
            {addr.addressLine}<br />
            {addr.city}, {addr.state} – {addr.pincode}<br />
            📱 Mobile: {addr.mobile || "N/A"}<br />
            ✉️ Email: {addr.email || "N/A"}
          </div>
        </div>

        <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <h2 className="heading-secondary" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
            Payment Summary
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Subtotal:</span>
              <span>₹{order.subtotal || order.totalAmount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Delivery Charge:</span>
              <span>{order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px", fontWeight: 700, fontSize: "1.125rem" }}>
              <span>Total Amount:</span>
              <span style={{ color: "var(--primary)" }}>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Link href="/account/orders" className="btn-secondary" style={{ padding: "12px 24px" }}>
          View My Orders
        </Link>
        <Link href="/shop" className="btn-primary" style={{ padding: "12px 24px" }}>
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
