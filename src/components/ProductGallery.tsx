"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "@/app/shop/[id]/ProductDetail.module.css";

interface ProductGalleryProps {
  mainImage: string;
  images?: string[];
  productName: string;
  badge?: string;
}

export default function ProductGallery({ mainImage, images, productName, badge }: ProductGalleryProps) {
  // Default backup images to ensure 4 gallery items like Image 3
  const fallbackImages = [
    mainImage,
    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop"
  ];

  const allImages = (images && images.length >= 2) ? images : fallbackImages;
  const [selectedImage, setSelectedImage] = useState(allImages[0] || mainImage);

  return (
    <div className={styles.imageGallery}>
      <div className={styles.mainImageWrapper}>
        {badge && (
          <span className={styles.badgeGold}>{badge}</span>
        )}
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className={styles.mainImage}
          priority
        />
      </div>

      {/* Thumbnail Strip */}
      <div className={styles.thumbnailList}>
        {allImages.slice(0, 4).map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedImage(img)}
            className={`${styles.thumbnailWrapper} ${selectedImage === img ? styles.activeThumbnail : ""}`}
            aria-label={`View image ${i + 1} of ${productName}`}
          >
            <Image
              src={img}
              alt={`${productName} view ${i + 1}`}
              fill
              className={styles.thumbnail}
            />
            {i === 3 && (
              <div className={styles.videoOverlayIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.5)" stroke="white"></circle>
                  <polygon points="10 8 16 12 10 16 10 8" fill="white"></polygon>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
