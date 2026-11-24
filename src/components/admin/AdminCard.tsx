import React from "react";

interface AdminCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  accentColor?: string;
  onClick?: () => void;
}

export default function AdminCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = "neutral",
  accentColor = "#B45309",
  onClick,
}: AdminCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)";
        }
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: accentColor }} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.025em" }}>
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: `${accentColor}15`,
              color: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#6B7280" }}>
          {trend && (
            <span
              style={{
                fontWeight: 600,
                color: trendType === "up" ? "#059669" : trendType === "down" ? "#DC2626" : "#6B7280",
              }}
            >
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}