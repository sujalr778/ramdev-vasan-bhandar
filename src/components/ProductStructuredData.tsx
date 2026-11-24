interface ProductStructuredDataProps {
  product: {
    _id: string;
    name: string;
    image: string;
    description: string;
    category: string;
    price: number;
    originalPrice?: number;
    stock: number;
    rating?: number;
    reviews?: number;
    brand?: string;
    sku?: string;
  };
}

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ramdevvasanbhandar.com";
  const productUrl = `${baseUrl}/shop/${product._id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.image.startsWith("http") ? product.image : `${baseUrl}${product.image}`],
    "description": product.description,
    "sku": product.sku || `RVB-${product._id.substring(0, 8)}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Ramdev Vasan Bhandar"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Ramdev Vasan Bhandar"
      }
    },
    ...(product.reviews && product.reviews > 0
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating || 5,
            "reviewCount": product.reviews
          }
        }
      : {})
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": `${baseUrl}/shop`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.category,
        "item": `${baseUrl}/shop?category=${encodeURIComponent(product.category)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.name,
        "item": productUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
