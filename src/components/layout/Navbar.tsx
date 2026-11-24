"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCompare } from '@/context/CompareContext';
import { useCart } from '@/context/CartContext';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import './Navbar.css';

export default function Navbar() {
  const { data: session } = useSession();
  const { compareList } = useCompare();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-announcement-bar">
        <span>
          ✨ Festive Special: Use code <strong>RAMDEV500</strong> for ₹500 OFF on orders above ₹2,999 • Free Pan-India Delivery • 10-Year Guarantee
        </span>
      </div>

      <header className="navbar">
        <div className="navbar-container">
          {/* Left Navigation Links */}
          <nav className="nav-links">
            <Link href="/shop" className={`nav-link ${pathname === '/shop' ? 'active' : ''}`}>Catalog</Link>
            <Link href="/collections" className={`nav-link ${pathname === '/collections' ? 'active' : ''}`}>Collections</Link>
            <Link href="/craftsmanship" className={`nav-link ${pathname === '/craftsmanship' ? 'active' : ''}`}>Craftsmanship</Link>
            <Link href="/track" className={`nav-link ${pathname === '/track' ? 'active' : ''}`}>Track Order</Link>
            <Link href="/recipes" className={`nav-link ${pathname === '/recipes' ? 'active' : ''}`}>Journal</Link>
            <Link href="/b2b" className={`nav-link ${pathname === '/b2b' ? 'active' : ''}`}>B2B & Bulk</Link>
          </nav>

          {/* Center Brand Logo */}
          <div className="navbar-brand">
            <Link href="/" className="epicurean-logo" onClick={closeMenu}>
              <span className="logo-main">RAMDEV</span>
              <span className="logo-sub">VASAN BHANDAR</span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="nav-actions">
            {/* Visual Cookware Photo Scanner */}
            <Link
              href="/visual-search"
              className="icon-btn"
              aria-label="Cookware Photo Scanner"
              title="Snap & Find Cookware Scanner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </Link>

            <button 
              className="icon-btn search-toggle-btn" 
              aria-label="Search" 
              title="Search Cookware"
              onClick={() => setShowSearchModal(!showSearchModal)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* Compare Counter */}
            <Link href="/compare" className="icon-btn" aria-label="Compare Products" title="Compare Models">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5"></path>
                <path d="M4 20L21 3"></path>
                <path d="M21 16v5h-5"></path>
                <path d="M15 15l6 6"></path>
                <path d="M4 4l5 5"></path>
              </svg>
              {compareList.length > 0 && (
                <span className="cart-badge" style={{ backgroundColor: "var(--charcoal)" }}>{compareList.length}</span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="icon-btn cart-btn" aria-label="Cart" title="Shopping Bag">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>

            {/* Account Icon */}
            <Link href={session ? "/account" : "/login"} className="icon-btn" aria-label="Account" title="User Account">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button className="icon-btn mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
                ) : (
                  <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Slide-Down Quick Search Drawer */}
        {showSearchModal && (
          <div className="search-drawer">
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Suspense fallback={null}>
                  <SearchAutocomplete />
                </Suspense>
              </div>
              <button className="close-search-btn" onClick={() => setShowSearchModal(false)}>✕</button>
            </div>
          </div>
        )}

        {/* Mobile Nav Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-overlay">
            <div className="mobile-search-bar">
              <Suspense fallback={null}>
                <SearchAutocomplete />
              </Suspense>
            </div>
            <nav className="mobile-nav-links">
              <Link href="/shop" className="mobile-nav-link" onClick={closeMenu}>Catalog</Link>
              <Link href="/visual-search" className="mobile-nav-link" onClick={closeMenu}>📸 Snap & Find Cookware Scanner</Link>
              <Link href="/track" className="mobile-nav-link" onClick={closeMenu}>🚚 Track Your Order</Link>
              <Link href="/collections" className="mobile-nav-link" onClick={closeMenu}>Collections</Link>
              <Link href="/craftsmanship" className="mobile-nav-link" onClick={closeMenu}>Craftsmanship & Triply</Link>
              <Link href="/advisor" className="mobile-nav-link" onClick={closeMenu}>Cookware Advisor Quiz</Link>
              <Link href="/exchange" className="mobile-nav-link" onClick={closeMenu}>Old Utensils Exchange</Link>
              <Link href="/b2b" className="mobile-nav-link" onClick={closeMenu}>B2B & Bulk Orders</Link>
              <Link href="/recipes" className="mobile-nav-link" onClick={closeMenu}>Culinary Journal</Link>
              <Link href="/account" className="mobile-nav-link" onClick={closeMenu}>My Account & Orders</Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
