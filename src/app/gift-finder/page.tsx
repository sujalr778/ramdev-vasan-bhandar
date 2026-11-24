"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function GiftFinderPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    recipient: "",
    occasion: "",
    budget: ""
  });
  const [isFinding, setIsFinding] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsFinding(true);
      setTimeout(() => {
        setIsFinding(false);
        setStep(4);
      }, 2000);
    }
  };

  const giftRecommendations = [
    {
      id: "gift-bundle-1",
      name: "The Ultimate Kitchen Starter Kit",
      desc: "Perfect for newlyweds or housewarmings. Includes a Triply Kadai, Cast Iron Tawa, and Glass Lid.",
      price: 3999,
      image: "/product-cookware-set.png",
      tag: "Best Match"
    },
    {
      id: "k1",
      name: "Premium Triply Kadai (Gifting Edition)",
      desc: "A beautiful, shiny statement piece for their kitchen.",
      price: 2499,
      image: "/product-kadai.png",
      tag: "Top Rated"
    }
  ];

  return (
    <main className="container" style={{ padding: 'var(--spacing-2xl) 0', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="heading-primary">AI Gift Finder</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Finding the perfect cookware gift has never been easier. Tell us a little about the occasion and we'll handle the rest.
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', maxWidth: '800px', margin: '0 auto' }}>
        
        {step < 4 && !isFinding && (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: '6px', background: step >= i ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', transition: 'background 0.3s ease' }} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>Who are you buying this gift for?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('recipient', 'Spouse / Partner')}>👩‍❤️‍👨 Spouse / Partner</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('recipient', 'Parents')}>👨‍👩‍👧‍👦 Parents</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('recipient', 'Friend')}>🤝 Friend</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('recipient', 'Corporate')}>💼 Corporate</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>What is the occasion?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('occasion', 'Wedding / Anniversary')}>💍 Wedding / Anniversary</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('occasion', 'Housewarming')}>🏠 Housewarming</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('occasion', 'Birthday')}>🎂 Birthday</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('occasion', 'Festival')}>🪔 Festival (Diwali, etc.)</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>What is your budget?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
              <button className="btn-secondary" style={{ height: '60px', fontSize: '1.125rem' }} onClick={() => handleAnswer('budget', 'Under 1500')}>₹500 - ₹1,500</button>
              <button className="btn-secondary" style={{ height: '60px', fontSize: '1.125rem' }} onClick={() => handleAnswer('budget', '1500-3000')}>₹1,500 - ₹3,000</button>
              <button className="btn-secondary" style={{ height: '60px', fontSize: '1.125rem' }} onClick={() => handleAnswer('budget', '3000+')}>₹3,000+</button>
            </div>
          </div>
        )}

        {isFinding && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center', padding: 'var(--spacing-2xl) 0' }}>
            <div style={{ fontSize: '3rem', animation: 'pulse 1s infinite' }}>🎁</div>
            <h2 className="heading-secondary" style={{ marginTop: 'var(--spacing-md)' }}>Curating the perfect gift...</h2>
            <p className="text-muted">Analyzing catalog for {answers.occasion} gifts perfect for {answers.recipient}...</p>
          </div>
        )}

        {step === 4 && !isFinding && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <h2 className="heading-secondary">Perfect Matches Found!</h2>
              <p className="text-muted">We've found the best cookware to make their {answers.occasion} truly special.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-lg)' }}>
              {giftRecommendations.map(gift => (
                <div key={gift.id} style={{ display: 'flex', gap: 'var(--spacing-lg)', background: '#f9fafb', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <div style={{ width: '120px', height: '120px', position: 'relative', background: 'white', borderRadius: 'var(--radius-md)', padding: '8px' }}>
                    <Image src={gift.image} alt={gift.name} fill style={{ objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, width: 'fit-content', marginBottom: '8px' }}>{gift.tag}</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{gift.name}</h3>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{gift.desc}</p>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{gift.price}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => { addToCart({ id: gift.id, name: gift.name, price: gift.price, quantity: 1, image: gift.image }); router.push("/cart"); }} className="btn-primary" style={{ padding: '12px 24px' }}>
                      Gift This
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
              <button onClick={() => { setStep(1); setAnswers({recipient:"", occasion:"", budget:""}); }} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
