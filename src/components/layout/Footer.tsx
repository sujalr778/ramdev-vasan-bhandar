"use client";

import Link from 'next/link';
import { useState } from 'react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-container">
        {/* Main 4-Column Footer Grid */}
        <div className="footer-grid">
          {/* Brand & Statement */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-brand-logo" style={{ letterSpacing: "0.12em" }}>
              RAMDEV VASAN BHANDAR
            </Link>
            <p className="footer-tagline">
              Crafting premium triply cookware and heirloom kitchen essentials for authentic Indian cuisine since 1998.
            </p>
          </div>

          {/* Company Links */}
          <div className="footer-links-col">
            <h4 className="footer-column-heading">Company</h4>
            <ul>
              <li><Link href="/craftsmanship">Sustainability</Link></li>
              <li><Link href="/b2b">Professional Program</Link></li>
              <li><Link href="/collections">Curated Series</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-links-col">
            <h4 className="footer-column-heading">Support</h4>
            <ul>
              <li><Link href="/track" style={{ color: "var(--copper)", fontWeight: 600 }}>🚚 Track Order</Link></li>
              <li><Link href="/checkout">Shipping & Returns</Link></li>
              <li><Link href="/craftsmanship">Care Guide</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="footer-newsletter-col">
            <h4 className="footer-column-heading">Join The Table</h4>
            <p className="newsletter-subtitle">Receive seasonal recipes, collection previews, and private tasting invitations.</p>
            {subscribed ? (
              <p className="newsletter-success">Thank you for joining our culinary circle.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-submit">
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EPICUREAN COOKWARE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
