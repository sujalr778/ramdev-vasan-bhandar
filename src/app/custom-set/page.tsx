"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CustomSetPage() {
  const { addToCart } = useCart();
  const router = useRouter();

  // Selected items state
  const [selections, setSelections] = useState<{ [key: string]: any }>({
    kadai: null,
    tawa: null,
    pan: null
  });

  // Mock DB for builder
  const options = {
    kadai: [
      { id: "k1", name: "Triply Stainless Steel Kadai (3L)", price: 2499, image: "/product-kadai.png" },
      { id: "k2", name: "Hard Anodized Kadai (4L)", price: 1899, image: "/product-kadai.png" }
    ],
    tawa: [
      { id: "t1", name: "Pre-seasoned Cast Iron Tawa", price: 1499, image: "/product-fry-pan.png" },
      { id: "t2", name: "Non-stick Dosa Tawa", price: 1299, image: "/product-fry-pan.png" }
    ],
    pan: [
      { id: "p1", name: "Triply Fry Pan (24cm)", price: 1799, image: "/product-fry-pan.png" },
      { id: "p2", name: "Hard Anodized Deep Fry Pan", price: 1599, image: "/product-fry-pan.png" }
    ]
  };

  const handleSelect = (category: string, item: any) => {
    setSelections(prev => ({ ...prev, [category]: item }));
  };

  const totalValue = Object.values(selections).reduce((acc: number, item: any) => acc + (item ? item.price : 0), 0);
  
  // Rule: If all 3 are selected, give 15% off. If 2 are selected, give 10% off.
  const selectedCount = Object.values(selections).filter(item => item !== null).length;
  let discountPercent = 0;
  if (selectedCount === 3) discountPercent = 0.15;
  else if (selectedCount === 2) discountPercent = 0.10;

  const discountAmount = Math.floor(totalValue * discountPercent);
  const finalPrice = totalValue - discountAmount;

  const handleAddToCart = () => {
    Object.values(selections).forEach(item => {
      if (item) {
        addToCart({ id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image });
      }
    });
    router.push("/cart");
  };

  return (
    <main className="container" style={{ padding: 'var(--spacing-2xl) 0', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="heading-primary">Build Your Own Kitchen Set</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Select your favorite Kadai, Tawa, and Pan. Buy 2 items to get 10% off, or complete the trio for 15% off!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--spacing-2xl)' }}>
        
        {/* Builder Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
          
          {/* Step 1: Kadai */}
          <section>
            <h2 className="heading-secondary">1. Choose a Kadai</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              {options.kadai.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleSelect('kadai', item)}
                  style={{ 
                    border: selections.kadai?.id === item.id ? '2px solid var(--primary)' : '1px solid var(--border)', 
                    borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', cursor: 'pointer',
                    background: selections.kadai?.id === item.id ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--card-bg)',
                    display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)'
                  }}
                >
                  <Image src={item.image} alt={item.name} width={80} height={80} style={{ objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: 'var(--muted)' }}>₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 2: Tawa */}
          <section>
            <h2 className="heading-secondary">2. Choose a Tawa</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              {options.tawa.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleSelect('tawa', item)}
                  style={{ 
                    border: selections.tawa?.id === item.id ? '2px solid var(--primary)' : '1px solid var(--border)', 
                    borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', cursor: 'pointer',
                    background: selections.tawa?.id === item.id ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--card-bg)',
                    display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)'
                  }}
                >
                  <Image src={item.image} alt={item.name} width={80} height={80} style={{ objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: 'var(--muted)' }}>₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 3: Pan */}
          <section>
            <h2 className="heading-secondary">3. Choose a Fry Pan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              {options.pan.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleSelect('pan', item)}
                  style={{ 
                    border: selections.pan?.id === item.id ? '2px solid var(--primary)' : '1px solid var(--border)', 
                    borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', cursor: 'pointer',
                    background: selections.pan?.id === item.id ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--card-bg)',
                    display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)'
                  }}
                >
                  <Image src={item.image} alt={item.name} width={80} height={80} style={{ objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: 'var(--muted)' }}>₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Summary Sidebar */}
        <div>
          <div style={{ background: 'var(--card-bg)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'sticky', top: '100px', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>Your Custom Set</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
              {Object.entries(selections).map(([key, item]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--muted)', width: '60px' }}>{key}</span>
                  {item ? (
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>{item.name}</span>
                  ) : (
                    <span style={{ color: 'var(--border)', fontStyle: 'italic', fontSize: '0.9rem' }}>Not selected</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <span>Total Value:</span>
                <span>₹{totalValue}</span>
              </div>
              {discountPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem', color: 'var(--success)' }}>
                  <span>Bundle Discount ({discountPercent * 100}%):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '1.25rem', fontWeight: 700 }}>
                <span>Final Price:</span>
                <span>₹{finalPrice}</span>
              </div>
            </div>

            <button 
              onClick={handleAddToCart} 
              disabled={selectedCount === 0}
              className="btn-primary" 
              style={{ width: '100%', fontSize: '1rem', padding: '12px', opacity: selectedCount === 0 ? 0.5 : 1 }}
            >
              Add Set to Cart
            </button>
            {selectedCount < 2 && (
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)', marginTop: '8px' }}>Select at least 2 items to unlock a discount.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
