import Image from "next/image";
import Link from "next/link";
import styles from "./Collections.module.css";

export const metadata = {
  title: "Curated Collections | EPICUREAN",
  description: "Discover our meticulously crafted lines, each designed to elevate your culinary journey with distinct materials and unwavering precision.",
};

const COLLECTIONS = [
  {
    id: "masters-collection",
    title: "The Master's Collection",
    material: "5-PLY STAINLESS STEEL",
    description:
      "Uncompromising thermal conductivity meets enduring brilliance. The Master's Collection represents the pinnacle of modern culinary engineering, designed for absolute control and flawless execution in the hands of those who demand perfection.",
    image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=1200&auto=format&fit=crop",
    link: "/shop?category=Cookware",
    badge: "PROFESSIONAL GRADE",
    pillBadge: "THE COLLECTIONS ✦ CURATED SERIES",
    imageOnRight: true,
    buttonStyle: "solid",
  },
  {
    id: "heritage-series",
    title: "The Heritage Series",
    material: "SOLID COPPER CONDUCTION",
    description:
      "A tribute to classical French craftsmanship. The Heritage Series harnesses the unparalleled responsiveness of pure copper, offering an immediate connection between flame and flavor. A living patina that tells the story of every meal.",
    image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=1200&auto=format&fit=crop",
    link: "/shop?category=Heritage+Series",
    imageOnRight: false,
    buttonStyle: "outline",
  },
  {
    id: "forged-line",
    title: "The Forged Line",
    material: "SEASONED CARBON STEEL",
    description:
      "Born in fire, refined through use. The Forged Line marries the heat retention of cast iron with the agility of lighter materials. These pieces build a natural, evolving non-stick surface, becoming uniquely yours over decades of daily service.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
    link: "/shop?category=Forged+Line",
    imageOnRight: true,
    buttonStyle: "solid",
  },
];

export default function CollectionsPage() {
  return (
    <main className={styles.collectionsPage}>
      {/* Page Header */}
      <section className={styles.headerSection}>
        <div className="container">
          <h1 className={styles.pageTitle}>Curated Collections</h1>
          <p className={styles.pageSubtitle}>
            Discover our meticulously crafted lines, each designed to elevate your culinary journey with distinct materials and unwavering precision.
          </p>
        </div>
      </section>

      {/* Alternating Collection Showcases */}
      <div className="container">
        <div className={styles.collectionsList}>
          {COLLECTIONS.map((col) => (
            <div
              key={col.id}
              className={`${styles.collectionRow} ${col.imageOnRight ? styles.rowNormal : styles.rowReverse}`}
            >
              {/* Text Information Column */}
              <div className={styles.textColumn}>
                <h2 className={styles.collectionTitle}>{col.title}</h2>
                <div className={styles.materialSub}>{col.material}</div>
                <p className={styles.collectionDesc}>{col.description}</p>
                <div>
                  <Link
                    href={col.link}
                    className={col.buttonStyle === "solid" ? "btn-primary" : "btn-outline-luxury"}
                  >
                    Shop the Collection
                  </Link>
                </div>
              </div>

              {/* Visual Showcase Column */}
              <div className={styles.imageColumn}>
                <div className={styles.imageWrapper}>
                  {col.badge && (
                    <span className={styles.badgeGold}>{col.badge}</span>
                  )}
                  {col.pillBadge && (
                    <div className={styles.curatedPill}>{col.pillBadge}</div>
                  )}
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className={styles.collectionImage}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
