"use client";

interface OrderTimelineProps {
  status: string; // "pending" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function OrderTimeline({ status, createdAt, updatedAt }: OrderTimelineProps) {
  const isCancelled = status === "cancelled";

  const steps = [
    { key: "pending", label: "Order Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStatusIndex = (st: string) => {
    switch (st) {
      case "pending": return 0;
      case "confirmed": return 1;
      case "processing": return 2;
      case "shipped": return 3;
      case "out_for_delivery": return 4;
      case "delivered": return 5;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  if (isCancelled) {
    return (
      <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#b91c1c", fontWeight: 700, fontSize: "1.125rem" }}>
          <span>❌ Order Cancelled</span>
        </div>
        <div style={{ fontSize: "0.875rem", color: "#7f1d1d", marginTop: "4px" }}>
          This order was cancelled. If you have any questions or need a refund, please contact customer support.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h2 className="heading-secondary" style={{ fontSize: "1.125rem", marginBottom: "1.25rem" }}>
        Order Tracking Status
      </h2>

      <div style={{ display: "flex", justifyContent: "space-between", position: "relative", gap: "8px" }} className="timeline-container">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          let circleBg = "#e2e8f0";
          let circleColor = "#64748b";
          let labelColor = "#64748b";
          let fontWeight = 400;

          if (isCompleted) {
            circleBg = "#16a34a";
            circleColor = "#ffffff";
            labelColor = "#16a34a";
            fontWeight = 600;
          } else if (isCurrent) {
            circleBg = "var(--primary)";
            circleColor = "#ffffff";
            labelColor = "var(--primary)";
            fontWeight = 700;
          }

          return (
            <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
              {/* Connector line between nodes */}
              {idx > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "50%",
                    left: "-50%",
                    height: "3px",
                    backgroundColor: idx <= currentIndex ? "#16a34a" : "#e2e8f0",
                    zIndex: -1
                  }}
                />
              )}

              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: circleBg,
                  color: circleColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",

                  fontWeight: 700,
                  boxShadow: isCurrent ? "0 0 0 4px rgba(234, 88, 12, 0.2)" : "none"
                }}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>

              <span
                style={{
                  fontSize: "0.75rem",
                  marginTop: "8px",
                  textAlign: "center",
                  color: labelColor,
                  fontWeight
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
