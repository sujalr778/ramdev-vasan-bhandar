"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './KitchenHeroHotspots.module.css';

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  category: string;
  price: string;
  image: string;
  link: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'copper-handi',
    x: 64,
    y: 22,
    title: 'Copper Bottom Handi Set',
    category: 'Traditional Heavy Gauge',
    price: '₹2,199',
    image: '/copper_handi.jpg',
    link: '/shop/s9vd77p',
  },
  {
    id: 'triply-kadai',
    x: 48,
    y: 46,
    title: 'Triply Stainless Steel Kadai',
    category: '3.5L with Steel Lid',
    price: '₹2,499',
    image: '/kadhai.jpg',
    link: '/shop/apyel0p',
  },
  {
    id: 'pressure-cooker',
    x: 30,
    y: 36,
    title: 'Stainless Steel Pressure Cooker',
    category: '5L Heavy Induction Base',
    price: '₹3,499',
    image: '/cooker.jpg',
    link: '/shop/wizclst',
  },
  {
    id: 'fry-pan',
    x: 68,
    y: 54,
    title: 'Hard Anodized Deep Fry Pan',
    category: '2.5L Scratch Resistant',
    price: '₹1,899',
    image: '/frypan.jpg',
    link: '/shop/pp1t54a',
  },
];

export default function KitchenHeroHotspots() {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  return (
    <div className={styles.heroWrapper}>
      {/* Background Hero Kitchen Image */}
      <div className={styles.imageContainer}>
        <Image
          src="/hero-kitchen.jpg"
          alt="Ramdev Cookware Collection"
          fill
          priority
          className={styles.heroBgImage}
          onClick={() => setActiveHotspot(null)}
        />
        <div className={styles.vignetteOverlay}></div>

        {/* Hero Luxury Overlay Content */}
        <div style={{
          position: "absolute",
          top: "14%",
          left: "5%",
          maxWidth: "540px",
          zIndex: 10,
          color: "#ffffff",
          textShadow: "0 2px 10px rgba(0,0,0,0.5)"
        }}>
          <span style={{
            display: "inline-block",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            backgroundColor: "rgba(185, 107, 52, 0.9)",
            color: "#ffffff",
            padding: "6px 14px",
            borderRadius: "9999px",
            marginBottom: "14px"
          }}>
            TRI-PLY CRAFTSMANSHIP • 10-YEAR GUARANTEE
          </span>
          <h1 style={{
            fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            lineHeight: 1.15,
            marginBottom: "12px",
            letterSpacing: "-0.01em"
          }}>
            Mastering the Heat of Modern Indian Kitchens.
          </h1>
          <p style={{
            fontSize: "clamp(0.9rem, 1.8vw, 1.05rem)",
            lineHeight: 1.6,
            marginBottom: "24px",
            color: "rgba(255,255,255,0.92)"
          }}>
            Engineered with 3-layer bonded surgical steel for zero burning, zero hot spots, and authentic Indian flavors.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/shop"
              style={{
                backgroundColor: "#ffffff",
                color: "#141518",
                fontWeight: 600,
                fontSize: "0.875rem",
                padding: "12px 24px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
              }}
            >
              Shop Best Sellers <span>→</span>
            </Link>
            <Link
              href="/advisor"
              style={{
                backgroundColor: "rgba(20, 21, 24, 0.65)",
                backdropFilter: "blur(8px)",
                color: "#ffffff",
                fontWeight: 500,
                fontSize: "0.875rem",
                padding: "12px 20px",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
            >
              Cookware Advisor Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Pulsing Hotspot Pins */}
      {HOTSPOTS.map((hotspot) => {
        const isActive = activeHotspot?.id === hotspot.id;
        return (
          <div
            key={hotspot.id}
            className={styles.hotspotContainer}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          >
            <button
              type="button"
              className={`${styles.hotspotBtn} ${isActive ? styles.hotspotBtnActive : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(isActive ? null : hotspot);
              }}
              aria-label={`Explore ${hotspot.title}`}
            >
              <span className={styles.hotspotCore}></span>
              <span className={styles.hotspotPulse}></span>
            </button>

            {/* Hotspot Popover Card */}
            {isActive && (
              <div className={styles.popoverCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.popoverThumb}>
                  <Image
                    src={hotspot.image}
                    alt={hotspot.title}
                    fill
                    className={styles.thumbImg}
                  />
                </div>
                <div className={styles.popoverInfo}>
                  <div className={styles.popoverCategory}>{hotspot.category}</div>
                  <h4 className={styles.popoverTitle}>{hotspot.title}</h4>
                  <div className={styles.popoverPrice} style={{ color: "var(--copper)", fontWeight: 700 }}>
                    {hotspot.price}
                  </div>
                  <Link href={hotspot.link} className={styles.popoverLink}>
                    View Details <span>→</span>
                  </Link>
                </div>
                <button
                  className={styles.popoverClose}
                  onClick={() => setActiveHotspot(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom Floating Exploration Pill */}
      <div className={styles.bottomPillWrapper}>
        <button
          type="button"
          className={styles.explorePill}
          onClick={() => {
            setActiveHotspot(activeHotspot ? null : HOTSPOTS[0]);
          }}
        >
          📍 Tap hotspots on the kitchen to inspect cookware
        </button>
      </div>
    </div>
  );
}
