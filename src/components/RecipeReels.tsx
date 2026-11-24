"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";

interface Reel {
  id: string;
  title: string;
  dish: string;
  chef: string;
  time: string;
  image: string;
  videoUrl: string;
  productName: string;
  productPrice: number;
  productLink: string;
  views: string;
}

const REELS: Reel[] = [
  {
    id: "reel-1",
    title: "Crispy Golden Masala Dosa with Batter Tips",
    dish: "Restaurant Dosa",
    chef: "CookingShooking",
    time: "2 mins",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/CCab5oh0ZOc?autoplay=1&mute=0&controls=1&playsinline=1",
    productName: "Cast Iron Dosa Tawa (10\")",
    productPrice: 1499,
    productLink: "/shop/sigmuh1",
    views: "42.8K views",
  },
  {
    id: "reel-2",
    title: "Lucknowi Dum Biryani with 3-Ply Aroma Lock",
    dish: "Dum Biryani",
    chef: "Chef Ranveer Brar",
    time: "45 mins",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/gYE9zOmJwsg?autoplay=1&mute=0&controls=1&playsinline=1",
    productName: "Triply Stainless Kadai (3.5L)",
    productPrice: 2499,
    productLink: "/shop/apyel0p",
    views: "89.1K views",
  },
  {
    id: "reel-3",
    title: "Dhaba Style Dal Fry & Dal Tadka in Cooker",
    dish: "Dal Tadka",
    chef: "Chef Ranveer Brar",
    time: "12 mins",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/3XTSCbZfEgM?autoplay=1&mute=0&controls=1&playsinline=1",
    productName: "SS Pressure Cooker (5L)",
    productPrice: 3499,
    productLink: "/shop/wizclst",
    views: "64.5K views",
  },
  {
    id: "reel-4",
    title: "Royal Shahi Paneer Gravy in Heavy Handi",
    dish: "Shahi Paneer",
    chef: "Chef Ranveer Brar",
    time: "25 mins",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/inVClSNYBQ4?autoplay=1&mute=0&controls=1&playsinline=1",
    productName: "Copper Bottom Handi Set",
    productPrice: 2199,
    productLink: "/shop/s9vd77p",
    views: "31.2K views",
  },
];

export default function RecipeReels() {
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "5rem 0", borderTop: "1px solid var(--border)" }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3rem auto" }}>
          <span style={{ fontSize: "0.725rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--copper)" }}>
            COOK WITH RAMDEV COOKWARE
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", fontWeight: 600, color: "var(--foreground)", margin: "8px 0" }}>
            Real Sizzle, Real Recipes
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Tap any reel below to watch live cooking in our heavy-gauge triply steel and pre-seasoned cast iron pans.
          </p>
        </div>

        {/* 4-Reels Vertical Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem"
        }}>
          {REELS.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveReel(reel)}
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "9 / 16",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 32px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
            >
              {/* Thumbnail */}
              <Image src={reel.image} alt={reel.title} fill style={{ objectFit: "cover" }} />
              
              {/* Gradient Overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)"
              }}></div>

              {/* Top View Count */}
              <div style={{ position: "absolute", top: 12, left: 12, zIndex: 5 }}>
                <span style={{
                  backgroundColor: "rgba(0,0,0,0.65)",
                  backdropFilter: "blur(6px)",
                  color: "#ffffff",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  👁️ {reel.views}
                </span>
              </div>

              {/* Pulsing Play Button */}
              <div style={{
                position: "absolute",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#111827",
                fontSize: "1.4rem",
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                paddingLeft: "3px"
              }}>
                ▶
              </div>

              {/* Bottom Reel Details */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px", zIndex: 5, color: "#ffffff" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {reel.dish} • {reel.time}
                </div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.3, margin: "4px 0 8px 0" }}>
                  {reel.title}
                </h3>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.75)", marginBottom: "10px" }}>
                  By {reel.chef}
                </div>

                <Link
                  href={reel.productLink}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.22)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "#ffffff",
                    fontSize: "0.75rem"
                  }}
                >
                  <span style={{ fontWeight: 600 }}>🍳 {reel.productName}</span>
                  <span style={{ fontWeight: 700, color: "#fef08a" }}>{formatINR(reel.productPrice)} →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Real Live Video Player Modal */}
        {activeReel && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(6px)",
              zIndex: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem"
            }}
            onClick={() => setActiveReel(null)}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "420px",
                borderRadius: "14px",
                overflow: "hidden",
                backgroundColor: "#111827",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Close */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                backgroundColor: "#1f2937",
                color: "#ffffff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1rem" }}>🎬</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{activeReel.dish} Cooking Video</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReel(null)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    color: "#ffffff",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Working Video Stream Iframe */}
              <div style={{ position: "relative", width: "100%", height: "420px", backgroundColor: "#000000" }}>
                <iframe
                  src={activeReel.videoUrl}
                  title={activeReel.title}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Bottom Action Footer */}
              <div style={{ padding: "16px", backgroundColor: "#111827", color: "#ffffff" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>
                  {activeReel.title}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", marginBottom: "12px" }}>
                  Cooked using {activeReel.productName} for fast, even heat retention.
                </p>

                <Link
                  href={activeReel.productLink}
                  onClick={() => setActiveReel(null)}
                  style={{
                    display: "block",
                    backgroundColor: "var(--copper)",
                    color: "#ffffff",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textDecoration: "none"
                  }}
                >
                  Shop {activeReel.productName} ({formatINR(activeReel.productPrice)}) →
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
