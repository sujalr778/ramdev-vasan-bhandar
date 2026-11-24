"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary"
      style={{ padding: "8px 18px", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }}
    >
      🖨️ Print Invoice
    </button>
  );
}
