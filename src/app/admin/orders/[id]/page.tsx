"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError(res.error || "Order not found.");
        }
      })
      .catch(() => setError("Failed to fetch order details."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const updateOrderStatus = async (newStatus: string) => {
    if (newStatus === "cancelled" && !confirm("Cancel order and rollback inventory stock?")) {
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder((prev: any) => ({ ...prev, status: newStatus }));
      } else {
        alert(data.error || "Failed to update order status.");
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newPayStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPayStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder((prev: any) => ({ ...prev, paymentStatus: newPayStatus }));
      }
    } catch (err) {
      alert("Error updating payment");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6B7280" }}>Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#DC2626", fontWeight: 600 }}>{error || "Order not found."}</p>
        <Link href="/admin/orders" style={{ color: "#B45309", textDecoration: "none", fontWeight: 700 }}>
          ← Back to Orders List
        </Link>
      </div>
    );
  }

  const timelineSteps = [
    { key: "pending", label: "Order Placed" },
    { key: "processing", label: "Processing / Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentIdx = timelineSteps.findIndex((s) => s.key === order.status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <Link href="/admin/orders" style={{ color: "#B45309", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
            ← Back to All Orders
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#111827" }}>
              Order #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} type="order" />
          </div>
          <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            Placed on {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </div>

        {/* Status Actions */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {order.status === "pending" && (
            <button
              disabled={updating}
              onClick={() => updateOrderStatus("processing")}
              style={{ padding: "8px 16px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Mark Processing
            </button>
          )}

          {(order.status === "processing" || order.status === "confirmed") && (
            <button
              disabled={updating}
              onClick={() => updateOrderStatus("shipped")}
              style={{ padding: "8px 16px", backgroundColor: "#7C3AED", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Mark Shipped
            </button>
          )}

          {order.status === "shipped" && (
            <button
              disabled={updating}
              onClick={() => updateOrderStatus("delivered")}
              style={{ padding: "8px 16px", backgroundColor: "#059669", color: "#FFFFFF", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Mark Delivered
            </button>
          )}

          {order.status !== "cancelled" && order.status !== "delivered" && (
            <button
              disabled={updating}
              onClick={() => updateOrderStatus("cancelled")}
              style={{ padding: "8px 14px", backgroundColor: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "6px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Interactive Order Timeline */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
          Order Fulfillment Timeline
        </h3>

        {order.status === "cancelled" ? (
          <div style={{ padding: "14px", backgroundColor: "#FEF2F2", color: "#991B1B", borderRadius: "8px", fontWeight: 600, textAlign: "center" }}>
            ✕ This order was cancelled. Stock has been safely returned to inventory.
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative", padding: "10px 20px" }}>
            <div style={{ position: "absolute", top: "24px", left: "40px", right: "40px", height: "3px", backgroundColor: "#E5E7EB", zIndex: 1 }} />
            {timelineSteps.map((step, idx) => {
              const isPast = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: isPast ? "#B45309" : "#E5E7EB",
                      color: isPast ? "#FFFFFF" : "#9CA3AF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      border: isCurrent ? "3px solid #FCD34D" : "none",
                    }}
                  >
                    {isPast ? "✓" : idx + 1}
                  </div>
                  <span style={{ fontSize: "0.8rem", fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#B45309" : "#4B5563", marginTop: "8px", textAlign: "center" }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="admin-grid-2">
        {/* Products In Order */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
            Ordered Items ({order.products?.length || 0})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {order.products?.map((item: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "6px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                    🍳
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>{item.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>
                      Qty: {item.quantity} × ₹{item.priceAtTime?.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem" }}>
                  ₹{(item.quantity * item.priceAtTime).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          {/* Billing Summary */}
          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "2px dashed #E5E7EB", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#4B5563" }}>
              <span>Items Subtotal:</span>
              <span>₹{(order.subtotal || order.totalAmount).toLocaleString("en-IN")}</span>
            </div>

            {order.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#059669", fontWeight: 600 }}>
                <span>Discount Applied:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", color: "#4B5563" }}>
              <span>Delivery Fee:</span>
              <span>{order.deliveryCharge === 0 ? "FREE (Order ≥ ₹999)" : `₹${order.deliveryCharge}`}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", color: "#111827", paddingTop: "8px", borderTop: "1px solid #E5E7EB" }}>
              <span>Final Total:</span>
              <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Address */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Customer info */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
              Customer & Shipping Details
            </h3>

            <div style={{ fontSize: "0.85rem", color: "#374151", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div><strong style={{ color: "#111827" }}>Name:</strong> {order.customer?.name}</div>
              <div><strong style={{ color: "#111827" }}>Mobile:</strong> {order.customer?.mobile || "Not provided"}</div>
              <div><strong style={{ color: "#111827" }}>Email:</strong> {order.customer?.email || "Not provided"}</div>
              <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #F3F4F6" }}>
                <strong style={{ color: "#111827" }}>Address:</strong>
                <div>{order.customer?.addressLine}</div>
                <div>{order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}</div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "20px", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                Payment Information
              </h3>
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>

            <div style={{ fontSize: "0.85rem", color: "#374151", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div><strong style={{ color: "#111827" }}>Payment Method:</strong> {order.paymentMethod?.toUpperCase()}</div>
              {order.razorpayOrderId && (
                <div><strong style={{ color: "#111827" }}>Razorpay Order ID:</strong> {order.razorpayOrderId}</div>
              )}
              {order.razorpayPaymentId && (
                <div><strong style={{ color: "#111827" }}>Payment ID:</strong> {order.razorpayPaymentId}</div>
              )}

              {/* Quick payment status updater for COD */}
              {order.paymentMethod === "cod" && order.paymentStatus !== "paid" && (
                <button
                  disabled={updating}
                  onClick={() => updatePaymentStatus("paid")}
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#D1FAE5",
                    color: "#065F46",
                    border: "1px solid #A7F3D0",
                    borderRadius: "6px",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  ✓ Mark COD Cash Collected (Paid)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}