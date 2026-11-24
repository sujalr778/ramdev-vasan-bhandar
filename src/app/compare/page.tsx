"use client";

import { useCompare } from "@/context/CompareContext";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareList.length === 0) {
    return (
      <main className="container" style={{ padding: 'var(--spacing-2xl) 0', textAlign: 'center', minHeight: '60vh' }}>
        <h1 className="heading-primary">Compare Products</h1>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-xl)' }}>You haven't added any products to compare yet.</p>
        <Link href="/shop" className="btn-primary">Browse Shop</Link>
      </main>
    );
  }

  // Predefined specs to compare if they exist on the product, or fallback
  const getSpec = (product: any, specName: string) => {
    // Simulated specs based on product category or name since our simple db doesn't have deep specs yet
    if (specName === "Material") {
      if (product.name.includes("Triply") || product.name.includes("Stainless")) return "Triply Stainless Steel";
      if (product.name.includes("Cast Iron")) return "Cast Iron";
      if (product.name.includes("Anodized")) return "Hard Anodized Aluminum";
      return "Premium Cookware Material";
    }
    if (specName === "Induction Safe") {
      if (product.name.includes("Cast Iron") || product.name.includes("Triply")) return "✅ Yes";
      return "❌ No";
    }
    if (specName === "Dishwasher Safe") {
      if (product.name.includes("Cast Iron") || product.name.includes("Anodized")) return "❌ Hand wash only";
      return "✅ Yes";
    }
    if (specName === "Best For") {
      if (product.category === "Kadai & Woks") return "Curries, Deep Frying, Stir-fry";
      if (product.category === "Tawa & Pans") return "Roti, Dosa, Shallow Frying";
      if (product.category === "Pressure Cookers") return "Rice, Dal, Fast Cooking";
      return "Everyday Cooking";
    }
    if (specName === "Capacity") {
      if (product.price > 2000) return "Large (4-6 People)";
      return "Medium (2-3 People)";
    }
    return "-";
  };

  const specs = ["Material", "Induction Safe", "Dishwasher Safe", "Best For", "Capacity"];

  return (
    <main className="container" style={{ padding: 'var(--spacing-2xl) 0', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--spacing-2xl)' }}>
        <div>
          <h1 className="heading-primary" style={{ marginBottom: 'var(--spacing-xs)' }}>Product Comparison</h1>
          <p className="text-muted">Comparing {compareList.length} products</p>
        </div>
        <button onClick={clearCompare} style={{ background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
          Clear All
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ width: '150px', padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--muted)' }}>
                Product
              </th>
              {compareList.map(product => (
                <th key={product._id} style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border)', textAlign: 'center', width: `${85 / compareList.length}%`, verticalAlign: 'top' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button 
                      onClick={() => removeFromCompare(product._id)}
                      style={{ position: 'absolute', top: -10, right: -10, background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                    <Image src={product.image} alt={product.name} width={150} height={150} style={{ objectFit: 'contain', marginBottom: 'var(--spacing-sm)' }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>{product.name}</h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>₹{product.price}</div>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '8px' }}
                    onClick={() => addToCart({ id: product._id, name: product.name, price: product.price, quantity: 1, image: product.image })}
                  >
                    Add to Cart
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specs.map((spec, index) => (
              <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: 'var(--spacing-lg) var(--spacing-md)', fontWeight: 600, color: 'var(--muted)' }}>
                  {spec}
                </td>
                {compareList.map(product => (
                  <td key={product._id} style={{ padding: 'var(--spacing-lg) var(--spacing-md)', textAlign: 'center' }}>
                    {getSpec(product, spec)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
