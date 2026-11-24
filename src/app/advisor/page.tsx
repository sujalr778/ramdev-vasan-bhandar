"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import { IProduct } from "@/models/Product";

export default function AdvisorPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    cooking: "",
    stove: "",
    people: "",
    budget: ""
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // Handlers
  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Final step, calculate result
      setIsCalculating(true);
      setTimeout(() => {
        setIsCalculating(false);
        setStep(5); // Result step
      }, 1500);
    }
  };

  const getRecommendation = () => {
    // Simple heuristic based on answers
    let title = "Premium Triply Stainless Steel Kadai";
    let size = "24cm (2.5L)";
    let desc = "Safe for both Gas & Induction, perfect for everyday cooking, and extremely durable.";
    let link = "/shop/apyel0p"; // Link to the kadai

    if (answers.people === "5-6" || answers.people === "7+") {
      size = "28cm (4L)";
    }
    if (answers.cooking === "Dosa") {
      title = "Cast Iron Dosa Tawa";
      desc = "The perfect flat surface for crispy dosas, retains heat beautifully.";
      link = "/shop/sigmuh1";
    }
    if (answers.cooking === "Deep Frying") {
      title = "Hard Anodized Deep Fry Pan";
      desc = "Deep curved sides to prevent oil splatter, metal spoon friendly.";
      link = "/shop/pp1t54a";
    }

    return { title, size, desc, link };
  };

  const rec = getRecommendation();

  return (
    <main className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="heading-primary">AI Kitchen Advisor</h1>
        <p className="text-muted">Answer 4 quick questions and we'll calculate the perfect cookware and size for your exact needs.</p>
      </div>

      <div style={{ background: 'var(--card-bg)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>

        {/* Progress Bar */}
        {step < 5 && !isCalculating && (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: 1, height: '6px', background: step >= i ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', transition: 'background 0.3s ease' }} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>1. What are you cooking most often?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('cooking', 'Roti / Dosa')}>🫓 Roti / Dosa</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('cooking', 'Biryani')}>🥘 Biryani</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('cooking', 'Curry')}>🍛 Curry / Gravy</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('cooking', 'Deep Frying')}>🍟 Deep Frying</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem', gridColumn: 'span 2' }} onClick={() => handleAnswer('cooking', 'Daily Cooking')}>👨‍🍳 Daily General Cooking</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>2. What type of stove do you use?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('stove', 'Gas')}>🔥 Gas Stove</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('stove', 'Induction')}>⚡ Induction Cooktop</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem', gridColumn: 'span 2' }} onClick={() => handleAnswer('stove', 'Both')}>🍳 Both / Not Sure</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>3. How many people do you cook for?</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>This helps us calculate the exact size/capacity you need.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('people', '1-2')}>1-2 People</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('people', '3-4')}>3-4 People</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('people', '5-6')}>5-6 People</button>
              <button className="btn-secondary" style={{ height: '80px', fontSize: '1.125rem' }} onClick={() => handleAnswer('people', '7+')}>7+ People</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>4. What is your budget?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
              <button className="btn-secondary" style={{ height: '60px', fontSize: '1.125rem' }} onClick={() => handleAnswer('budget', '500-1000')}>₹500 - ₹1,000</button>
              <button className="btn-secondary" style={{ height: '60px', fontSize: '1.125rem' }} onClick={() => handleAnswer('budget', '1000-2500')}>₹1,000 - ₹2,500</button>
              <button className="btn-secondary" style={{ height: '60px', fontSize: '1.125rem' }} onClick={() => handleAnswer('budget', '2500+')}>₹2,500+</button>
            </div>
          </div>
        )}

        {isCalculating && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center', padding: 'var(--spacing-2xl) 0' }}>
            <div style={{ fontSize: '3rem', animation: 'pulse 1s infinite' }}>🤖</div>
            <h2 className="heading-secondary" style={{ marginTop: 'var(--spacing-md)' }}>Calculating the best match...</h2>
            <p className="text-muted">Analyzing catalog based on your {answers.cooking} and {answers.people} people size requirement...</p>
          </div>
        )}

        {step === 5 && !isCalculating && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <span style={{ fontSize: '3rem' }}>✨</span>
              <h2 className="heading-secondary" style={{ marginTop: 'var(--spacing-md)' }}>Best match for you!</h2>
              <p className="text-muted">Based on your answers, here is our recommendation.</p>
            </div>

            <div style={{ background: '#f9fafb', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', textAlign: 'left', marginBottom: 'var(--spacing-xl)', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                Recommended Size: {rec.size}
              </div>
              <h3 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.5rem' }}>{rec.title}</h3>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>{rec.desc}</p>

              <Link href={rec.link} className="btn-primary" style={{ display: 'inline-block', textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>View Product Details</Link>
            </div>

            <button onClick={() => { setStep(1); setAnswers({ cooking: "", stove: "", people: "", budget: "" }); }} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
