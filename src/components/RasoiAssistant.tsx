"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import bundledDb from "@/data/db.json";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { getDeliveryTier } from "@/lib/delivery";
import { formatINR } from "@/lib/format";
import styles from "./RasoiAssistant.module.css";

interface ProductItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  description: string;
  material: string;
  capacity?: string;
  stock?: number;
}

interface ActionLink {
  label: string;
  href: string;
  external?: boolean;
  whatsapp?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  products?: ProductItem[];
  actions?: ActionLink[];
}

const ALL_PRODUCTS: ProductItem[] = (bundledDb.products || []) as ProductItem[];

const QUICK_PROMPTS = [
  { label: "🍳 Best Kadai", query: "Best kadai for family of 4" },
  { label: "⚡ Induction Safe", query: "Which products are induction safe?" },
  { label: "💰 Under ₹2,000", query: "Show cookware under 2000" },
  { label: "🔬 Triply vs Cast Iron", query: "Compare Triply vs Cast Iron" },
  { label: "🎁 Gift Sets", query: "Show wedding or gift cookware sets" },
  { label: "🏷️ Offers & Coupons", query: "What coupon or discount offers are available?" },
  { label: "📍 Check Pincode", query: "How do I check delivery for my pincode?" },
  { label: "🚚 Track Order", query: "Track my order" },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  sender: "bot",
  text: "Namaste! 🙏 I'm your Ramdev Rasoi Assistant.\n\nAsk me anything — like \"best kadai for 5 people\", \"under ₹2000\", \"induction safe\", \"Triply vs Cast Iron\", or type your 6-digit pincode to check delivery speed!",
};

function findByIds(ids: string[]): ProductItem[] {
  return ids
    .map((id) => ALL_PRODUCTS.find((p) => p._id === id))
    .filter((p): p is ProductItem => Boolean(p));
}

export default function RasoiAssistant() {
  const pathname = usePathname();
  const { cart, cartTotal, cartCount, addToCart } = useCart();
  const { setPincode } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Hide inside admin dashboard
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleQuickAdd = (product: ProductItem) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category,
    });
    setAddedIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const generateReply = (rawInput: string): Omit<ChatMessage, "id" | "sender"> => {
    const text = rawInput.trim();
    const q = text.toLowerCase();

    // 1. Pincode Detection (exact 6-digit Indian pincode)
    const pinMatch = text.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch) {
      const pin = pinMatch[1];
      const tier = getDeliveryTier(pin);
      setPincode(pin);
      if (tier.isSurat) {
        return {
          text: `${tier.message}\n\n• Zone: ${tier.areaName}\n• Speed: ${tier.badgeText} (${tier.etaText})\n• Shipping: FREE Direct Rider Dispatch from Ramdev Vasan Bhandar, Surat\n• Cash on Delivery (COD): Available`,
          actions: [
            { label: "🛒 Shop Now", href: "/shop" },
            { label: "🚚 Live Surat Tracker", href: "/track" },
          ],
        };
      }
      return {
        text: `${tier.message}\n\n• Estimated Arrival: ${tier.etaText}\n• Free Express Pan-India Shipping\n• Cash on Delivery (COD) & 10-Year Guarantee included.`,
        actions: [{ label: "Browse Cookware →", href: "/shop" }],
      };
    }

    // 2. Cart / Checkout / WhatsApp Order Inquiry
    if (/\b(cart|bag|my order|whatsapp|buy now|checkout)\b/.test(q) && !q.includes("track")) {
      if (cartCount > 0) {
        const remainingForCoupon = Math.max(0, 2999 - cartTotal);
        const itemLines = cart
          .map((item) => `• ${item.name} x${item.quantity} (${formatINR(item.price * item.quantity)})`)
          .join("\n");
        const waText = encodeURIComponent(
          `Hello Ramdev Vasan Bhandar! I would like to order:\n${itemLines}\nTotal: ${formatINR(cartTotal)}`
        );
        return {
          text: `You have ${cartCount} item${cartCount > 1 ? "s" : ""} in your cart totaling ${formatINR(cartTotal)}.\n\n${
            remainingForCoupon > 0
              ? `💡 Add ${formatINR(remainingForCoupon)} more to unlock ₹500 OFF with code RAMDEV500!`
              : "🎉 Your cart qualifies for ₹500 OFF! Use code RAMDEV500 at checkout."
          }`,
          actions: [
            { label: "View Cart →", href: "/cart" },
            { label: "Checkout →", href: "/checkout" },
            { label: "💬 Order via WhatsApp", href: `https://wa.me/919876543210?text=${waText}`, external: true, whatsapp: true },
          ],
        };
      }
      return {
        text: "Your cart is currently empty! Tell me what you're cooking (like biryani, dosa, dal, or a family gift set) and I'll recommend the best Ramdev cookware for you.",
        products: findByIds(["apyel0p", "wizclst"]),
      };
    }

    // 3. Budget / Price Filter Queries ("under 2000", "below 1500", "cheap", "budget")
    const budgetMatch = q.match(/(?:under|below|less than|within|upto|up to|max|budget)\s*[₹rs.\s]*(\d{3,5})/i);
    if (budgetMatch || /\b(cheap|cheapest|affordable|budget|low price)\b/.test(q)) {
      const limit = budgetMatch ? parseInt(budgetMatch[1], 10) : 2000;
      const matches = ALL_PRODUCTS.filter((p) => p.price <= limit).sort((a, b) => a.price - b.price);
      if (matches.length > 0) {
        return {
          text: `Here are our top-rated cookware pieces under ${formatINR(limit)}:`,
          products: matches.slice(0, 4),
          actions: [{ label: `View All Under ${formatINR(limit)} →`, href: `/shop?maxPrice=${limit}` }],
        };
      }
      return {
        text: `Our collection starts at ${formatINR(899)}. Here are our most affordable bestsellers:`,
        products: [...ALL_PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 3),
      };
    }

    // 4. Triply vs Cast Iron / Hard Anodized / Steel Comparison
    if (
      /\b(compare|difference|vs|versus|better)\b/.test(q) ||
      (q.includes("triply") && (q.includes("iron") || q.includes("anodized") || q.includes("normal")))
    ) {
      return {
        text:
          "Here's a quick breakdown to choose the right material:\n\n" +
          "• Triply Stainless Steel (SS 304 + Pure Aluminum Core + SS 430): Best all-rounder for curries, halwa, sabzi & frying. Zero chemical coating, heats evenly without burning, induction-safe & 10-year guarantee.\n\n" +
          "• Pre-Seasoned Cast Iron: Unmatched heat retention for crispy hotel-style dosas, rotis & parathas — naturally adds dietary iron.\n\n" +
          "• Hard Anodized Aluminum: Twice as hard as steel, scratch-resistant & lightweight for quick everyday stir-fries.",
        products: findByIds(["apyel0p", "sigmuh1", "pp1t54a"]),
        actions: [{ label: "Open Side-by-Side Compare →", href: "/compare" }],
      };
    }

    // 5. Family Size Queries ("family of 5", "2 people", "joint family", "small family")
    const familyMatch = q.match(/\b(\d+)\s*(?:people|persons|members|family)\b/) || q.match(/family\s*(?:of\s*)?(\d+)/);
    if (familyMatch || /\b(family|joint family|bachelor|couple|small family|large family)\b/.test(q)) {
      const size = familyMatch ? parseInt(familyMatch[1], 10) : q.includes("joint") || q.includes("large") ? 6 : q.includes("couple") || q.includes("bachelor") ? 2 : 4;
      if (size <= 2) {
        return {
          text: `For ${size <= 2 ? "1–2 people" : "a small household"}, compact fast-heating essentials work best — easy to wash and gas-efficient:`,
          products: findByIds(["pp1t54a", "art_casserole_3l", "sigmuh1"]),
          actions: [{ label: "Take 30s Advisor Quiz →", href: "/advisor" }],
        };
      }
      return {
        text: `For a family of ${size}+, we recommend our heavy-gauge 3.5L Triply Kadai and 5L Induction Pressure Cooker — ideal for daily dal, sabzi, and festive cooking:`,
        products: findByIds(["apyel0p", "wizclst", "grand_master_set_5p"]),
        actions: [{ label: "Build a Custom Set (Save 15%) →", href: "/custom-set" }],
      };
    }

    // 6. Induction / Gas / Cooktop Compatibility
    if (/\b(induction|gas|stove|cooktop|ceramic|electric|magnetic)\b/.test(q)) {
      return {
        text: "Almost our entire flagship range is 100% Induction & Gas compatible with a 360° magnetic encapsulated base!\n\nTop Induction-Ready Bestsellers:",
        products: findByIds(["apyel0p", "wizclst", "art_casserole_3l", "sigmuh1"]),
      };
    }

    // 7. Dish / Recipe-Based Recommendations
    if (/\b(dosa|roti|paratha|cheela|chilla|utthapam|tawa)\b/.test(q)) {
      return {
        text: "For hotel-style crispy paper dosas and soft phulkas, our Pre-Seasoned 10\" Cast Iron Dosa Tawa is our #1 rated pick (4.9★ from 230+ buyers)!",
        products: findByIds(["sigmuh1"]),
        actions: [{ label: "View Masala Dosa Recipe →", href: "/recipes/masala-dosa" }],
      };
    }
    if (/\b(biryani|dum|pulao|handi|gravy|paneer|curry|korma)\b/.test(q)) {
      return {
        text: "For rich gravies and slow-cooked Dum Biryani without sticking to the bottom, choose our 3.5L Triply Kadai or Royal Copper Bottom Handi Set:",
        products: findByIds(["apyel0p", "s9vd77p"]),
        actions: [{ label: "Explore Recipe Journal →", href: "/recipes" }],
      };
    }
    if (/\b(dal|rice|rajma|chole|cooker|pressure|whistle)\b/.test(q)) {
      return {
        text: "Cook dal, rice, and rajma up to 70% faster with our Surgical Grade 18/8 Stainless Steel 5L Pressure Cooker — 100% aluminum-free food contact and induction-ready!",
        products: findByIds(["wizclst"]),
      };
    }
    if (/\b(appam|paniyaram|appe|breakfast|snack)\b/.test(q)) {
      return {
        text: "Make crispy, golden appams & paniyaram with minimal oil using our 12-Cavity Appam Patra with Tempered Glass Lid:",
        products: findByIds(["ke0ai6u"]),
      };
    }
    if (/\b(soup|milk|boil|saucepot|casserole|stew|tea)\b/.test(q)) {
      return {
        text: "For boiling milk without scorching and simmering soups or curries, our Artisan 3L Triply Saucepot Casserole with aroma-lock lid is ideal:",
        products: findByIds(["art_casserole_3l"]),
      };
    }

    // 8. Gift / Wedding / Housewarming / Custom Set
    if (/\b(gift|wedding|marriage|shagun|diwali|housewarming|griha|set|combo|bundle|hamper)\b/.test(q)) {
      return {
        text: "Looking for a luxury gift or kitchen upgrade? Our Grand Master 5-Piece Triply Set comes in premium gift packaging, or you can build a custom 3-piece bundle for 15% OFF (plus free laser engraving on eligible items)!",
        products: findByIds(["grand_master_set_5p", "s9vd77p"]),
        actions: [
          { label: "🎁 Open Gift Finder →", href: "/gift-finder" },
          { label: "🍳 Build Custom Set →", href: "/custom-set" },
        ],
      };
    }

    // 9. Coupons / Offers / Discounts
    if (/\b(coupon|offer|discount|promo|code|sale|deal)\b/.test(q)) {
      return {
        text:
          "Active Ramdev Vasan Bhandar Offers:\n\n" +
          "• Code RAMDEV500 → Flat ₹500 OFF on orders above ₹2,999\n" +
          "• Custom Set Builder → Save 10% on 2 items or 15% on 3 items\n" +
          "• Old Utensils Exchange → Extra credit when trading old brass, steel, or aluminum vessels\n" +
          "• Free Pan-India Express Delivery on all orders!",
        actions: [
          { label: "View All Offers →", href: "/offers" },
          { label: "Custom Set Builder →", href: "/custom-set" },
        ],
      };
    }

    // 10. Order Tracking
    if (/\b(track|tracking|where is|shipment|courier|awb|status|dispatch)\b/.test(q)) {
      return {
        text: "You can track any order live using your Order ID or 10-digit mobile number! Want to try a live demo right now? Click below and try demo order ORD-SRT8842.",
        actions: [{ label: "🚚 Open Live Order Tracker →", href: "/track" }],
      };
    }

    // 11. Delivery / Pincode Question (without a 6-digit number yet)
    if (/\b(delivery|pincode|pin code|shipping|cod|cash on delivery|surat|how long|days)\b/.test(q)) {
      return {
        text: "We deliver across 19,000+ Indian pincodes with Free Express Shipping & Cash on Delivery (COD)!\n\n📍 Just reply with your 6-digit pincode (for example, 395002 or 400001) right here and I'll check exact delivery speed for your area.",
      };
    }

    // 12. Old Utensils Exchange
    if (/\b(exchange|old|scrap|trade|brass|bronze)\b/.test(q)) {
      return {
        text: "Have old brass, bronze, copper, or aluminum utensils? Use our instant Exchange Calculator to see your credit value toward brand-new Triply cookware!",
        actions: [{ label: "🔄 Calculate Exchange Value →", href: "/exchange" }],
      };
    }

    // 13. B2B / Bulk / Wholesale / Hotel / Restaurant
    if (/\b(b2b|bulk|wholesale|hotel|restaurant|corporate|catering|dealer)\b/.test(q)) {
      return {
        text: "We offer special GST-invoiced wholesale rates for hotels, caterers, wedding bulk orders, and corporate gifting!",
        actions: [{ label: "🏢 Open B2B & Bulk Inquiry →", href: "/b2b" }],
      };
    }

    // 14. Warranty / Care / Cleaning / Safe / Non-toxic
    if (/\b(warranty|guarantee|care|clean|wash|season|rust|toxic|safe|steel|304|material)\b/.test(q)) {
      return {
        text:
          "Quality & Care Highlights:\n\n" +
          "• 10-Year Manufacturing Guarantee on all Triply SS 304 cookware.\n" +
          "• 100% Food-Grade Surgical SS 304 interior — zero chemical Teflon or PFOA coating.\n" +
          "• Care tip: Always preheat on low-medium flame, wash with mild soap, and wipe dry after washing (lightly oil Cast Iron after drying).",
        actions: [{ label: "Read Craftsmanship Guide →", href: "/craftsmanship" }],
      };
    }

    // 15. Greetings (English / Hindi / Gujarati)
    if (/^(hi|hello|hey|hii+|namaste|namaskar|kem cho|ram ram|good morning|good afternoon|good evening)\b/i.test(q)) {
      return {
        text: "Namaste! Kem cho? 🙏 Welcome to Ramdev Vasan Bhandar.\n\nHow can I help your kitchen today? You can ask for cookware by dish (dosa, biryani, dal), budget (e.g. \"under 2000\"), enter your 6-digit pincode for delivery speed, or pick a quick topic below!",
      };
    }

    // 16. Direct Product Catalog Search Fallback
    const tokens = q
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !["for", "the", "and", "with", "best", "want", "need", "show", "buy", "price", "good"].includes(t));

    if (tokens.length > 0) {
      const matched = ALL_PRODUCTS.filter((p) => {
        const hay = `${p.name} ${p.category} ${p.material} ${p.description} ${p.capacity || ""}`.toLowerCase();
        return tokens.some((tok) => hay.includes(tok));
      });
      if (matched.length > 0) {
        return {
          text: `I found ${matched.length} matching cookware item${matched.length > 1 ? "s" : ""} for "${text}":`,
          products: matched.slice(0, 4),
          actions: [{ label: "Browse Full Catalog →", href: `/shop?q=${encodeURIComponent(text)}` }],
        };
      }
    }

    // 17. Helpful Fallback
    return {
      text:
        "I'd love to help you find the right cookware! Try asking:\n" +
        "• \"Best kadai for family of 5\"\n" +
        "• \"Show cookware under 2000\"\n" +
        "• \"Triply vs Cast Iron\"\n" +
        "• Your 6-digit pincode (e.g. 395002) for delivery speed\n\nOr talk directly to our Surat store team on WhatsApp:",
      products: findByIds(["apyel0p", "wizclst"]),
      actions: [
        { label: "💬 Chat on WhatsApp", href: "https://wa.me/919876543210?text=Hello%20Ramdev%20Vasan%20Bhandar!%20I%20need%20help%20choosing%20cookware.", external: true, whatsapp: true },
        { label: "🧭 Cookware Advisor Quiz", href: "/advisor" },
      ],
    };
  };

  const sendMessage = (textToSend?: string) => {
    const clean = (textToSend ?? input).trim();
    if (!clean || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: clean,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateReply(clean);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          ...reply,
        },
      ]);
      setIsTyping(false);
    }, 320);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <>
      {!isOpen && (
        <div className={styles.launcherWrap}>
          <button
            type="button"
            className={styles.launcherBtn}
            onClick={() => setIsOpen(true)}
            aria-label="Open Rasoi Assistant"
          >
            <span className={styles.launcherDot} />
            <span>🤖 Ask Rasoi Assistant</span>
          </button>
        </div>
      )}

      {isOpen && (
        <aside className={styles.drawer} aria-label="Ramdev Rasoi Assistant">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.avatar}>🍳</div>
              <div>
                <div className={styles.title}>Rasoi Assistant</div>
                <div className={styles.subtitle}>
                  <span className={styles.statusOnline} />
                  <span>Ramdev Cookware Expert • Instant Help</span>
                </div>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.iconActionBtn}
                onClick={handleReset}
                title="Reset conversation"
              >
                Reset
              </button>
              <button
                type="button"
                className={styles.iconActionBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close Rasoi Assistant"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messages} ref={scrollRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.msgRow} ${
                  msg.sender === "user" ? styles.msgRowUser : styles.msgRowBot
                }`}
              >
                <div
                  className={`${styles.bubble} ${
                    msg.sender === "user" ? styles.bubbleUser : styles.bubbleBot
                  }`}
                >
                  {msg.text}
                </div>

                {msg.products && msg.products.length > 0 && (
                  <div className={styles.productsList}>
                    {msg.products.map((prod) => (
                      <div key={prod._id} className={styles.miniCard}>
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className={styles.miniThumb}
                        />
                        <div className={styles.miniInfo}>
                          <div className={styles.miniName}>{prod.name}</div>
                          <div className={styles.miniMeta}>
                            ★ {prod.rating} {prod.capacity ? `• ${prod.capacity}` : ""}
                          </div>
                          <div className={styles.miniPriceRow}>
                            <span className={styles.miniPrice}>{formatINR(prod.price)}</span>
                            {prod.originalPrice > prod.price && (
                              <span className={styles.miniMrp}>{formatINR(prod.originalPrice)}</span>
                            )}
                          </div>
                        </div>
                        <div className={styles.miniActions}>
                          <button
                            type="button"
                            className={`${styles.addBtn} ${addedIds[prod._id] ? styles.addBtnDone : ""}`}
                            onClick={() => handleQuickAdd(prod)}
                          >
                            {addedIds[prod._id] ? "✓ Added" : "+ Add"}
                          </button>
                          <Link
                            href={`/shop/${prod._id}`}
                            className={styles.viewLink}
                            onClick={() => setIsOpen(false)}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.actions && msg.actions.length > 0 && (
                  <div className={styles.ctaRow}>
                    {msg.actions.map((act) =>
                      act.external ? (
                        <a
                          key={act.label}
                          href={act.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.ctaLink} ${act.whatsapp ? styles.ctaWhatsapp : ""}`}
                        >
                          {act.label}
                        </a>
                      ) : (
                        <Link
                          key={act.label}
                          href={act.href}
                          className={styles.ctaLink}
                          onClick={() => setIsOpen(false)}
                        >
                          {act.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className={styles.typing} aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {/* Quick Topic Chips */}
          <div className={styles.quickBar}>
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                className={styles.quickChip}
                onClick={() => sendMessage(qp.query)}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form className={styles.inputBar} onSubmit={handleSubmit}>
            <input
              type="text"
              className={styles.textInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about kadai, budget, or 6-digit pincode..."
              aria-label="Ask Rasoi Assistant"
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!input.trim() || isTyping}
            >
              Send
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
