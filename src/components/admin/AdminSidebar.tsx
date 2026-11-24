"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    {
      label: "Products",
      href: "/admin/products",
      icon: "📦",
      subItems: [
        { label: "All Products", href: "/admin/products" },
        { label: "Add Product", href: "/admin/products/add" },
        { label: "Categories", href: "/admin/products/categories" },
        { label: "Reviews", href: "/admin/products/reviews" },
      ],
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: "🛒",
      subItems: [
        { label: "All Orders", href: "/admin/orders" },
        { label: "Pending", href: "/admin/orders?status=pending" },
        { label: "Processing", href: "/admin/orders?status=processing" },
        { label: "Shipped", href: "/admin/orders?status=shipped" },
        { label: "Delivered", href: "/admin/orders?status=delivered" },
        { label: "Cancelled", href: "/admin/orders?status=cancelled" },
      ],
    },
    { label: "Inventory", href: "/admin/inventory", icon: "📋" },
    { label: "Customers", href: "/admin/customers", icon: "👥" },
    { label: "Payments", href: "/admin/payments", icon: "💳" },
    { label: "Coupons", href: "/admin/coupons", icon: "🏷" },
    { label: "Offers", href: "/admin/offers", icon: "✨" },
    { label: "Delivery", href: "/admin/delivery", icon: "🚚" },
    { label: "Reports", href: "/admin/reports", icon: "📈" },
    { label: "Website", href: "/admin/website", icon: "🌐" },
    { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
    { label: "Settings", href: "/admin/settings", icon: "⚙" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
          className="admin-mobile-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#1F2937",
          color: "#F3F4F6",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: "64px",
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          zIndex: 45,
          transition: "transform 0.3s ease",
        }}
        className={`admin-sidebar ${mobileOpen ? "open" : ""}`}
      >
        {/* Navigation list */}
        <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={onCloseMobile}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: active ? 700 : 500,
                    textDecoration: "none",
                    color: active ? "#FFFFFF" : "#9CA3AF",
                    backgroundColor: active ? "#B45309" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "#374151";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#9CA3AF";
                    }
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>

                {/* Sub-items (for Products & Orders) */}
                {item.subItems && active && (
                  <div style={{ marginLeft: "36px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={onCloseMobile}
                        style={{
                          padding: "6px 10px",
                          fontSize: "0.8rem",
                          borderRadius: "6px",
                          textDecoration: "none",
                          color: pathname === sub.href ? "#FCD34D" : "#9CA3AF",
                          fontWeight: pathname === sub.href ? 600 : 400,
                        }}
                      >
                        • {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid #374151", fontSize: "0.75rem", color: "#6B7280" }}>
          <div>Ramdev Vasan Bhandar</div>
          <div>v2.0 Production Ready</div>
        </div>
      </aside>
    </>
  );
}