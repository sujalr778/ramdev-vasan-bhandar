import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      "RamdevVasanWebhookSecret2026";

    // 1. Verify Webhook Signature using HMAC-SHA256
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("Razorpay webhook signature verification failed.");
        return NextResponse.json({ message: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;
    const internalOrderId = paymentEntity?.notes?.internalOrderId || orderEntity?.notes?.internalOrderId;

    if (!razorpayOrderId && !internalOrderId) {
      return NextResponse.json({ status: "ignored", message: "No order identifier found" }, { status: 200 });
    }

    await connectToDatabase();

    // Query order by razorpayOrderId or internal MongoDB _id
    const order = razorpayOrderId
      ? await Order.findOne({ razorpayOrderId })
      : await Order.findById(internalOrderId);

    if (!order) {
      return NextResponse.json({ status: "ignored", message: "Order not found in database" }, { status: 200 });
    }

    // 2. Idempotency & State Guard: Paid orders can NEVER regress to failed or touch stock
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ status: "ok", message: "Order already marked as paid" }, { status: 200 });
    }

    // 3. Process Captured / Paid Event
    if (event === "payment.captured" || event === "order.paid") {
      order.paymentStatus = "paid";
      order.status = "confirmed";
      if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
      if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
      await order.save();
      return NextResponse.json({ status: "ok", message: "Order marked as paid via webhook" }, { status: 200 });
    }

    // 4. Process Failed Event (Restores stock ONCE only if not already failed or paid)
    if (event === "payment.failed") {
      if (order.paymentStatus !== "paid" && order.paymentStatus !== "failed") {
        order.paymentStatus = "failed";
        for (const item of order.products) {
          await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
        }
        await order.save();
      }
      return NextResponse.json({ status: "ok", message: "Order marked as failed via webhook" }, { status: 200 });
    }

    return NextResponse.json({ status: "ok", message: `Event ${event} received` }, { status: 200 });

  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ message: "Webhook handler failed", error: (error as Error).message }, { status: 500 });
  }
}
