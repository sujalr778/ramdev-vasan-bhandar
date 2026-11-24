"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/?error=admin_required");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E5E7EB", borderTop: "3px solid #B45309", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px auto" }} />
          <p style={{ color: "#6B7280", fontSize: "0.9rem", fontWeight: 500 }}>Verifying Ramdev Vasan Bhandar Admin Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F9FAFB" }}>
      {/* Top sticky admin header */}
      <AdminHeader onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* Main Workspace with Sidebar & Content */}
      <div style={{ display: "flex", flex: 1 }}>
        <AdminSidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
        <main style={{ flex: 1, minWidth: 0, padding: "24px 28px", maxWidth: "1600px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}