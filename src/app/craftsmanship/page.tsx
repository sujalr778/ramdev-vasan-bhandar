"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Craftsmanship.module.css";

export default function CraftsmanshipPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    topic: "Product Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <main className={styles.page}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <div className="container">
          <h1 className={styles.pageTitle}>
            Forged in Tradition. Engineered for Precision.
          </h1>
          <p className={styles.pageSubtitle}>
            Every EPICUREAN piece is a testament to our unwavering commitment to quality. From the raw materials to the final polish, we invest lifetimes into crafting tools that will last yours.
          </p>
        </div>
      </section>

      {/* Visual Collage Grid */}
      <section className="container">
        <div className={styles.visualGrid}>
          {/* Large Left Foundry Feature */}
          <div className={styles.foundryCard}>
            <Image
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop"
              alt="The Foundry Master Craftsman"
              fill
              className={styles.gridImg}
              priority
            />
            <div className={styles.foundryOverlay}>
              <h3 className={styles.foundryTitle}>The Foundry</h3>
              <p className={styles.foundryCaption}>
                Where raw elemental power meets meticulous human intention.
              </p>
            </div>
          </div>

          {/* Right Column 2 Stacked Images */}
          <div className={styles.stackedCol}>
            <div className={styles.toolsCard}>
              <Image
                src="https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=800&auto=format&fit=crop"
                alt="Artisan Knives & Culinary Flatlay"
                fill
                className={styles.gridImg}
              />
            </div>
            <div className={styles.moltenCard}>
              <Image
                src="https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?q=80&w=800&auto=format&fit=crop"
                alt="Molten Metal Foundry Pouring"
                fill
                className={styles.gridImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Concierge & Contact Section */}
      <section className={styles.conciergeSection}>
        <div className="container">
          <div className={styles.conciergeGrid}>
            {/* Left Column: At Your Service */}
            <div className={styles.serviceCol}>
              <h2 className={styles.serviceTitle}>At Your Service</h2>
              <p className={styles.serviceDesc}>
                Our concierges are available to assist you with product inquiries, professional program details, and lifetime care guidance.
              </p>

              <div className={styles.contactDetails}>
                <div className={styles.contactBlock}>
                  <span className={styles.blockLabel}>Inquiries</span>
                  <a href="mailto:concierge@epicurean.com" className={styles.blockValue}>
                    concierge@epicurean.com
                  </a>
                  <a href="tel:18005550199" className={styles.blockSubValue}>
                    +1 (800) 555-0199
                  </a>
                </div>

                <div className={styles.contactBlock}>
                  <span className={styles.blockLabel}>Hours</span>
                  <span className={styles.blockValue}>Monday - Friday</span>
                  <span className={styles.blockSubValue}>9:00 AM - 6:00 PM EST</span>
                </div>
              </div>

              {/* Flagship Location Card */}
              <div className={styles.flagshipCard}>
                <div className={styles.mapGraphic}>
                  <div className={styles.mapMarker}>
                    <span className={styles.pinDot}></span>
                    <span className={styles.pinLabel}>THE FLAGSHIP</span>
                  </div>
                  <div className={styles.mapGridLines}></div>
                </div>
                <div className={styles.flagshipInfo}>
                  <div className={styles.flagshipHeading}>FLAGSHIP LOCATION</div>
                  <div className={styles.flagshipAddress}>762 Fifth Avenue, New York, NY 10019</div>
                  <div className={styles.flagshipPhone}>Contact: +1 (212) 773-8200</div>
                  <div className={styles.flagshipFooter}>OUR HERITAGE & CONTACT</div>
                </div>
              </div>
            </div>

            {/* Right Column: Send a Message Form */}
            <div className={styles.formCol}>
              <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Send a Message</h3>

                {submitted ? (
                  <div className={styles.successBox}>
                    <h4>Inquiry Received</h4>
                    <p>Thank you for reaching out. An EPICUREAN concierge will reply to {formData.email} within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.inquiryForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.fieldLabel}>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jane Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={styles.inputField}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.fieldLabel}>Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={styles.inputField}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.fieldLabel}>Topic</label>
                      <select
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className={styles.selectField}
                      >
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Professional Program">Professional Program</option>
                        <option value="Care & Restoration">Care & Restoration</option>
                        <option value="Custom Order">Custom Order</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.fieldLabel}>Message</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="How can we assist you today?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={styles.textareaField}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px" }}>
                      Submit Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
