import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "stock" | "general";
}

export default function StatusBadge({ status, type = "general" }: StatusBadgeProps) {
  const s = (status || "").toLowerCase().trim();

  let bg = "#F3F4F6";
  let text = "#374151";
  let border = "#E5E7EB";
  let label = status;

  if (type === "order" || type === "general") {
    switch (s) {
      case "pending":
        bg = "#FEF3C7"; text = "#92400E"; border = "#FDE68A"; label = "Pending"; break;
      case "confirmed":
      case "processing":
        bg = "#DBEAFE"; text = "#1E40AF"; border = "#BFDBFE"; label = "Processing"; break;
      case "shipped":
        bg = "#E0E7FF"; text = "#3730A3"; border = "#C7D2FE"; label = "Shipped"; break;
      case "out_for_delivery":
        bg = "#EDE9FE"; text = "#5B21B6"; border = "#DDD6FE"; label = "Out for Delivery"; break;
      case "delivered":
        bg = "#D1FAE5"; text = "#065F46"; border = "#A7F3D0"; label = "Delivered"; break;
      case "cancelled":
        bg = "#FEE2E2"; text = "#991B1B"; border = "#FECACA"; label = "Cancelled"; break;
    }
  }

  if (type === "payment") {
    switch (s) {
      case "paid":
        bg = "#D1FAE5"; text = "#065F46"; border = "#A7F3D0"; label = "Paid"; break;
      case "pending":
      case "cod_pending":
        bg = "#FEF3C7"; text = "#92400E"; border = "#FDE68A"; label = s === "cod_pending" ? "COD Pending" : "Pending"; break;
      case "failed":
        bg = "#FEE2E2"; text = "#991B1B"; border = "#FECACA"; label = "Failed"; break;
      case "refunded":
        bg = "#F3E8FF"; text = "#6B21A8"; border = "#E9D5FF"; label = "Refunded"; break;
    }
  }

  if (type === "stock") {
    switch (s) {
      case "in stock":
      case "in_stock":
        bg = "#D1FAE5"; text = "#065F46"; border = "#A7F3D0"; label = "In Stock"; break;
      case "low stock":
      case "low_stock":
        bg = "#FEF3C7"; text = "#92400E"; border = "#FDE68A"; label = "Low Stock"; break;
      case "out of stock":
      case "out_of_stock":
        bg = "#FEE2E2"; text = "#991B1B"; border = "#FECACA"; label = "Out of Stock"; break;
    }
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}