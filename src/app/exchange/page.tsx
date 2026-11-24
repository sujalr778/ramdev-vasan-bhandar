"use client";

import { useState } from "react";
import Image from "next/image";

export default function ExchangePage() {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
    }
  };

  const handleEstimate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDiscountCode("EXCHANGE250");
      setStep(3);
    }, 2500);
  };

  return (
    <main className="container" style={{ padding: 'var(--spacing-2xl) 0', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
        <h1 className="heading-primary">Old Cookware Exchange Program</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Don't throw away your old pots and pans! Trade them in for an instant discount on brand new, premium cookware. We recycle responsibly.
        </p>
      </div>

      <div style={{ background: 'var(--card-bg)', padding: 'var(--spacing-2xl)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', maxWidth: '700px', margin: '0 auto' }}>
        
        {/* Progress */}
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, height: '6px', background: step >= i ? 'var(--primary)' : 'var(--border)', borderRadius: 'var(--radius-full)', transition: 'background 0.3s ease' }} />
          ))}
        </div>

        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-md)' }}>1. What are you exchanging?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="radio" name="itemType" style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>Old Non-Stick Pan (Scratched/Peeling)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="radio" name="itemType" style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>Burnt Aluminum / Stainless Steel Kadai</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="radio" name="itemType" style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>Rusted Cast Iron Tawa</span>
              </label>
            </div>
            <button onClick={() => setStep(2)} className="btn-primary" style={{ marginTop: 'var(--spacing-lg)', width: '100%', padding: '12px' }}>Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-md)' }}>2. Upload a Photo</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>We use AI to instantly verify the item condition.</p>
            
            <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)', position: 'relative', height: image ? '300px' : 'auto' }}>
              {!image ? (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📷</div>
                  <input type="file" accept="image/*" id="exchange-upload" style={{ display: 'none' }} onChange={handleFileUpload} />
                  <label htmlFor="exchange-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>Take Photo or Browse</label>
                </>
              ) : (
                <>
                  <Image src={image} alt="Old Cookware" fill style={{ objectFit: 'contain' }} />
                  {isProcessing && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '3rem', animation: 'pulse 1s infinite' }}>🤖</div>
                      <h3 style={{ marginTop: 'var(--spacing-md)' }}>Evaluating Condition...</h3>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>Back</button>
              <button onClick={handleEstimate} disabled={!image || isProcessing} className="btn-primary" style={{ flex: 2, padding: '12px', opacity: !image || isProcessing ? 0.5 : 1 }}>Get Exchange Value</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-sm)' }}>🎉</div>
            <h2 className="heading-secondary" style={{ marginBottom: 'var(--spacing-sm)' }}>Your item is approved!</h2>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-xl)' }}>You are eligible for a flat ₹250 discount on your new purchase.</p>
            
            <div style={{ background: '#f3f4f6', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--primary)', marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Your Discount Code</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px' }}>{discountCode}</div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>How it works:</h3>
            <ol style={{ textAlign: 'left', color: 'var(--muted)', margin: '0 auto', maxWidth: '400px', paddingLeft: '20px', marginBottom: 'var(--spacing-xl)' }}>
              <li style={{ marginBottom: '8px' }}>Apply this code during checkout.</li>
              <li style={{ marginBottom: '8px' }}>When your new cookware is delivered, simply hand over your old item to the delivery executive.</li>
            </ol>

            <a href="/shop" className="btn-primary" style={{ display: 'inline-block', padding: '14px 32px', fontSize: '1.1rem' }}>Shop New Cookware Now</a>
          </div>
        )}
      </div>
    </main>
  );
}
