"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import OrderTimeline from "@/components/OrderTimeline";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchOrderDetails = () => {
    if (session?.user && resolvedParams.id) {
      fetch(`/api/orders/${resolvedParams.id}`)
        .then((res) => {
          if (res.status === 403) {
            throw new Error("Unauthorized: You do not have permission to view this order.");
          }
          if (res.status === 404) {
            throw new Error("Order not found.");
          }
          if (!res.ok) {
            throw new Error("Failed to fetch order details.");
          }
          return res.json();
        })
        .then((data) => setOrder(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/account/orders/${resolvedParams.id}`);
    }
  }, [status, router, resolvedParams.id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [session, resolvedParams.id]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!order) return;
    setProcessing(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay Payment SDK.");
        setProcessing(false);
        return;
      }

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id })
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        alert(data.message || "Failed to initialize payment retry.");
        setProcessing(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Ramdev Vasan Bhandar",
        description: `Order #${order._id}`,
        order_id: data.id,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || ""
        },
        theme: { color: "#ea580c" },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              alert("Payment verified successfully!");
              fetchOrderDetails();
            } else {
              alert(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            alert("Error verifying payment signature.");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const razorpayModal = new (window as any).Razorpay(options);
      razorpayModal.open();

    } catch (err) {
      alert("An error occurred during payment retry.");
      setProcessing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container" style={{ padding: "var(--spacing-2xl) 0", textAlign: "center" }}>
        <p className="text-muted">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "var(--spacing-2xl) 0", textAlign: "center", maxWidth: "600px" }}>
        <div style={{ padding: "16px", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "8px", border: "1px solid #fca5a5", marginBottom: "1.5rem" }}>
          ⚠️ {error}
        </div>
        <Link href="/account/orders" className="btn-primary">
          Back to Order History
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const addr = typeof order.shippingAddress === "object" ? order.shippingAddress : {};
  const isCod = order.paymentMethod === "cod";
  const isPaid = order.paymentStatus === "paid";
  const isUnpaidOnline = !isCod && !isPaid && order.status !== "cancelled";

  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <main className="container" style={{ padding: "var(--spacing-2xl) var(--spacing-xl)", maxWidth: "860px" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/account">Account</Link> &gt; <Link href="/account/orders">Orders</Link> &gt; <span style={{ color: "var(--foreground)" }}>#{order._id}</span>
        </div>
        <Link
          href={`/orders/${order._id}/invoice`}
          target="_blank"
          className="btn-secondary"
          style={{ padding: "4px 12px", fontSize: "0.8125rem" }}
        >
          📄 View GST Invoice
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="heading-primary" style={{ fontSize: "1.75rem", marginBottom: "4px" }}>
            Order Details
          </h1>
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>Placed on {formattedDate}</span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.8125rem", fontWeight: 700, background: isPaid ? "#f0fdf4" : isCod ? "#f0fdf4" : "#fff7ed", color: isPaid ? "#15803d" : isCod ? "#15803d" : "#c2410c", border: `1px solid ${isPaid ? "#bbf7d0" : isCod ? "#bbf7d0" : "#ffedd5"}` }}>
            Status: {order.status?.toUpperCase()}
          </span>
          {isUnpaidOnline && (
            <button
              onClick={handlePayNow}
              disabled={processing}
              className="btn-primary"
              style={{ padding: "6px 14px", fontSize: "0.875rem", backgroundColor: "#16a34a" }}
            >
              {processing ? "Processing..." : "Pay Now 💳"}
            </button>
          )}
        </div>
      </div>

      {/* Visual Order Tracking Timeline */}
      <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />


      {/* Items Section */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 className="heading-secondary" style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
          Ordered Items ({order.products?.length || 0})
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {order.products?.map((item: any, i: number) => {
            const prod = item.product || {};
            return (
              <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: i < order.products.length - 1 ? "1px solid var(--border)" : "none", paddingBottom: i < order.products.length - 1 ? "1rem" : "0" }}>
                <div style={{ position: "relative", width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", flexShrink: 0 }}>
                  <Image src={prod.image || "/product-kadai.png"} alt={prod.name || "Product"} fill style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Link href={prod._id ? `/shop/${prod._id}` : "#"} style={{ fontWeight: 600, fontSize: "1rem", color: "var(--foreground)" }}>
                    {prod.name || "Utensil Product"}
                  </Link>
                  <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "2px" }}>
                    Category: {prod.category || "Utensils"}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--foreground)", marginTop: "2px" }}>
                    Qty: {item.quantity} × ₹{item.priceAtTime}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--foreground)" }}>
                  ₹{item.priceAtTime * item.quantity}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Address & Price Summary Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <h2 className="heading-secondary" style={{ fontSize: "1.125rem", marginBottom: "0.75rem" }}>
            Shipping Address
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
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Subtotal:</span>
              <span>₹{order.subtotal || order.totalAmount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Delivery Charge:</span>
              <span>{order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Payment Method:</span>
              <span style={{ fontWeight: 600 }}>{isCod ? "Cash on Delivery" : "Razorpay Online"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="text-muted">Payment Status:</span>
              <span style={{ fontWeight: 600, color: isPaid ? "#16a34a" : isCod ? "#15803d" : "#c2410c" }}>
                {order.paymentStatus?.toUpperCase()}
              </span>
            </div>
            {order.razorpayPaymentId && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)" }}>
                <span>Razorpay Payment ID:</span>
                <span style={{ fontFamily: "monospace" }}>{order.razorpayPaymentId}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px", marginTop: "4px", fontWeight: 700, fontSize: "1.125rem" }}>
              <span>Total Amount:</span>
              <span style={{ color: "var(--primary)" }}>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/account/orders" className="btn-secondary">
          ← Back to All Orders
        </Link>
      </div>
    </main>
  );
}
