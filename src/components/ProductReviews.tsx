"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<any>({ averageRating: 5, totalReviews: 0, ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, reviews: [] });
  const [loading, setLoading] = useState(true);

  // New Review Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const fetchReviews = () => {
    fetch(`/api/products/${productId}/reviews`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData && Array.isArray(resData.reviews)) {
          setData(resData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment })
      });

      const resJson = await res.json();

      if (res.ok) {
        setMsg({ type: "success", text: resJson.message || "Review submitted successfully!" });
        setTitle("");
        setComment("");
        fetchReviews();
      } else {
        setMsg({ type: "error", text: resJson.message || "Failed to submit review." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error submitting review." });
    } finally {
      setSubmitting(false);
    }
  };

  const { averageRating, totalReviews, ratingCounts, reviews } = data;

  return (
    <div style={{ marginTop: "3rem", background: "white", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
      <h2 className="heading-secondary" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Customer Reviews & Ratings
      </h2>

      {/* Ratings Summary Header */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "2rem", marginBottom: "2rem" }}>
        <div style={{ textAlign: "center", background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--foreground)", lineHeight: 1 }}>
            {averageRating}
          </div>
          <div style={{ color: "#eab308", fontSize: "1.25rem", margin: "6px 0" }}>
            {"★".repeat(Math.floor(averageRating))}
            {"☆".repeat(5 - Math.floor(averageRating))}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Based on {totalReviews} review(s)
          </div>
        </div>

        {/* 5-Star Rating Breakdown Bars */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts?.[star] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.875rem" }}>
                <span style={{ width: "40px", fontWeight: 600 }}>{star} ★</span>
                <div style={{ flex: 1, height: "10px", background: "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#eab308", transition: "width 0.3s" }} />
                </div>
                <span style={{ width: "36px", color: "var(--muted)", textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Review Form for Logged-In Users */}
      {session?.user ? (
        <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem" }}>Write a Verified Review</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Note: Reviews are verified against delivered orders to ensure genuine feedback.
          </p>

          {msg && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "1rem", backgroundColor: msg.type === "success" ? "#f0fdf4" : "#fef2f2", color: msg.type === "success" ? "#15803d" : "#b91c1c", border: `1px solid ${msg.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Your Rating *</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)" }}
              >
                <option value={5}>★★★★★ (5 - Excellent)</option>
                <option value={4}>★★★★☆ (4 - Good)</option>
                <option value={3}>★★★☆☆ (3 - Average)</option>
                <option value={2}>★★☆☆☆ (2 - Poor)</option>
                <option value={1}>★☆☆☆☆ (1 - Terrible)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Headline / Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fantastic induction kadai!"
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "0.875rem", fontWeight: 600 }}>Detailed Review *</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding material quality, cooking performance, and durability..."
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "fit-content", padding: "10px 24px" }}>
              {submitting ? "Submitting..." : "Submit Verified Review"}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ padding: "1rem", background: "#f1f5f9", borderRadius: "8px", marginBottom: "2rem", fontSize: "0.875rem", color: "var(--muted)" }}>
          💡 Have you purchased this item? Please <a href="/login" style={{ color: "var(--primary)", textDecoration: "underline" }}>log in</a> to write a verified review.
        </div>
      )}

      {/* Public Verified Reviews List */}
      <div>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
          Customer Feedback ({reviews.length})
        </h3>

        {loading ? (
          <p className="text-muted">Loading product reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted">No verified reviews submitted for this utensil yet. Be the first buyer to review!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((rev: any) => (
              <div key={rev._id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ color: "#eab308", fontSize: "0.9375rem" }}>
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{rev.user}</span>
                    {rev.verifiedPurchase && (
                      <span style={{ fontSize: "0.75rem", background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: "12px", border: "1px solid #bbf7d0", fontWeight: 600 }}>
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rev.title && <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "4px" }}>{rev.title}</div>}
                <div style={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.5 }}>{rev.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
