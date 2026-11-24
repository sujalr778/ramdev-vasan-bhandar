import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import KitchenHeroHotspots from "@/components/KitchenHeroHotspots";
import VinodHeroSlider from "@/components/VinodHeroSlider";
import ProductCard from "@/components/ProductCard";
import RecipeReels from "@/components/RecipeReels";
import { db } from "@/lib/db";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const res: any = await db.products.findMany();
  const allProducts = Array.isArray(res) ? res : (res.products || []);

  const categories = [
    { name: "Triply Kadai", image: "/kadhai.jpg", count: "3.5L & 5L", query: "Kadai" },
    { name: "Pressure Cooker", image: "/cooker.jpg", count: "3L & 5L Induction", query: "Pressure Cooker" },
    { name: "Fry & Sauté Pan", image: "/frypan.jpg", count: "Hard Anodized", query: "Fry Pan" },
    { name: "Cast Iron Tawa", image: "/tawa.jpg", count: "Pre-Seasoned", query: "Tawa" },
    { name: "Copper Handi", image: "/copper_handi.jpg", count: "Slow Cookware", query: "Handi" },
    { name: "Casserole / Pot", image: "/saucepot.jpg", count: "Triply Heavy Base", query: "Casserole" },
  ];

  return (
    <main className={styles.main}>
      {/* 1. Hero Section with Interactive Kitchen Hotspots */}
      <KitchenHeroHotspots />

      {/* 2. Vinod Steel Multi-Card Hero Sliding Carousel */}
      <VinodHeroSlider />

      {/* 3. Trust USP Bar */}
      <section className={styles.trustBar}>
        <div className="container">
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🛡️</div>
              <div>
                <div className={styles.trustTitle}>10-Year Guarantee</div>
                <div className={styles.trustDesc}>Engineered with heavy-gauge 3-ply steel</div>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>⚡</div>
              <div>
                <div className={styles.trustTitle}>Induction & Gas Safe</div>
                <div className={styles.trustDesc}>360° magnetic encapsulated base</div>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🚚</div>
              <div>
                <div className={styles.trustTitle}>Free Express Delivery</div>
                <div className={styles.trustDesc}>Across all 19,000+ Indian pincodes</div>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>🌿</div>
              <div>
                <div className={styles.trustTitle}>100% Non-Toxic (SS 304)</div>
                <div className={styles.trustDesc}>Zero chemical coating, 100% food-grade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trending Categories */}
      <section className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>CURATED COLLECTIONS</span>
            <h2 className={styles.sectionTitle}>Shop by Essential Category</h2>
            <p className={styles.sectionSubtitle}>
              From daily tadka to grand festive biryanis, explore cookware tailored for Indian cuisine.
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/shop?category=${encodeURIComponent(cat.query)}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryImageWrap}>
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className={styles.categoryImg}
                  />
                </div>
                <div className={styles.categoryName}>{cat.name}</div>
                <div className={styles.categorySub}>{cat.count}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best Sellers & Trending Products */}
      <section className={styles.bestSellersSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>CHEF RECOMMENDED</span>
            <h2 className={styles.sectionTitle}>Best Sellers & Trending Now</h2>
            <p className={styles.sectionSubtitle}>
              Our most-loved heavy-bottom pots and pans, trusted by thousands of Indian households.
            </p>
          </div>

          <div className={styles.productGrid}>
            {allProducts.slice(0, 8).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
            <Link
              href="/shop"
              style={{
                display: "inline-block",
                padding: "12px 32px",
                border: "1.5px solid var(--charcoal)",
                color: "var(--charcoal)",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                borderRadius: "4px",
                textTransform: "uppercase"
              }}
            >
              View All Cookware ({allProducts.length} Items) →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Anatomy of Triply (Craftsmanship & Engineering) */}
      <section className={styles.triplySection}>
        <div className="container">
          <div className={styles.triplyGrid}>
            <div>
              <span style={{ color: "#e59866", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                THE SCIENCE OF COOKING
              </span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", margin: "10px 0 16px 0", lineHeight: 1.2 }}>
                Why Indian Kitchens Need 3-Ply Bonded Steel
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "24px" }}>
                Traditional aluminum leaches into acidic curries (tomatoes, tamarind, yogurt). Thin stainless steel causes burning and hot spots. Our Triply technology fuses the best of both worlds.
              </p>

              <div className={styles.triplyLayerCard}>
                <div className={styles.layerNum}>LAYER 01 • INTERIOR</div>
                <div className={styles.layerTitle}>Food-Grade SS 304 (18/8)</div>
                <div className={styles.layerDesc}>
                  Completely non-reactive surface. Preserves nutritional value, natural colors, and flavor of curries and sabzis.
                </div>
              </div>

              <div className={styles.triplyLayerCard}>
                <div className={styles.layerNum}>LAYER 02 • CORE</div>
                <div className={styles.layerTitle}>Encapsulated Pure Aluminum</div>
                <div className={styles.layerDesc}>
                  Conducts heat 3x faster than steel, spreading warmth edge-to-edge with zero hot spots and 20% faster cooking.
                </div>
              </div>

              <div className={styles.triplyLayerCard}>
                <div className={styles.layerNum}>LAYER 03 • EXTERIOR</div>
                <div className={styles.layerTitle}>Heavy Magnetic SS 430</div>
                <div className={styles.layerDesc}>
                  Compatible with all induction cooktops, gas hobs, and electric stoves. Scratch-resistant mirror finish.
                </div>
              </div>
            </div>

            <div style={{ position: "relative", minHeight: "380px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
              <Image
                src="https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=1000&auto=format&fit=crop"
                alt="Triply Bonded Steel Cookware Craftsmanship"
                fill
                style={{ objectFit: "cover" }}
              />
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)"
              }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#ffffff", fontFamily: "var(--font-serif)" }}>
                  Crafted for a Lifetime of Cooking
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}>
                  Tested under intense flame and dishwasher cycles.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Smart Decision Tools (Interactive & Trending) */}
      <section className={styles.toolsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>SMART SHOPPING</span>
            <h2 className={styles.sectionTitle}>Interactive Kitchen Tools</h2>
            <p className={styles.sectionSubtitle}>
              Experience modern features designed to help you choose with confidence.
            </p>
          </div>

          <div className={styles.toolsGrid}>
            <div className={styles.toolCard}>
              <div className={styles.toolIcon}>🧭</div>
              <h3 className={styles.toolTitle}>AI Cookware Advisor</h3>
              <p className={styles.toolDesc}>
                Take our 30-second quiz to determine the exact size and pan type based on your family count and cooking habits.
              </p>
              <Link href="/advisor" className={styles.toolLink}>
                Launch Advisor Quiz <span>→</span>
              </Link>
            </div>

            <div className={styles.toolCard}>
              <div className={styles.toolIcon}>⚖️</div>
              <h3 className={styles.toolTitle}>Side-by-Side Comparison</h3>
              <p className={styles.toolDesc}>
                Compare volume, weight, material thickness, and warranty side-by-side to make the right choice.
              </p>
              <Link href="/compare" className={styles.toolLink}>
                Compare Models <span>→</span>
              </Link>
            </div>

            <div className={styles.toolCard}>
              <div className={styles.toolIcon}>🔄</div>
              <h3 className={styles.toolTitle}>Old Utensils Exchange</h3>
              <p className={styles.toolDesc}>
                Calculate instant exchange credit value for your old brass, bronze, and aluminum vessels toward new Triply cookware.
              </p>
              <Link href="/exchange" className={styles.toolLink}>
                Calculate Exchange Value <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Vertical Recipe & Cooking Sizzle Reels */}
      <RecipeReels />

      {/* 8. Verified Reviews & Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>CUSTOMER VOICES</span>
            <h2 className={styles.sectionTitle}>Loved in Over 15,000+ Indian Homes</h2>
            <p className={styles.sectionSubtitle}>
              Read authentic feedback from families and home chefs who upgraded to Ramdev Cookware.
            </p>
          </div>

          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>★★★★★</div>
              <p className={styles.testimonialText}>
                &ldquo;The 3.5L Triply Kadai is a game changer for making gravies and biryani. Halwa never sticks to the base and frying takes so much less oil!&rdquo;
              </p>
              <div className={styles.testimonialAuthor}>Pooja Sharma</div>
              <div className={styles.testimonialCity}>Verified Buyer • Mumbai</div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>★★★★★</div>
              <p className={styles.testimonialText}>
                &ldquo;Switched all our old aluminum cookers to the Stainless Steel 5L Pressure Cooker. Heats quickly on our induction cooktop and feels super sturdy.&rdquo;
              </p>
              <div className={styles.testimonialAuthor}>Vikramaditya Rao</div>
              <div className={styles.testimonialCity}>Verified Buyer • Bengaluru</div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>★★★★★</div>
              <p className={styles.testimonialText}>
                &ldquo;The Cast Iron Dosa Tawa gave us hotel-style crispy paper dosas on the very first try. Truly authentic craftsmanship and fast doorstep delivery.&rdquo;
              </p>
              <div className={styles.testimonialAuthor}>Kavita Patel</div>
              <div className={styles.testimonialCity}>Verified Buyer • Ahmedabad</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Floating WhatsApp Quick Order Button */}
      <a
        href="https://wa.me/919876543210?text=Hello%20Ramdev%20Cookware!%20I%20would%20like%20to%20inquire%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingWhatsapp}
        aria-label="Order or Chat on WhatsApp"
      >
        <span>💬</span>
        <span>Order on WhatsApp</span>
      </a>
    </main>
  );
}
