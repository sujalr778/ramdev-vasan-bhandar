import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import { getStoreGSTConfig, calculateOrderGST } from "@/lib/gst";
import PrintButton from "@/components/PrintButton";
import { db } from "@/lib/db";


export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <p className="text-muted">Please log in to view this invoice.</p>
      </div>
    );
  }

  const { id } = await params;
  try {
    await connectToDatabase();
  } catch (e) {}

  const orderDoc: any = await db.orders.findById(id);


  if (!orderDoc) {
    notFound();
  }

  const userId = (session.user as any).id;
  const isAdmin = (session.user as any).role === "admin";
  const orderUserId = (orderDoc as any).user?._id ? (orderDoc as any).user._id.toString() : (orderDoc as any).user?.toString();

  if (!isAdmin && orderUserId !== userId) {
    return (
      <div className="container" style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <div style={{ padding: "16px", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: "8px" }}>
          ⚠️ Forbidden: You do not have permission to view this tax invoice.
        </div>
      </div>
    );
  }

  const order: any = {
    ...orderDoc,
    _id: (orderDoc as any)._id.toString()
  };

  const storeConfig = getStoreGSTConfig();
  const addr = typeof order.shippingAddress === "object" ? order.shippingAddress : {};
  const customerState = addr.state || "Gujarat";

  const subtotal = Number(order.subtotal || order.totalAmount || 0);
  const discount = Number(order.discount || 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);

  const gst = calculateOrderGST({ subtotal, discount, customerState });
  const invoiceNumber = `INV-${storeConfig.invoicePrefix}-${order._id.substring(0, 8).toUpperCase()}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <main className="container" style={{ padding: "2rem 1rem", maxWidth: "800px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .invoice-card { border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}} />

      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="heading-secondary" style={{ marginBottom: 0 }}>Tax Invoice</h1>
          <span className="text-muted" style={{ fontSize: "0.875rem" }}>Official GST Billing Document</span>
        </div>
        <PrintButton />
      </div>

      <div className="invoice-card" style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", padding: "2.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        {/* Invoice Header */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #e2e8f0", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginBottom: "4px" }}>
              {storeConfig.storeLegalName}
            </h2>
            <div style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.5, maxWidth: "320px" }}>
              {storeConfig.storeAddress}<br />
              State: {storeConfig.storeState} (Code: {storeConfig.storeStateCode})<br />
              <strong>GSTIN: {storeConfig.storeGstin}</strong>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>TAX INVOICE</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary)", marginTop: "4px" }}>
              {invoiceNumber}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "4px" }}>
              Date: {formattedDate}<br />
              Order ID: #{order._id}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "1.5rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "8px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>Billed To</div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{addr.fullName || order.user?.name || "Customer"}</div>
            <div style={{ fontSize: "0.8125rem", color: "#334155", marginTop: "2px" }}>
              📱 {addr.mobile || "N/A"}<br />
              ✉️ {addr.email || order.user?.email || "N/A"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>Shipping Destination</div>
            <div style={{ fontSize: "0.8125rem", color: "#334155", lineHeight: 1.5 }}>
              {addr.addressLine}<br />
              {addr.city}, {addr.state} – {addr.pincode}<br />
              State Code: {addr.state === storeConfig.storeState ? storeConfig.storeStateCode : "Interstate"}
            </div>
          </div>
        </div>

        {/* Itemized Product Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Item Description</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Qty</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Unit Price</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {order.products?.map((item: any, idx: number) => {
              const prod = item.product || {};
              return (
                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px", fontWeight: 500 }}>{prod.name || "Utensil Product"}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>₹{item.priceAtTime}</td>
                  <td style={{ padding: "10px", textAlign: "right", fontWeight: 600 }}>₹{item.priceAtTime * item.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* GST Tax Summary & Totals */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderTop: "2px solid #e2e8f0", paddingTop: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "#64748b", maxWidth: "340px" }}>
            <div style={{ fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Payment Details</div>
            Method: <strong>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay Online"}</strong><br />
            Payment Status: <strong>{order.paymentStatus?.toUpperCase()}</strong><br />
            {order.razorpayPaymentId && <span>Razorpay Ref: {order.razorpayPaymentId}<br /></span>}
            <span style={{ fontSize: "0.75rem", fontStyle: "italic", marginTop: "6px", display: "block" }}>
              This is a computer-generated tax invoice and requires no signature.
            </span>
          </div>

          <div style={{ width: "280px", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="text-muted">Taxable Amount:</span>
              <span>₹{gst.taxableAmount.toFixed(2)}</span>
            </div>

            {!gst.isInterstate ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span className="text-muted">CGST ({gst.cgstRate}%):</span>
                  <span>₹{gst.cgstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span className="text-muted">SGST ({gst.sgstRate}%):</span>
                  <span>₹{gst.sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span className="text-muted">IGST ({gst.igstRate}%):</span>
                <span>₹{gst.igstAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span className="text-muted">Delivery Fee:</span>
              <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge.toFixed(2)}`}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #0f172a", paddingTop: "8px", marginTop: "6px", fontWeight: 800, fontSize: "1.125rem", color: "#0f172a" }}>
              <span>Grand Total:</span>
              <span style={{ color: "var(--primary)" }}>₹{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
