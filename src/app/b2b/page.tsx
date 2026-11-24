"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function B2BFormContent() {
  const searchParams = useSearchParams();
  const prefillProduct = searchParams.get("product") || "";

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [productName, setProductName] = useState(prefillProduct);
  const [quantity, setQuantity] = useState("50");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactPerson,
          mobile,
          email,
          gstin,
          productName,
          quantity: Number(quantity),
          message
        })
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMsg({ type: "success", text: data.message });
        setCompanyName("");
        setContactPerson("");
        setMobile("");
        setEmail("");
        setGstin("");
        setMessage("");
      } else {
        setResponseMsg({ type: "error", text: data.message || "Failed to submit enquiry." });
      }
    } catch (err) {
      setResponseMsg({ type: "error", text: "Network error submitting enquiry." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "white", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <h2 className="heading-secondary" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        Request Wholesale Quotation
      </h2>

      {responseMsg && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "1.25rem", backgroundColor: responseMsg.type === "success" ? "#f0fdf4" : "#fef2f2", color: responseMsg.type === "success" ? "#15803d" : "#b91c1c", border: `1px solid ${responseMsg.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
          {responseMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Business / Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Royal Caterers / Hotel Grand" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Contact Person Name *</label>
            <input type="text" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="e.g. Rajesh Shah" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Mobile Number *</label>
            <input type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit Indian Mobile" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Email Address *</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="business@domain.com" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>GSTIN (Optional)</label>
            <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="24AAAAA0000A1Z5" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Utensil / Product Name</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Triply Kadai 3L" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Approx Quantity *</label>
            <input type="number" required min="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Enquiry Details & Custom Requirements *</label>
          <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Specify required sizes, customization, expected delivery timeline, and destination city..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }} />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: "12px 28px", fontSize: "0.9375rem" }}>
          {submitting ? "Submitting Request..." : "Submit B2B Enquiry 📦"}
        </button>
      </form>
    </div>
  );
}

export default function B2BPage() {
  return (
    <main className="container" style={{ padding: "3rem 1rem", maxWidth: "900px" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 className="heading-primary" style={{ fontSize: "2rem", marginBottom: "8px" }}>
          B2B & Wholesale Utensil Supply
        </h1>
        <p className="text-muted" style={{ maxWidth: "640px", margin: "0 auto", fontSize: "0.9375rem" }}>
          Direct factory wholesale pricing, GST input tax invoicing, and custom brass/stainless steel cookware sets for Hotels, Restaurants, Caterers (HoReCa), Corporate Gifting, and Retailers.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🏭</div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Direct Manufacturing</h3>
          <p className="text-muted" style={{ fontSize: "0.8125rem", marginTop: "4px" }}>Authentic Ahmedabad commercial cookware.</p>
        </div>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "6px" }}>📄</div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>GST Input Credit</h3>
          <p className="text-muted" style={{ fontSize: "0.8125rem", marginTop: "4px" }}>Tax compliant B2B invoices for business expense claiming.</p>
        </div>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "6px" }}>🚚</div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Pan-India Freight</h3>
          <p className="text-muted" style={{ fontSize: "0.8125rem", marginTop: "4px" }}>Insured bulk cargo transport across all Indian pin codes.</p>
        </div>
      </div>

      <Suspense fallback={<p>Loading enquiry form...</p>}>
        <B2BFormContent />
      </Suspense>
    </main>
  );
}
