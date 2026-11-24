"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface SlideCard {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  btnText: string;
  link: string;
  bgGradient: string;
}

const SLIDES: SlideCard[] = [
  {
    id: "cookware-sale",
    tag: "SIGNATURE COLLECTION",
    title: "Grand Cookware Sale",
    subtitle: "Upto 35% off on Traditional Thalis & Kadais",
    image: "/slider-festive.jpg",
    btnText: "Shop Special Offers →",
    link: "/shop",
    bgGradient: "linear-gradient(to top, rgba(146, 64, 14, 0.95) 0%, rgba(217, 119, 6, 0.4) 40%, rgba(0,0,0,0.2) 100%)"
  },
  {
    id: "bulk-gifting",
    tag: "HERITAGE SINCE 1998",
    title: "Bulk Gifting in Steel",
    subtitle: "25+ Years of Trust • Wedding & Corporate Suites",
    image: "/slider-gifting.jpg",
    btnText: "Enquire Now",
    link: "/b2b",
    bgGradient: "linear-gradient(to top, rgba(30, 41, 59, 0.95) 0%, rgba(71, 85, 105, 0.4) 40%, rgba(0,0,0,0.2) 100%)"
  },
  {
    id: "triply-platinum",
    tag: "3-PLY CLADDING TECH",
    title: "Triply Platinum Cookware",
    subtitle: "Zero Burning • 100% Food-Grade SS 304",
    image: "/kadhai.jpg",
    btnText: "Shop Best Sellers →",
    link: "/shop/apyel0p",
    bgGradient: "linear-gradient(to top, rgba(23, 24, 28, 0.95) 0%, rgba(45, 55, 72, 0.4) 40%, rgba(0,0,0,0.2) 100%)"
  },
  {
    id: "copper-heritage",
    tag: "AUTHENTIC ROYAL SERIES",
    title: "Copper Bottom & Handi Sets",
    subtitle: "Traditional Slow Cookware for Biryanis & Curries",
    image: "/copper_handi.jpg",
    btnText: "Explore Collection →",
    link: "/shop/s9vd77p",
    bgGradient: "linear-gradient(to top, rgba(120, 53, 15, 0.95) 0%, rgba(180, 83, 9, 0.4) 40%, rgba(0,0,0,0.2) 100%)"
  }
];

export default function VinodHeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance slides every 4.5 seconds
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const resetTimer = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    resetTimer();
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    resetTimer();
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section style={{ backgroundColor: "#ffffff", padding: "1.5rem 0 2.5rem 0", overflow: "hidden" }}>
      <div className="container" style={{ position: "relative" }}>
        
        {/* Carousel Viewport */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {/* Desktop Arrow Buttons */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            style={{
              position: "absolute",
              left: "-16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 30,
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "var(--foreground)"
            }}
            className="slider-arrow-btn"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            style={{
              position: "absolute",
              right: "-16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 30,
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "var(--foreground)"
            }}
            className="slider-arrow-btn"
          >
            ›
          </button>

          {/* Cards Track with Peek Effect */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              transition: "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
              transform: `translateX(calc(50% - ${currentIndex * 320 + 160}px))`,
              width: "100%",
              cursor: "grab"
            }}
            className="slider-track"
          >
            <style dangerouslySetInnerHTML={{__html: `
              @media (min-width: 900px) {
                .slider-track {
                  transform: translateX(calc(50% - ${currentIndex * 380 + 190}px)) !important;
                }
                .slide-card-item {
                  width: 360px !important;
                  height: 520px !important;
                }
              }
              @media (max-width: 600px) {
                .slider-arrow-btn {
                  display: none !important;
                }
              }
            `}} />

            {SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="slide-card-item"
                  style={{
                    flexShrink: 0,
                    width: "300px",
                    height: "480px",
                    borderRadius: "18px",
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: isActive ? "0 12px 30px rgba(0,0,0,0.2)" : "0 4px 14px rgba(0,0,0,0.08)",
                    opacity: isActive ? 1 : 0.65,
                    transform: isActive ? "scale(1)" : "scale(0.94)",
                    transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
                  }}
                >
                  {/* Card Background Image */}
                  <Image src={slide.image} alt={slide.title} fill style={{ objectFit: "cover" }} />

                  {/* Gradient Overlay */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: slide.bgGradient
                  }} />

                  {/* Card Inner Content */}
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    padding: "24px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    color: "#ffffff"
                  }}>
                    {/* Top Tag & Title */}
                    <div>
                      <span style={{
                        display: "inline-block",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        backgroundColor: "rgba(255,255,255,0.25)",
                        backdropFilter: "blur(6px)",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        marginBottom: "12px"
                      }}>
                        {slide.tag}
                      </span>
                      <h2 style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "clamp(1.6rem, 3.5vw, 2.1rem)",
                        fontWeight: 700,
                        lineHeight: 1.15,
                        marginBottom: "6px"
                      }}>
                        {slide.title}
                      </h2>
                      <p style={{
                        fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.9)",
                        lineHeight: 1.4
                      }}>
                        {slide.subtitle}
                      </p>
                    </div>

                    {/* Bottom Pill CTA Button */}
                    <div>
                      <Link
                        href={slide.link}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "center",
                          backgroundColor: "#ffffff",
                          color: "#111827",
                          padding: "12px 18px",
                          borderRadius: "9999px",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          letterSpacing: "0.02em",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                          textDecoration: "none"
                        }}
                      >
                        {slide.btnText}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "1.5rem" }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setCurrentIndex(i); resetTimer(); }}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === currentIndex ? "24px" : "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: i === currentIndex ? "#111827" : "#d1d5db",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </div>

      </div>

      {/* 2. Red Slab Discount Strip (As shown in Vinod Steel screenshot) */}
      <div style={{
        backgroundColor: "#b91c1c",
        color: "#ffffff",
        padding: "10px 16px",
        textAlign: "center",
        marginTop: "1.75rem",
        fontSize: "0.825rem",
        fontWeight: 700,
        letterSpacing: "0.03em"
      }}>
        <span>🎉 Additional 5% off on orders above ₹2,499</span>
        <span style={{ margin: "0 10px", opacity: 0.6 }}>•</span>
        <span>Additional 7% off on orders above ₹4,999</span>
        <span style={{ margin: "0 10px", opacity: 0.6 }}>•</span>
        <span style={{ color: "#fef08a" }}>Extra 10% off above ₹9,999</span>
      </div>

    </section>
  );
}
