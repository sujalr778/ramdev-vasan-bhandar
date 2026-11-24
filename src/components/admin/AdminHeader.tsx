"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
}

export default function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ products: any[]; orders: any[]; customers: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setSearchResults(res.results);
          }
        })
        .catch(() => {})
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch notifications
  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadCount(res.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      {/* Left: Mobile Toggle & Branding */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle menu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
            backgroundColor: "#F9FAFB",
            cursor: "pointer",
          }}
          className="admin-mobile-toggle"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#B45309",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            R
          </div>
          <div>
            <span style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", display: "block", lineHeight: 1.1 }}>
              Ramdev Vasan Bhandar
            </span>
            <span style={{ fontSize: "0.7rem", color: "#B45309", fontWeight: 600, letterSpacing: "0.05em" }}>
              ADMIN PANEL
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Global Search */}
      <div style={{ flex: 1, maxWidth: "480px", margin: "0 24px", position: "relative" }} className="admin-search-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#F3F4F6",
            borderRadius: "8px",
            padding: "0 12px",
            border: "1px solid #E5E7EB",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchModal(true)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "none",
              backgroundColor: "transparent",
              fontSize: "0.85rem",
              outline: "none",
              color: "#111827",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setSearchResults(null); }}
              style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "14px" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Live Search Dropdown */}
        {showSearchModal && searchResults && (
          <div
            style={{
              position: "absolute",
              top: "44px",
              left: 0,
              right: 0,
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: "1px solid #E5E7EB",
              maxHeight: "380px",
              overflowY: "auto",
              zIndex: 50,
              padding: "8px 0",
            }}
          >
            {/* Products results */}
            {searchResults.products.length > 0 && (
              <div style={{ marginBottom: "8px" }}>
                <div style={{ padding: "4px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>
                  Products ({searchResults.products.length})
                </div>
                {searchResults.products.map((p) => (
                  <Link
                    key={p.id}
                    href="/admin/products"
                    onClick={() => setShowSearchModal(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 16px",
                      textDecoration: "none",
                      color: "#111827",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>📦</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{p.subtitle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Orders results */}
            {searchResults.orders.length > 0 && (
              <div style={{ marginBottom: "8px" }}>
                <div style={{ padding: "4px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>
                  Orders ({searchResults.orders.length})
                </div>
                {searchResults.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={o.link}
                    onClick={() => setShowSearchModal(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 16px",
                      textDecoration: "none",
                      color: "#111827",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>🛒</span>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{o.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{o.subtitle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Customers results */}
            {searchResults.customers.length > 0 && (
              <div>
                <div style={{ padding: "4px 16px", fontSize: "0.75rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>
                  Customers ({searchResults.customers.length})
                </div>
                {searchResults.customers.map((c) => (
                  <Link
                    key={c.id}
                    href="/admin/customers"
                    onClick={() => setShowSearchModal(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 16px",
                      textDecoration: "none",
                      color: "#111827",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>👥</span>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{c.subtitle}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {searchResults.products.length === 0 && searchResults.orders.length === 0 && searchResults.customers.length === 0 && (
              <div style={{ padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: "0.85rem" }}>
                No matching products, orders, or customers found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & Admin Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* View Customer Website */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
            backgroundColor: "#FFFFFF",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#4B5563",
            textDecoration: "none",
          }}
          className="admin-view-store-btn"
        >
          <span>Store</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>

        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            style={{
              position: "relative",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              backgroundColor: "#F9FAFB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "44px",
                right: 0,
                width: "320px",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                border: "1px solid #E5E7EB",
                zIndex: 60,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827" }}>Notifications ({notifications.length})</span>
                <Link href="/admin/notifications" onClick={() => setShowNotifications(false)} style={{ fontSize: "0.75rem", color: "#B45309", textDecoration: "none", fontWeight: 600 }}>
                  View All
                </Link>
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#9CA3AF", fontSize: "0.85rem" }}>
                    No alerts at this time.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || "/admin"}
                      onClick={() => setShowNotifications(false)}
                      style={{
                        display: "flex",
                        gap: "10px",
                        padding: "10px 16px",
                        borderBottom: "1px solid #F3F4F6",
                        textDecoration: "none",
                        color: "inherit",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>
                        {n.type === "new_order" ? "🔔" : n.type === "out_of_stock" ? "❌" : n.type === "low_stock" ? "⚠" : "💳"}
                      </span>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>{n.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{n.message}</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#FDE68A",
              color: "#92400E",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="admin-profile-info" style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>
              {session?.user?.name || "Admin"}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#6B7280" }}>Super Admin</span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Logout"
            style={{
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              padding: "6px",
              color: "#9CA3AF",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}