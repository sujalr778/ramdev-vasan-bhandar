import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import styles from "./ProductDetail.module.css";
import { db } from "@/lib/db";
import { formatINR, calculateDiscount } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";
import ProductStructuredData from "@/components/ProductStructuredData";
import PincodeEstimator from "@/components/PincodeEstimator";
import ScarcityUrgency from "@/components/ScarcityUrgency";
import FrequentlyBoughtBundle from "@/components/FrequentlyBoughtBundle";
import StickyMobileBar from "@/components/StickyMobileBar";
import CooktopCompatibility from "@/components/CooktopCompatibility";
import FamilySizeCalculator from "@/components/FamilySizeCalculator";
import LaserEngravingOption from "@/components/LaserEngravingOption";
import CareGuideModal from "@/components/CareGuideModal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await params;
  const product = await db.products.findById(p.id);

  if (!product) {
    return { title: "Product Not Found | EPICUREAN" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://epicurean.com";
  const title = `${product.name} | EPICUREAN`;
  const description = product.description.substring(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/shop/${product._id}`,
      siteName: "EPICUREAN",
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const product = await db.products.findById(p.id);

  if (!product) {
    notFound();
  }

  // Fetch recommended items for "Frequently Bought Together"
  const res: any = await db.products.findMany();
  const allProducts = Array.isArray(res) ? res : (res.products || []);
  const frequentlyBought = allProducts
    .filter((item: any) => item._id !== product._id)
    .slice(0, 3);

  return (
    <div className={styles.pdpWrapper}>
      <ProductStructuredData product={product} />

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbDivider}>›</span>
          <Link href="/shop">Cookware</Link>
          <span className={styles.breadcrumbDivider}>›</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>
            {product.category === 'Cookware' ? 'Sauté Pans' : product.category}
          </Link>
          <span className={styles.breadcrumbDivider}>›</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        {/* Product Top Grid */}
        <div className={styles.pdpTopGrid}>
          {/* Gallery */}
          <ProductGallery
            mainImage={product.image}
            images={product.images}
            productName={product.name}
            badge={product.badge}
          />

          {/* Product Right Information */}
          <div className={styles.productDetails}>
            <h1 className={styles.title}>{product.name}</h1>
            <div className={styles.priceRow} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span className={styles.currentPrice} style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--foreground)" }}>
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span style={{ fontSize: "1.1rem", color: "var(--muted)", textDecoration: "line-through" }}>
                    {formatINR(product.originalPrice)}
                  </span>
                  <span style={{
                    backgroundColor: "#b91c1c",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "4px"
                  }}>
                    {calculateDiscount(product.originalPrice, product.price)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Live Scarcity & Viewing Ticker */}
            <ScarcityUrgency stock={product.stock} />

            <p className={styles.description}>{product.description}</p>

            {/* Family Size Capacity Guide */}
            <FamilySizeCalculator currentCapacity={product.capacity} />

            {/* Capacity Selector & Add To Cart */}
            <AddToCartButton product={product} />

            {/* Gift Laser Engraving Option */}
            <LaserEngravingOption />

            {/* Live Pincode Delivery Estimator */}
            <PincodeEstimator />

            {/* Culinary Care & Seasoning Guide Trigger */}
            <CareGuideModal />
          </div>
        </div>

        {/* Heat Source Compatibility Matrix */}
        <CooktopCompatibility ovenSafe={product.ovenSafe} />

        {/* Specifications & In The Box Section */}
        <div className={styles.specsSection}>
          <div className={styles.specCard}>
            <h3 className={styles.specCardTitle}>Technical Specifications</h3>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>MATERIAL</span>
                <span className={styles.specVal}>
                  {product.material || "18/10 Stainless Steel interior, Aluminum core, Magnetic Stainless exterior"}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>COMPATIBILITY</span>
                <span className={styles.specVal}>
                  {product.compatibility || "Induction, Gas, Electric, Halogen"}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>OVEN SAFE</span>
                <span className={styles.specVal}>
                  {product.ovenSafe || "Up to 600°F (315°C)"}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>CARE</span>
                <span className={styles.specVal}>
                  {product.care || "Dishwasher safe, hand wash recommended"}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>DIMENSIONS (3.5 QT)</span>
                <span className={styles.specVal}>
                  {product.dimensions || '10.5" Diameter, 2.75" Depth, 20" Length (with handle)'}
                </span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>WEIGHT</span>
                <span className={styles.specVal}>
                  {product.weight || "4.2 lbs (with lid)"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.specCard}>
            <h3 className={styles.specCardTitle}>In The Box</h3>
            <div className={styles.inTheBoxList}>
              <div className={styles.inTheBoxItem}>
                <span className={styles.inTheBoxIcon}>🍳</span>
                <span className={styles.inTheBoxText}>1x {product.name}</span>
              </div>
              <div className={styles.inTheBoxItem}>
                <span className={styles.inTheBoxIcon}>🍲</span>
                <span className={styles.inTheBoxText}>1x Tight-fitting Stainless Steel Lid</span>
              </div>
              <div className={styles.inTheBoxItem}>
                <span className={styles.inTheBoxIcon}>📖</span>
                <span className={styles.inTheBoxText}>Care & Use Guide</span>
              </div>
              <div className={styles.inTheBoxItem}>
                <span className={styles.inTheBoxIcon}>🛡️</span>
                <span className={styles.inTheBoxText}>Lifetime Warranty Registration Card</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Split Banner ("Precision in Every Layer") */}
      <section className={styles.craftsmanshipBanner}>
        <div className={styles.bannerImgWrapper}>
          <Image
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1800&auto=format&fit=crop"
            alt="Chef Cooking with Flame"
            fill
            className={styles.bannerImg}
          />
        </div>
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div className={styles.bannerCard}>
            <h2 className={styles.bannerCardTitle}>Precision in Every Layer</h2>
            <p className={styles.bannerCardDesc}>
              Our proprietary tri-ply cladding bonds an incredibly responsive aluminum core between layers of durable stainless steel. The result is unparalleled heat control, eliminating hot spots and ensuring a perfect sear every time.
            </p>
            <Link href="/craftsmanship" className={styles.bannerLink}>
              EXPLORE OUR CRAFTSMANSHIP <span>—</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 1-Click Frequently Bought Together Smart Bundle */}
      <div className="container">
        <FrequentlyBoughtBundle mainProduct={product} bundleProducts={frequentlyBought} />
      </div>

      {/* Customer Reviews Section */}
      <div className="container" style={{ paddingBottom: "4rem" }}>
        <ProductReviews productId={product._id} />
      </div>

      {/* Sticky Bottom Buy Bar on Mobile */}
      <StickyMobileBar product={product} />
    </div>
  );
}
