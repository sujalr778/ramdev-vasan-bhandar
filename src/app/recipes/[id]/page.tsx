"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const router = useRouter();

  // Simulated Recipe DB
  const recipes: any = {
    "chicken-biryani": {
      title: "Authentic Chicken Biryani",
      time: "1h 30m",
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop",
      desc: "A rich, flavorful, and aromatic dish perfectly cooked in a heavy-bottomed Handi. The thick base prevents the rice from burning during Dum.",
      ingredients: ["Basmati Rice", "Chicken (Bone-in)", "Yogurt", "Biryani Masala", "Saffron", "Ghee", "Onions"],
      tools: [
        { id: "handi-1", name: "Premium Triply Stainless Steel Handi (5L)", price: 2999, image: "/product-cookware-set.png" },
        { id: "spatula-1", name: "Wooden Spatula Set", price: 299, image: "/product-fry-pan.png" }
      ]
    },
    "masala-dosa": {
      title: "Crispy Masala Dosa",
      time: "45m",
      image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop",
      desc: "Golden crispy crepes made on a perfect cast-iron flat tawa for maximum heat retention. Spreading the batter is effortless.",
      ingredients: ["Dosa Batter", "Potatoes", "Onions", "Mustard Seeds", "Turmeric", "Ghee"],
      tools: [
        { id: "tawa-1", name: "Pre-seasoned Cast Iron Dosa Tawa (12 inch)", price: 1499, image: "/product-fry-pan.png" }
      ]
    },
    "paneer-butter-masala": {
      title: "Paneer Butter Masala",
      time: "40m",
      image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc3?q=80&w=1200&auto=format&fit=crop",
      desc: "Rich and creamy tomato gravy best simmered in a Triply Stainless Steel Kadai that ensures even heating and no sticking.",
      ingredients: ["Paneer", "Tomatoes", "Cashews", "Butter", "Cream", "Garam Masala"],
      tools: [
        { id: "kadai-1", name: "Triply Stainless Steel Kadai (3L)", price: 2499, image: "/product-kadai.png" },
        { id: "lid-24", name: "Glass Lid 24cm", price: 499, image: "/product-pressure-cooker.png" }
      ]
    }
  };

  const recipe = recipes[params.id];

  if (!recipe) {
    return (
      <main className="container" style={{ padding: 'var(--spacing-2xl) 0', textAlign: 'center' }}>
        <h2>Recipe not found</h2>
        <Link href="/recipes" className="btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>Back to Recipes</Link>
      </main>
    );
  }

  const bundlePrice = recipe.tools.reduce((acc: number, tool: any) => acc + tool.price, 0);
  const discount = Math.floor(bundlePrice * 0.1); // 10% off bundle
  const finalPrice = bundlePrice - discount;

  const handleAddBundle = () => {
    recipe.tools.forEach((tool: any) => {
      addToCart({ id: tool.id, name: tool.name, price: tool.price, quantity: 1, image: tool.image });
    });
    router.push("/cart");
  };

  return (
    <main>
      {/* Recipe Hero */}
      <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#f3f4f6' }}>
        <Image src={recipe.image} alt={recipe.title} fill style={{ objectFit: 'cover' }} unoptimized priority />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
        <div className="container" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: 'var(--spacing-2xl) var(--spacing-xl)', color: 'white' }}>
          <Link href="/recipes" style={{ color: '#d1d5db', textDecoration: 'underline', marginBottom: 'var(--spacing-sm)', display: 'inline-block' }}>&larr; Back to Recipes</Link>
          <h1 className="heading-primary" style={{ color: 'white', marginBottom: 'var(--spacing-xs)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{recipe.title}</h1>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9rem' }}>⏱ {recipe.time}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)', display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-2xl)' }}>
        
        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-2xl)' }}>
          <div>
            <h2 className="heading-secondary">About this Recipe</h2>
            <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 'var(--spacing-xl)' }}>
              {recipe.desc}
            </p>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>Ingredients</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
              {recipe.ingredients.map((ing: string, i: number) => (
                <li key={i} style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--primary)' }}>•</span> {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Shoppable Cookware Sidebar */}
          <div>
            <div style={{ background: 'var(--card-bg)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'sticky', top: '100px', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>The Perfect Tools</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 'var(--spacing-lg)' }}>Get the exact cookware needed for this recipe.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
                {recipe.tools.map((tool: any) => (
                  <div key={tool.id} style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', position: 'relative', background: '#f3f4f6', borderRadius: '8px' }}>
                      <Image src={tool.image} alt={tool.name} fill style={{ objectFit: 'contain', padding: '4px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>{tool.name}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px' }}>₹{tool.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  <span>Total Value:</span>
                  <span style={{ textDecoration: 'line-through' }}>₹{bundlePrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem', color: 'var(--success)' }}>
                  <span>Bundle Discount (10%):</span>
                  <span>-₹{discount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '1.25rem', fontWeight: 700 }}>
                  <span>Bundle Price:</span>
                  <span>₹{finalPrice}</span>
                </div>
              </div>

              <button onClick={handleAddBundle} className="btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                Shop Everything Needed
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
