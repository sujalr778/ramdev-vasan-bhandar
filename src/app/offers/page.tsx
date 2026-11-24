import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css";

export default function OffersPage() {
  return (
    <main className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
      <h1 className="heading-primary" style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>Special Offers & Bundles</h1>
      <p className="text-muted" style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)', maxWidth: '600px', margin: '0 auto var(--spacing-2xl)' }}>
        Upgrade your kitchen with our curated bundles and limited-time discounts. High-quality cookware at unbeatable prices.
      </p>
      
      <div className={styles.productGrid}>
        {/* Offer 1 */}
        <div className={styles.productCard} style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
              <Image src="/product-cookware-set.png" alt="Starter Bundle" fill style={{ objectFit: 'contain', padding: 'var(--spacing-xl)' }} />
              <span className={styles.productBadge} style={{ top: '1rem', left: '1rem' }}>Save 25%</span>
            </div>
            <div style={{ flex: 1, padding: 'var(--spacing-2xl)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 className="heading-secondary">The Essential Starter Bundle</h2>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Includes our best-selling Triply Kadai, Hard Anodized Fry Pan, and Cast Iron Tawa. Everything you need to start cooking like a pro.</p>
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <span className={styles.price} style={{ fontSize: '2rem' }}>₹4,999</span>
                <span className={styles.originalPrice} style={{ marginLeft: 'var(--spacing-sm)', fontSize: '1.25rem' }}>₹6,797</span>
              </div>
              <Link href="/shop" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Shop Bundle</Link>
            </div>
          </div>
        </div>

        {/* Offer 2 */}
        <div className={styles.productCard}>
          <div className={styles.productImageWrapper}>
            <span className={styles.productBadge}>Buy 1 Get 1 50% Off</span>
            <Image src="/product-fry-pan.png" alt="Fry Pans" width={300} height={300} className={styles.productImage} />
          </div>
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>Non-Stick Fry Pan Duo</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>Perfect for everyday cooking.</p>
            <div className={styles.productPriceRow}>
              <div><span className={styles.price}>₹2,849</span></div>
              <Link href="/shop" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>View Offer</Link>
            </div>
          </div>
        </div>

        {/* Offer 3 */}
        <div className={styles.productCard}>
          <div className={styles.productImageWrapper}>
            <span className={styles.productBadge}>Clearance</span>
            <Image src="/product-pressure-cooker.png" alt="Pressure Cookers" width={300} height={300} className={styles.productImage} />
          </div>
          <div className={styles.productInfo}>
            <h3 className={styles.productName}>Pressure Cooker Upgrade</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>Exchange your old cooker and get flat 30% off.</p>
            <div className={styles.productPriceRow}>
              <div><span className={styles.price}>From ₹2,449</span></div>
              <Link href="/shop" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
