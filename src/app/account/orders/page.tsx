"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account/orders");
    }
  }, [status, router]);

  const fetchOrders = () => {
    if (session?.user) {
      fetch("/api/orders")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch order history");
          return res.json();
        })
        .then((data) => {
          setOrders(Array.isArray(data) ? data : []);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session]);

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

  const handlePayNow = async (orderId: string) => {
    setProcessingOrderId(orderId);
    setError("");

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay Payment SDK. Please check your network.");
        setProcessingOrderId(null);
        return;
      }

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        alert(data.message || "Failed to initialize payment retry.");
        setProcessingOrderId(null);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Ramdev Vasan Bhandar",
        description: `Order #${orderId}`,
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
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              alert("Payment verified successfully!");
              fetchOrders();
            } else {
              alert(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            alert("Error verifying payment signature.");
          } finally {
            setProcessingOrderId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingOrderId(null);
          }
        }
      };

      const razorpayModal = new (window as any).Razorpay(options);
      razorpayModal.open();

    } catch (err) {
      alert("An error occurred during payment retry.");
      setProcessingOrderId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container" style={{ padding: "var(--spacing-2xl) 0", textAlign: "center" }}>
        <p className="text-muted">Loading your order history...</p>
      </div>
    );
  }

  const userName = session?.user?.name || "Customer Account";
  const userEmail = session?.user?.email || "Logged in User";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "CU";

  return (
    <main className="container" style={{ padding: "var(--spacing-2xl) 0", minHeight: "80vh" }}>
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "var(--spacing-2xl)" }}>
        
        {/* Account Sidebar */}
        <div style={{ background: "var(--card-bg)", padding: "var(--spacing-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", height: "fit-content" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", margin: "0 auto var(--spacing-sm)", fontWeight: 700 }}>
              {userInitials}
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{userName}</h2>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>{userEmail}</p>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <Link href="/account" style={{ padding: "8px 12px", color: "var(--foreground)", borderRadius: "var(--radius-sm)", fontWeight: 500 }}>
              My Virtual Kitchen
            </Link>
            <Link href="/account/orders" style={{ padding: "8px 12px", background: "rgba(var(--primary-rgb), 0.1)", color: "var(--primary)", borderRadius: "var(--radius-sm)", fontWeight: 600 }}>
              Order History
            </Link>
          </nav>
        </div>

        {/* Main Orders Content */}
        <div>
          <div style={{ marginBottom: "var(--spacing-xl)" }}>
            <h1 className="heading-primary" style={{ marginBottom: "4px" }}>Order History</h1>
            <p className="text-muted">View and manage your past orders placed with Ramdev Vasan Bhandar.</p>
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: "8px", marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div style={{ background: "#f8fafc", padding: "3rem 1.5rem", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--foreground)" }}>No orders placed yet</h3>
              <p className="text-muted" style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                You haven't placed any orders with us yet. Browse our premium utensils catalog to get started!
              </p>
              <Link href="/shop" className="btn-primary" style={{ padding: "10px 20px" }}>
                Browse Utensils Catalog
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {orders.map((order) => {
                const isCod = order.paymentMethod === "cod";
                const isPaid = order.paymentStatus === "paid";
                const isUnpaidOnline = !isCod && !isPaid && order.status !== "cancelled";
                const itemCount = order.products?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                });

                return (
                  <div
                    key={order._id}
                    style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                      <div>
                        <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Order ID</span>
                        <div style={{ fontWeight: 700, fontSize: "1rem" }}>#{order._id}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Date</span>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{formattedDate}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>
                          <strong>{itemCount} item(s)</strong> • {isCod ? "Cash on Delivery" : "Razorpay Online"}
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600, background: isPaid ? "#f0fdf4" : isCod ? "#f0fdf4" : "#fff7ed", color: isPaid ? "#15803d" : isCod ? "#15803d" : "#c2410c", border: `1px solid ${isPaid ? "#bbf7d0" : isCod ? "#bbf7d0" : "#ffedd5"}` }}>
                            {order.status?.toUpperCase()}
                          </span>
                          <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600, background: isPaid ? "#dcfce7" : "#f1f5f9", color: isPaid ? "#166534" : "#475569" }}>
                            Payment: {order.paymentStatus?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Total Amount</div>
                          <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--primary)" }}>₹{order.totalAmount}</div>
                        </div>

                        {/* Pay Now Button for Unpaid Online Orders */}
                        {isUnpaidOnline && (
                          <button
                            onClick={() => handlePayNow(order._id)}
                            disabled={processingOrderId === order._id}
                            className="btn-primary"
                            style={{ padding: "6px 14px", fontSize: "0.875rem", backgroundColor: "#16a34a" }}
                          >
                            {processingOrderId === order._id ? "Processing..." : "Pay Now 💳"}
                          </button>
                        )}

                        <Link
                          href={`/account/orders/${order._id}`}
                          className="btn-secondary"
                          style={{ padding: "6px 14px", fontSize: "0.875rem" }}
                        >
                          View Order →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
