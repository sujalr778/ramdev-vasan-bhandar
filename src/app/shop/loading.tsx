import styles from "./Shop.module.css";
import productStyles from "../page.module.css";

export default function Loading() {
  return (
    <div className={`container ${styles.shopContainer}`}>
      {/* Sidebar Skeleton */}
      <aside className={styles.sidebar} style={{ opacity: 0.6 }}>
        <div style={{ height: "24px", width: "120px", background: "#e2e8f0", borderRadius: "4px", marginBottom: "1.5rem" }} />
        <div style={{ height: "180px", background: "#f1f5f9", borderRadius: "8px", marginBottom: "1.5rem" }} />
        <div style={{ height: "140px", background: "#f1f5f9", borderRadius: "8px" }} />
      </aside>

      {/* Main Grid Skeleton */}
      <main className={styles.mainContent}>
        <div className={styles.shopHeader}>
          <div style={{ height: "32px", width: "200px", background: "#e2e8f0", borderRadius: "4px" }} />
          <div style={{ height: "36px", width: "160px", background: "#e2e8f0", borderRadius: "4px" }} />
        </div>

        <div className={productStyles.productGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                height: "320px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div style={{ flex: 1, background: "#e2e8f0", borderRadius: "8px" }} />
              <div style={{ height: "20px", width: "70%", background: "#e2e8f0", borderRadius: "4px" }} />
              <div style={{ height: "16px", width: "40%", background: "#e2e8f0", borderRadius: "4px" }} />
              <div style={{ height: "36px", width: "100%", background: "#e2e8f0", borderRadius: "20px" }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
