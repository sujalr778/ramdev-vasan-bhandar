"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "80vh", padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "1080px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem", fontWeight: 500, marginBottom: "2.5rem", color: "var(--foreground)" }}>
          Shopping Bag
        </h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#ffffff", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", marginBottom: "0.75rem" }}>Your Bag is Empty</h3>
            <p className="text-muted" style={{ marginBottom: "2rem", fontSize: "0.875rem" }}>
              Explore our curated collections of artisanal cookware.
            </p>
            <Link href="/shop" className="btn-primary">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }} className="cart-grid">
            <style dangerouslySetInnerHTML={{__html: `
              @media (min-width: 860px) {
                .cart-grid { grid-template-columns: 1.6fr 1fr !important; }
              }
            `}} />

            {/* Cart Items */}
            <div style={{ background: "#ffffff", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1.75rem" }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "1.25rem", padding: "1.5rem 0", borderBottom: "1px solid var(--border-light)", alignItems: "center" }}>
                  <div style={{ width: "90px", height: "90px", position: "relative", backgroundColor: "#f7f6f2", flexShrink: 0 }}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "1.05rem", marginBottom: "4px" }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--copper)", fontWeight: 600, marginBottom: "1rem" }}>
                      {formatINR(item.price)}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: "4px 10px", fontSize: "0.875rem" }}
                        >
                          –
                        </button>
                        <span style={{ padding: "0 10px", fontSize: "0.8125rem", fontWeight: 600 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: "4px 10px", fontSize: "0.875rem" }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ color: "var(--muted)", fontSize: "0.75rem", textDecoration: "underline" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--foreground)" }}>
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div style={{ backgroundColor: "#ffffff", padding: "2rem", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.45rem", fontWeight: 500, marginBottom: "1.5rem" }}>
                  Summary
                </h2>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.85rem", fontSize: "0.8125rem" }}>
                  <span className="text-muted">Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{formatINR(cartTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", fontSize: "0.8125rem" }}>
                  <span className="text-muted">Shipping</span>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>FREE (Complimentary)</span>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "1.25rem" }}>
                  <span style={{ fontFamily: "var(--font-serif)" }}>Total</span>
                  <span style={{ color: "var(--copper)" }}>{formatINR(cartTotal)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="btn-copper"
                  style={{ display: "flex", width: "100%", textAlign: "center", justifyContent: "center" }}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
