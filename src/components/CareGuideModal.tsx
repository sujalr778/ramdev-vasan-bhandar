"use client";

import { useState } from "react";

export default function CareGuideModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"triply" | "castiron" | "hardanodized">("triply");

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "none",
          color: "var(--copper)",
          fontSize: "0.825rem",
          fontWeight: 600,
          textDecoration: "underline",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: 0
        }}
      >
        <span>📖 View Culinary Care & Seasoning Guide</span>
      </button>

      {open && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }} onClick={() => setOpen(false)}>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "2rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 600, color: "var(--foreground)" }}>
                Cookware Care & Maintenance
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            {/* Material Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem" }}>
              {[
                { id: "triply", label: "Triply Stainless Steel" },
                { id: "castiron", label: "Cast Iron (Tawa)" },
                { id: "hardanodized", label: "Hard Anodized" }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id as any)}
                  style={{
                    padding: "8px 12px",
                    background: "none",
                    border: "none",
                    borderBottom: tab === t.id ? "2px solid var(--copper)" : "2px solid transparent",
                    fontWeight: tab === t.id ? 700 : 500,
                    color: tab === t.id ? "var(--copper)" : "var(--muted)",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {tab === "triply" && (
              <div style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--foreground)" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>The Leidenfrost Effect (Zero Sticking):</h4>
                <p style={{ color: "var(--muted)", marginBottom: "12px" }}>
                  Preheat your triply pan on medium heat for 90 seconds. Sprinkle a drop of water: if it glides like a pearl, your pan is naturally non-stick! Add oil, then add food.
                </p>
                <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>Cleaning Stubborn Stains:</h4>
                <p style={{ color: "var(--muted)", marginBottom: "12px" }}>
                  Boil water with 1 tbsp baking soda and a squeeze of lemon or vinegar for 3 minutes. Burnt gravies will lift right off. Never use harsh steel wool on mirror surfaces.
                </p>
                <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>Induction Advice:</h4>
                <p style={{ color: "var(--muted)" }}>
                  Use medium heat settings (1000W–1200W). Triply conducts heat 3x faster than cast iron, so high heat is rarely needed.
                </p>
              </div>
            )}

            {tab === "castiron" && (
              <div style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--foreground)" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>Seasoning for Crispy Dosas:</h4>
                <p style={{ color: "var(--muted)", marginBottom: "12px" }}>
                  Wipe with mustard or sesame oil using an onion half. Heat until lightly smoking, then let cool. Repeat twice. Your tawa becomes ultra-smooth and naturally non-stick.
                </p>
                <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>Washing & Rust Prevention:</h4>
                <p style={{ color: "var(--muted)" }}>
                  Never soak cast iron in water or put it in the dishwasher. Wash with warm water, dry immediately on a hot burner, and wipe a drop of cooking oil before storing.
                </p>
              </div>
            )}

            {tab === "hardanodized" && (
              <div style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--foreground)" }}>
                <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>Durability & Care:</h4>
                <p style={{ color: "var(--muted)", marginBottom: "12px" }}>
                  Hard anodized aluminum is scratch-resistant and metal spoon safe. Use mild dishwashing soap and a soft sponge.
                </p>
                <h4 style={{ fontWeight: 700, marginBottom: "6px" }}>Temperature Care:</h4>
                <p style={{ color: "var(--muted)" }}>
                  Avoid thermal shock: do not plunge a piping hot pan into cold sink water. Let it cool naturally for 3 minutes first.
                </p>
              </div>
            )}

            <div style={{ marginTop: "2rem", textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  backgroundColor: "var(--charcoal)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 20px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

