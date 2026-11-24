"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    if (session?.user) {
      setLoading(true);
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then((data) => {
          setProducts(Array.isArray(data.products) ? data.products : []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [session]);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      }
    } catch (err) {
      alert("Failed to remove item from wishlist");
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <p className="text-muted">Loading your saved wishlist items...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <h1 className="heading-secondary">My Saved Wishlist</h1>
        <p className="text-muted" style={{ marginBottom: "1.5rem" }}>Please log in to access your saved utensils across devices.</p>
        <Link href="/login?callbackUrl=/account/wishlist" className="btn-primary">
          Log In Now
        </Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "2rem 1rem", maxWidth: "960px" }}>
      <div style={{ marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--muted)" }}>
        <Link href="/account">Account</Link> &gt; <span style={{ color: "var(--foreground)" }}>My Wishlist</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="heading-primary" style={{ marginBottom: "4px" }}>My Saved Wishlist</h1>
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>{products.length} item(s) saved</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ background: "white", padding: "3rem", borderRadius: "12px", border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❤️</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Your Wishlist is Empty</h2>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>Explore our premium utensil collection and save your favorite Kadais, Pans, and Pressure Cookers!</p>
          <Link href="/shop" className="btn-primary">
            Explore Shop Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {products.map((p) => {
            const isOutOfStock = p.stock !== undefined && p.stock <= 0;
            return (
              <div key={p._id} style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ width: "100%", height: "160px", position: "relative", marginBottom: "1rem" }}>
                    <Image src={p.image || "/product-kadai.png"} alt={p.name} fill style={{ objectFit: "contain" }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>{p.category}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "4px 0 8px 0" }}>
                    <Link href={`/shop/${p._id}`}>{p.name}</Link>
                  </h3>
                  <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--primary)", marginBottom: "1rem" }}>
                    ₹{p.price}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    disabled={isOutOfStock}
                    onClick={() => {
                      addToCart({
                        id: p._id,
                        name: p.name,
                        price: p.price,
                        quantity: 1,
                        image: p.image || "/product-kadai.png",
                        // category optional
                      });

                      alert("Added to Cart!");
                    }}
                    className="btn-primary"
                    style={{ width: "100%", padding: "8px", fontSize: "0.875rem" }}
                  >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart 🛒"}
                  </button>
                  <button
                    onClick={() => handleRemove(p._id)}
                    style={{ background: "none", border: "none", color: "var(--error)", fontSize: "0.8125rem", cursor: "pointer", textAlign: "center" }}
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
