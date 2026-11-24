"use client";

export default function CooktopCompatibility({ ovenSafe = "Up to 500°F (260°C)" }: { ovenSafe?: string }) {
  const compatibilities = [
    { name: "Induction", icon: "⚡", desc: "Full magnetic disc base" },
    { name: "Gas Stove", icon: "🔥", desc: "High flame & tadka safe" },
    { name: "Ceramic / Glass", icon: "🌀", desc: "Smooth flat scratch-free" },
    { name: "Oven & Grill", icon: "♨️", desc: ovenSafe },
    { name: "Dishwasher", icon: "🧼", desc: "Easy clean hygienic" },
  ];

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      padding: "1.25rem",
      marginTop: "1.5rem"
    }}>
      <span style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        color: "var(--copper)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        display: "block",
        marginBottom: "8px"
      }}>
        100% HEAT SOURCE COMPATIBILITY
      </span>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "10px"
      }}>
        {compatibilities.map((c) => (
          <div
            key={c.name}
            style={{
              backgroundColor: "#faf9f7",
              border: "1px solid #f0ede6",
              borderRadius: "4px",
              padding: "10px 8px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "1.3rem", marginBottom: "4px" }}>{c.icon}</div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--foreground)" }}>{c.name}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "2px", lineHeight: 1.2 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

